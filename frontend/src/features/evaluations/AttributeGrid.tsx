import { Link } from 'react-router'
import type { AttributeRatingResponse } from '../../api/backend'
import { scoreTier } from './scoreTier'

// One tile per attribute, linking to its sub-attribute breakdown. Ratings
// are 1–10; scoreTier and the bar width work on 0–100.
export default function AttributeGrid({ attributes }: { attributes: AttributeRatingResponse[] }) {
  if (attributes.length === 0) {
    return <p className="text-sm text-ink-soft">No attributes scored yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attributes.map((attribute) => {
        const percent = (attribute.rating ?? 0) * 10
        const tier = scoreTier(percent)
        return (
          <Link
            key={attribute.attributeId}
            to={`/players/attributes/${attribute.attributeId}`}
            className="rounded-xl border border-line bg-surface p-4 transition hover:border-ink-mute hover:bg-surface-hover"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-md font-medium text-ink-soft">{attribute.name.toUpperCase()}</span>
              <span className={`text-lg font-semibold ${attribute.rating != null ? tier.text : 'text-ink-mute'}`}>
                {attribute.rating ?? '—'}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
              <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${percent}%` }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
