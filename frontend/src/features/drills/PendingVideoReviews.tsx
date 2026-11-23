import { Link } from 'react-router'
import { useCoachReviews } from './hooks/useCoachReviews'

// The coach's submitted drills waiting for review, oldest first so nothing
// sits unreviewed. Used on the dashboard and the queue's Pending tab.
export default function PendingVideoReviews() {
  const { reviews, loading, error } = useCoachReviews('submitted')
  const sorted = [...reviews].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">
        Pending video reviews{sorted.length > 0 ? ` (${sorted.length})` : ''}
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-ink-mute">Loading reviews…</p>
      ) : error ? (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      ) : !sorted || sorted.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing waiting on you.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((review) => (
            <li key={review.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">{review.playerName}</p>
                <p className="text-xs text-ink-mute">
                  {review.drillName} · submitted {new Date(review.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Link
                to={`/coach/reviews/${review.id}`}
                className="flex-none rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-hover"
              >
                Review
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
