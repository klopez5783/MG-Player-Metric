import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import {
  deleteEvaluation,
  getEvaluation,
  type AttributeRatingResponse,
  type EvaluationDetailResponse,
} from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { scoreTier } from './scoreTier'

// Read-only view of one saved evaluation: header details, every attribute
// with its sub-attribute ratings, and the written summary. Where
// StartEvaluationPage redirects after a successful save.
export default function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const { session } = useAuth()
  const [evaluation, setEvaluation] = useState<EvaluationDetailResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Asks for confirmation, deletes the evaluation, then goes to the player's
  // evaluation list. Replaces this page in history so Back doesn't return to
  // an evaluation that no longer exists.
  async function handleDelete() {
    if (!session || !evaluationId || !evaluation) return
    if (!window.confirm('Delete this evaluation? This cannot be undone.')) return

    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteEvaluation(session.access_token, evaluationId)
      navigate(`/coach/players/${evaluation.playerId}/evaluations`, { replace: true })
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Could not delete this evaluation.')
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!session || !evaluationId) return
    let cancelled = false

    getEvaluation(session.access_token, evaluationId)
      .then((data) => {
        if (!cancelled) setEvaluation(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load this evaluation.')
      })

    return () => {
      cancelled = true
    }
  }, [session, evaluationId])

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        {error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : !evaluation ? (
          <p className="text-sm text-ink-mute">Loading evaluation…</p>
        ) : (
          <>
            {/* Header: who, when, what kind, overall score */}
            <section className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-ink">{evaluation.playerName ?? 'Unnamed player'}</h1>
                  <p className="mt-1 text-sm text-ink-mute">
                    {formatDate(evaluation.evaluationDate)} · {capitalize(evaluation.evaluationType)} evaluation
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-mute">Overall rating</p>
                  <p className="text-3xl font-bold text-ink">{evaluation.overallRating ?? '—'}</p>
                </div>
              </div>
            </section>

            {/* Every attribute with its sub-attribute ratings */}
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Attribute ratings</h2>
              <div className="mt-4 divide-y divide-line">
                {evaluation.attributes.map((attribute) => (
                  <AttributeBlock key={attribute.attributeId} attribute={attribute} />
                ))}
              </div>
            </section>

            {/* Written summary */}
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Summary</h2>
              <dl className="mt-3 space-y-3">
                <SummaryItem label="Strengths" value={evaluation.strengths} />
                <SummaryItem label="Weaknesses" value={evaluation.weaknesses} />
                <SummaryItem label="General comment" value={evaluation.generalComment} />
              </dl>
            </section>

            {/* Delete, kept at the bottom and away from everyday actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-red-400 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-400 hover:text-canvas disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete evaluation'}
              </button>
              {deleteError && <p className="text-sm text-red-400">{deleteError}</p>}
            </div>
          </>
        )}
      </main>
      <AppFooter />
    </div>
  )
}

// One attribute: name and score, then a bar per sub-attribute with any note.
function AttributeBlock({ attribute }: { attribute: AttributeRatingResponse }) {
  return (
    <div className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{attribute.name}</h3>
        <span className={`text-xl font-semibold ${attribute.rating != null ? scoreTier(attribute.rating * 10).text : 'text-ink-mute'}`}>
          {attribute.rating ?? '—'}
        </span>
      </div>
      {attribute.comment && <p className="mt-1 text-xs text-ink-mute">{attribute.comment}</p>}

      <ul className="mt-3 space-y-2">
        {attribute.subAttributes.map((sub) => {
          // Ratings are 1–10; scoreTier and the bar width work on 0–100.
          const tier = scoreTier(sub.rating * 10)
          return (
            <li key={sub.subAttributeId}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-ink-soft">{sub.name}</span>
                <span className={`font-medium ${tier.text}`}>{sub.rating}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-canvas">
                <div className={`h-1.5 rounded-full ${tier.bar}`} style={{ width: `${sub.rating * 10}%` }} />
              </div>
              {sub.comment && <p className="mt-1 text-xs text-ink-mute">{sub.comment}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// A labelled block of free text; shows a dash when it was left empty.
function SummaryItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-mute">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-sm text-ink">{value || '—'}</dd>
    </div>
  )
}

// "2026-11-06T00:00:00" -> "Nov 6, 2026". No timezone in the string, so it's
// read as local time and the day doesn't shift.
function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
