import { Link } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
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

// TODO: fetch from the backend once a drill-assignment endpoint exists.
export default function PlayerDrillsPage() {
  const drills: Drill[] = []
  const sorted = [...drills].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Your drills</h1>

        {sorted.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">No drills assigned yet.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
            {sorted.map((drill) => (
              <li key={drill.id}>
                <Link
                  to={`/player/drills/${drill.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-surface-hover"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{drill.name}</p>
                    <p className="text-xs text-ink-mute">
                      {drill.targetSkill} · due {new Date(drill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[drill.status]}`}
                  >
                    {STATUS_LABEL[drill.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
