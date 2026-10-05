import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { Evaluation } from './types'
import { scoreTier } from './scoreTier'
import StrengthsWeaknesses from './StrengthsWeaknesses'

// TODO: fetch the real evaluation once GET /players/me/evaluation exists,
// and once more than one exists, add an actual trend chart (score over time
// per attribute) in place of the current snapshot.
function getEvaluation(): Evaluation | null {
  return null
}

export default function ProgressPage() {
  const evaluation = getEvaluation()

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Progress</h1>

        {!evaluation ? (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-sm text-ink-soft">
              You don't have an evaluation yet. Once your coach completes one, your progress will show
              here.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Current snapshot</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Trend charts will show here once you have more than one evaluation. For now, here's
                where each attribute stands as of {new Date(evaluation.date).toLocaleDateString()}.
              </p>

              <ul className="mt-4 space-y-3">
                {evaluation.attributes.map((attribute) => {
                  const tier = scoreTier(attribute.score)
                  return (
                    <li key={attribute.key}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-ink-soft">{attribute.label}</span>
                        <span className={`text-sm font-semibold ${tier.text}`}>{attribute.score}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${attribute.score}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <StrengthsWeaknesses strengths={evaluation.strengths} weaknesses={evaluation.weaknesses} />
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
