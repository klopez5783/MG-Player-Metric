import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import {
  getCoachDrillAssignments,
  type AssignedDrillResponse,
  type CoachReviewStatus,
} from '../../../api/backend'

// One cache per status, kept between page visits so the dashboard, the
// review queue and the review page share each list instead of refetching it.
const caches: Partial<Record<CoachReviewStatus, { userId: string; reviews: AssignedDrillResponse[] }>> = {}

// The coach's drill assignments in one state: 'submitted' (waiting for
// review) or 'reviewed' (past feedback).
export function useCoachReviews(status: CoachReviewStatus) {
  const { session } = useAuth()
  const userId = session?.user.id
  const cache = caches[status]
  const cached = cache && cache.userId === userId ? cache : null

  const [reviews, setReviews] = useState<AssignedDrillResponse[]>(cached?.reviews ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getCoachDrillAssignments(session.access_token, status)
      .then((data) => {
        caches[status] = { userId: session.user.id, reviews: data }
        if (!cancelled) setReviews(data)
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached list.
        const hasCached = caches[status]?.userId === session.user.id
        if (!cancelled && !hasCached) {
          setError(err instanceof Error ? err.message : 'Could not load reviews.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session, status])

  return { reviews, loading, error }
}

// Called after a review is saved: takes it out of the queue and puts it at
// the top of the history, so both tabs are right before the next refresh.
export function moveToReviewed(review: AssignedDrillResponse, comment: string | null) {
  const pending = caches.submitted
  if (pending) {
    caches.submitted = { ...pending, reviews: pending.reviews.filter((r) => r.id !== review.id) }
  }
  const reviewed = caches.reviewed
  if (reviewed) {
    const updated: AssignedDrillResponse = {
      ...review,
      status: 'reviewed',
      coachReviewComment: comment,
      reviewedAt: new Date().toISOString(),
    }
    caches.reviewed = { ...reviewed, reviews: [updated, ...reviewed.reviews] }
  }
}
