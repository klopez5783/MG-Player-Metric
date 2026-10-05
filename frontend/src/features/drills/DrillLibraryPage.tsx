import { Link } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { DrillLibraryItem } from './types'

// TODO: fetch from a real drill-library endpoint, and wire "Assign" through
// to /coach/drills/assign with the drill pre-selected.
export default function DrillLibraryPage() {
  const drills: DrillLibraryItem[] = []

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ink">Drill library</h1>
          <Link
            to="/coach/drills/assign"
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active"
          >
            Assign a drill
          </Link>
        </div>

        {drills.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">No drills in the library yet.</p>
        ) : (
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {drills.map((drill) => (
              <li key={drill.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{drill.name}</p>
                  <span className="flex-none rounded-full border border-line bg-canvas px-2 py-0.5 text-xs text-ink-mute">
                    {drill.category}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-soft">{drill.description}</p>
                <p className="mt-2 text-xs text-ink-mute">Targets: {drill.targetSkill}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
