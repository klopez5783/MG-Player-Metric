import { Link, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { useAssignedDrills } from './useGetAssignedDrill'

export default function DrillDetailPage() {
  const { drillId } = useParams<{ drillId: string }>()
  const { drills, loading, error } = useAssignedDrills()
  // The route param is a string; assignment ids are numbers.
  const drill = drills.find((d) => d.id === Number(drillId))

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/player/drills" className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← Back to drills
        </Link>

        {loading ? (
          <p className="mt-6 text-sm text-ink-mute">Loading drill…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : !drill ? (
          <p className="mt-6 text-sm text-ink-soft">This drill couldn't be found.</p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold text-ink">{drill.drillName}</h1>
            <p className="mt-1 text-sm text-ink-mute">
              {drill.dueDate ? `Due ${formatDate(drill.dueDate)}` : 'No due date'}
              {drill.durationMinutes ? ` · ${drill.durationMinutes} min` : ''}
            </p>

            {drill.coachNote && (
              <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
                <h2 className="text-sm font-semibold text-ink">Note from your coach</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{drill.coachNote}</p>
              </section>
            )}

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Instructions</h2>
              {drill.equipment && <p className="mt-2 text-xs text-ink-mute">Equipment: {drill.equipment}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{drill.instructions ?? '—'}</p>
              {drill.demoVideoUrl && (
                <a href={drill.demoVideoUrl} target="_blank" rel="noreferrer"
                   className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
                  Watch demo video ↗
                </a>
              )}
            </section>

            {/* keep your existing "Submit your video" section here */}
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}

// "2026-11-20" -> "Nov 20, 2026". A date-only string is read as UTC by
// new Date(), which shows the previous day in US timezones, so build it from
// the parts in local time instead.
function formatDate(value: string): string {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
