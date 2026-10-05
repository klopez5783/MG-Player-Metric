import { Link, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { Evaluation } from './types'
import { scoreTier } from './scoreTier'

// TODO: fetch the real evaluation and find the attribute by key once a
// GET /players/me/evaluation endpoint exists, and add real coach comments +
// a score-over-time history.
function getEvaluation(): Evaluation | null {
  return null
}

export default function AttributeDetailPage() {
  const { attributeKey } = useParams<{ attributeKey: string }>()
  const evaluation = getEvaluation()
  const attribute = evaluation?.attributes.find((a) => a.key === attributeKey)

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/player" className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← Back to dashboard
        </Link>

        {!evaluation ? (
          <p className="mt-6 text-sm text-ink-soft">
            You don't have an evaluation yet, so there's nothing to show for this attribute.
          </p>
        ) : !attribute ? (
          <p className="mt-6 text-sm text-ink-soft">Unknown attribute.</p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline justify-between">
              <h1 className="text-2xl font-semibold text-ink">{attribute.label}</h1>
              <span className={`text-2xl font-semibold ${scoreTier(attribute.score).text}`}>
                {attribute.score}
              </span>
            </div>

            <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Sub-attributes</h2>
              <ul className="mt-4 space-y-4">
                {attribute.subAttributes.map((sub) => {
                  const tier = scoreTier(sub.score)
                  return (
                    <li key={sub.label}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-ink-soft">{sub.label}</span>
                        <span className={`text-sm font-semibold ${tier.text}`}>{sub.score}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${sub.score}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Coach comments</h2>
              <p className="mt-2 text-sm text-ink-soft">No comments yet for this attribute.</p>
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">History</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Last evaluated {new Date(evaluation.date).toLocaleDateString()} — earlier evaluations will
                show here once more than one exists.
              </p>
            </section>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
