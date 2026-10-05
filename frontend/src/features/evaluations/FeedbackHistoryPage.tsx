import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { CoachFeedback } from './types'

// TODO: fetch from the backend once a feedback endpoint exists.
export default function FeedbackHistoryPage() {
  const feedback: CoachFeedback[] = []
  const sorted = [...feedback].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Coach feedback</h1>

        {sorted.length === 0 ? (
          <p className="mt-6 text-sm text-ink-soft">No feedback yet.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {sorted.map((item) => (
              <li key={item.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-ink">{item.subject}</p>
                  {!item.read && (
                    <span className="flex-none rounded-full bg-accent/10 border border-accent/40 px-2 py-0.5 text-xs font-medium text-red-400">
                      New
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{item.message}</p>
                <p className="mt-2 text-xs text-ink-mute">{new Date(item.date).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
