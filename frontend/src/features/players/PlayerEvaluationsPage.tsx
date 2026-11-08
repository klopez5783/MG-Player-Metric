import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { getPlayerEvaluations, type EvaluationSummary } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { useCoachRoster } from './useCoachRoster'

// One player's evaluation history, newest first. Each row opens the full
// evaluation on EvaluationDetailPage.
export default function PlayerEvaluationsPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const { session } = useAuth()
  const { roster } = useCoachRoster()
  const [evaluations, setEvaluations] = useState<EvaluationSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  // The name comes from the roster the coach already has, rather than the
  // evaluations response.
  const player = roster.find((p) => p.id === playerId)

  useEffect(() => {
    if (!session || !playerId) return
    let cancelled = false

    getPlayerEvaluations(session.access_token, playerId)
      .then((data) => {
        if (!cancelled) setEvaluations(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load evaluations.')
      })

    return () => {
      cancelled = true
    }
  }, [session, playerId])

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/coach/players" className="text-sm text-ink-mute hover:text-ink">
          ← Players
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-ink">
            {player?.name ?? 'Player'} · Evaluations
          </h1>
          <Link
            to={`/coach/evaluations/start?playerId=${playerId}`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active"
          >
            New evaluation
          </Link>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        ) : !evaluations ? (
          <p className="mt-4 text-sm text-ink-mute">Loading evaluations…</p>
        ) : (
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
            {evaluations.length === 0 && (
              <li className="px-4 py-6 text-sm text-ink-soft">No evaluations yet.</li>
            )}
            {evaluations.map((evaluation) => (
              <li key={evaluation.id}>
                <Link
                  to={`/coach/evaluations/${evaluation.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-canvas"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{formatDate(evaluation.evaluationDate)}</p>
                    <p className="text-xs text-ink-mute">{capitalize(evaluation.evaluationType)} evaluation</p>
                  </div>
                  <span className="text-lg font-semibold text-ink">{evaluation.overallRating ?? '—'}</span>
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

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
