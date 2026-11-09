import { Link, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { scoreTier } from './scoreTier'
import { useMyLatestEvaluation } from './useMyLatestEvaluation'

// One attribute from the player's latest evaluation: its sub-attribute
// ratings and the coach's comments. Opened from a tile in AttributeGrid.
// TODO: add a score-over-time history once more than one evaluation exists.
export default function AttributeDetailPage() {
  const { attributeId } = useParams<{ attributeId: string }>()
  const { evaluation, loading, error } = useMyLatestEvaluation()
  const attribute = evaluation?.attributes.find((a) => a.attributeId === Number(attributeId))
  // Only sub-attributes the coach left a note on.
  const comments = attribute
    ? [
        ...(attribute.comment ? [{ label: attribute.name, text: attribute.comment }] : []),
        ...attribute.subAttributes
          .filter((sub) => sub.comment)
          .map((sub) => ({ label: sub.name, text: sub.comment as string })),
      ]
    : []

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link to="/player" className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← Back to dashboard
        </Link>

        {loading ? (
          <p className="mt-6 text-sm text-ink-mute">Loading…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : !evaluation ? (
          <p className="mt-6 text-sm text-ink-soft">
            You don't have an evaluation yet, so there's nothing to show for this attribute.
          </p>
        ) : !attribute ? (
          <p className="mt-6 text-sm text-ink-soft">Unknown attribute.</p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline justify-between">
              <h1 className="text-2xl font-semibold text-ink">{attribute.name}</h1>
              <span
                className={`text-2xl font-semibold ${
                  attribute.rating != null ? scoreTier(attribute.rating * 10).text : 'text-ink-mute'
                }`}
              >
                {attribute.rating ?? '—'}
              </span>
            </div>

            <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Sub-attributes</h2>
              <ul className="mt-4 space-y-4">
                {attribute.subAttributes.map((sub) => {
                  // Ratings are 1–10; scoreTier and the bar width work on 0–100.
                  const tier = scoreTier(sub.rating * 10)
                  return (
                    <li key={sub.subAttributeId}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-ink-soft">{sub.name}</span>
                        <span className={`text-sm font-semibold ${tier.text}`}>{sub.rating}</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${sub.rating * 10}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Coach comments</h2>
              {comments.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No comments yet for this attribute.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {comments.map((comment) => (
                    <li key={comment.label}>
                      <p className="text-xs font-medium text-ink-mute">{comment.label}</p>
                      <p className="mt-0.5 whitespace-pre-line text-sm text-ink">{comment.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">History</h2>
              <p className="mt-2 text-sm text-ink-soft">
                Last evaluated {new Date(evaluation.evaluationDate).toLocaleDateString()} — earlier
                evaluations will show here once more than one exists.
              </p>
            </section>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}
