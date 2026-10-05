import { Link, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { Drill } from '../evaluations/types'

// TODO: fetch the real drill by id once a drill-assignment endpoint exists,
// and wire the upload button to a real video-submission endpoint.
export default function DrillDetailPage() {
  const { drillId } = useParams<{ drillId: string }>()
  const drills: Drill[] = []
  const drill = drills.find((d) => d.id === drillId)

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/player/drills" className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← Back to drills
        </Link>

        {!drill ? (
          <p className="mt-6 text-sm text-ink-soft">You don't have any drills yet.</p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold text-ink">{drill.name}</h1>
            <p className="mt-1 text-sm text-ink-mute">
              Targets {drill.targetSkill} · due {new Date(drill.dueDate).toLocaleDateString()}
            </p>

            <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Instructions</h2>
              <p className="mt-2 text-sm text-ink-soft">{drill.instructions}</p>
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Submit your video</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Video upload isn't connected yet — this is where you'll add your clip and an optional
                note for your coach.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink opacity-60"
              >
                Upload video
              </button>
            </section>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
