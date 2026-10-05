import { Link } from 'react-router'
import type { MajorAttribute } from './types'
import { scoreTier } from './scoreTier'

export default function AttributeGrid({ attributes }: { attributes: MajorAttribute[] }) {
  if (attributes.length === 0) {
    return <p className="text-sm text-ink-soft">No attributes scored yet.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attributes.map((attribute) => {
        const tier = scoreTier(attribute.score)
        return (
          <Link
            key={attribute.key}
            to={`/players/attributes/${attribute.key}`}
            className="rounded-xl border border-line bg-surface p-4 transition hover:border-ink-mute hover:bg-surface-hover"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-md font-medium text-ink-soft">{attribute.label.toUpperCase()}</span>
              <span className={`text-lg font-semibold ${tier.text}`}>{attribute.score}</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
              <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${attribute.score}%` }} />
            </div>
          </Link>
        )
      })}
    </div>
  )
}
