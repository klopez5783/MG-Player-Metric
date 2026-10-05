import type { Drill, DrillStatus } from '../evaluations/types'

const STATUS_LABEL: Record<DrillStatus, string> = {
  not_started: 'Not started',
  submitted: 'Submitted',
  needs_video: 'Needs video',
}

const STATUS_STYLE: Record<DrillStatus, string> = {
  not_started: 'bg-canvas text-ink-soft border border-line',
  submitted: 'bg-green-500/10 text-green-400 border border-green-500/30',
  needs_video: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
}

export default function ActiveDrills({ drills }: { drills: Drill[] }) {
  const sorted = [...drills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="text-sm font-semibold text-ink">Assigned drills</h3>
      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">No drills assigned right now.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {sorted.map((drill) => (
            <li key={drill.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-ink">{drill.name}</p>
                <p className="text-xs text-ink-mute">
                  Due {new Date(drill.dueDate).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`flex-none rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[drill.status]}`}
              >
                {STATUS_LABEL[drill.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
