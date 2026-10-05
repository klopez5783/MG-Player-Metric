import { Link } from 'react-router'
import type { PendingVideoReview } from '../evaluations/types'

export default function PendingVideoReviews({ reviews }: { reviews: PendingVideoReview[] }) {
  const sorted = [...reviews].sort((a, b) => a.submittedDate.localeCompare(b.submittedDate))

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">
        Pending video reviews{sorted.length > 0 ? ` (${sorted.length})` : ''}
      </h2>

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing waiting on you.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((review) => (
            <li key={review.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">{review.playerName}</p>
                <p className="text-xs text-ink-mute">
                  {review.drillName} · submitted {new Date(review.submittedDate).toLocaleDateString()}
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
