import { Link } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { AssignedDrillResponse } from '../../api/backend'
import { useAssignedDrills } from './useGetAssignedDrill'

type AssignmentStatus = AssignedDrillResponse['status']

const STATUS_LABEL: Record<AssignmentStatus, string> = {
  assigned: 'To do',
  submitted: 'Submitted',
  reviewed: 'Reviewed',
}

const STATUS_STYLE: Record<AssignmentStatus, string> = {
  assigned: 'bg-canvas text-ink-soft border border-line',
  submitted: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  reviewed: 'bg-green-500/10 text-green-400 border border-green-500/30',
}

// The logged-in player's drill assignments, soonest due first. Drills with
// no due date go last.
export default function PlayerDrillsPage() {
  const { drills, loading, error } = useAssignedDrills()
  const sorted = [...drills].sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Your drills</h1>

        {loading ? (
          <p className="mt-6 text-sm text-ink-mute">Loading drills…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : sorted.length === 0 ? (
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
                    <p className="text-sm font-medium text-ink">{drill.drillName}</p>
                    <p className="text-xs text-ink-mute">
                      {drill.dueDate ? `Due ${formatDate(drill.dueDate)}` : 'No due date'}
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

// "2026-11-20" -> "Nov 20, 2026", built from the parts in local time so the
// day doesn't shift back in US timezones (new Date("2026-11-20") is UTC).
function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
