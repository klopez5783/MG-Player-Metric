import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { getCompletedAssignedDrills, type AssignedDrillResponse } from '../../../api/backend'

// Kept between page visits so the home page, the review queue and the
// review page share one list instead of each fetching it.
let cache: { userId: string; reviews: AssignedDrillResponse[] } | null = null

// The coach's submitted drills that are waiting for review.
export function useGetPendingReviews() {
  const { session } = useAuth()
  const userId = session?.user.id
  const cached = cache && cache.userId === userId ? cache : null

  const [reviews, setReviews] = useState<AssignedDrillResponse[]>(cached?.reviews ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getCompletedAssignedDrills(session.access_token)
      .then((data) => {
        cache = { userId: session.user.id, reviews: data }
        if (!cancelled) setReviews(data)
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached list.
        const hasCached = cache?.userId === session.user.id
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
  }, [session])

  return { reviews, loading, error }
}

// Called after a review is saved, so the queue doesn't still list it while
// the next background refresh is in flight.
export function removeFromPendingReviews(assignmentId: number) {
  if (!cache) return
  cache = { ...cache, reviews: cache.reviews.filter((r) => r.id !== assignmentId) }
}
