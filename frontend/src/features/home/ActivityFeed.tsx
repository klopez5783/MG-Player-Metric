import type { ActivityItem, ActivityType } from './types'

const TYPE_DOT: Record<ActivityType, string> = {
  video_submitted: 'bg-accent',
  evaluation_completed: 'bg-green-500',
  drill_assigned: 'bg-amber-500',
}

export default function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">Recent activity</h2>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Nothing new since your last visit.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {sorted.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 flex-none rounded-full ${TYPE_DOT[item.type]}`} aria-hidden="true" />
              <div>
                <p className="text-sm text-ink">{item.description}</p>
                <p className="text-xs text-ink-mute">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
