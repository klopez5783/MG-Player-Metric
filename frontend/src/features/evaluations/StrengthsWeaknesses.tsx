import type { StrengthWeakness } from './types'

export default function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: {
  strengths: StrengthWeakness[]
  weaknesses: StrengthWeakness[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <List title="Strengths" items={strengths} tone="green" />
      <List title="Areas to work on" items={weaknesses} tone="accent" />
    </div>
  )
}

function List({
  title,
  items,
  tone,
}: {
  title: string
  items: StrengthWeakness[]
  tone: 'green' | 'accent'
}) {
  const dot = tone === 'green' ? 'bg-green-500' : 'bg-accent'
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li key={item.attributeKey} className="flex gap-2">
            <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${dot}`} aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-ink">{item.label}</p>
              <p className="text-sm text-ink-soft">{item.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
