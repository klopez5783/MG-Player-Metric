import { Link } from 'react-router'
import { useCoachReviews } from './hooks/useCoachReviews'

// The coach's past reviews, most recently reviewed first, with the start of
// the feedback they gave. Opens the review page read-only.
export default function ReviewedVideoReviews() {
  const { reviews, loading, error } = useCoachReviews('reviewed')
  const sorted = [...reviews].sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt))

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">
        Reviewed{sorted.length > 0 ? ` (${sorted.length})` : ''}
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-ink-mute">Loading reviews…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      ) : sorted.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">You haven't reviewed any videos yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((review) => (
            <li key={review.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{review.playerName}</p>
                <p className="text-xs text-ink-mute">
                  {review.drillName} · reviewed {new Date(review.reviewedAt).toLocaleDateString()}
                </p>
                <p className="mt-1 truncate text-xs text-ink-soft">
                  {review.coachReviewComment ?? 'No comment left.'}
                </p>
              </div>
              <Link
                to={`/coach/reviews/${review.id}`}
                className="flex-none rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-hover"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
