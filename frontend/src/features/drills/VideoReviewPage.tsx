import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { reviewDrill } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { removeFromPendingReviews, useGetPendingReviews } from './hooks/useGetPendingReviews'
import { useSignedVideoUrl } from './hooks/useSignedVideoUrl'

// One submitted drill for the coach to review. Reads it from the pending
// reviews cache, so coming from the review list needs no extra fetch.
export default function VideoReviewPage() {
  const { reviewId } = useParams<{ reviewId: string }>()
  const { reviews, loading, error } = useGetPendingReviews()
  // The route param is a string; assignment ids are numbers.
  const review = reviews.find((r) => r.id === Number(reviewId))
  // Waits for the review to load; null path = nothing to fetch yet.
  const video = useSignedVideoUrl(review?.videoPath)

  const { session } = useAuth()
  const navigate = useNavigate()
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function handleReview() {
    if (!session || !review) return
    setSaving(true)
    setSaveError(null)
    try {
      await reviewDrill(session.access_token, review.id, { comment: comment.trim() || null })
      removeFromPendingReviews(review.id)
      navigate('/coach/reviews', { replace: true })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save the review.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to="/coach/reviews" className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← Back to reviews
        </Link>

        {loading ? (
          <p className="mt-6 text-sm text-ink-mute">Loading submission…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-400">{error}</p>
        ) : !review ? (
          <p className="mt-6 text-sm text-ink-soft">
            This submission couldn't be found. It may already have been reviewed.
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-2xl font-semibold text-ink">{review.drillName}</h1>
            <p className="mt-1 text-sm text-ink-mute">
              {review.playerName} · submitted {new Date(review.submittedAt).toLocaleDateString()}
              {review.dueDate ? ` · due ${formatDate(review.dueDate)}` : ''}
            </p>

            <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Submission</h2>
              {video.url ? (
                <video src={video.url} controls playsInline className="mt-4 aspect-video w-full rounded-lg bg-black" />
              ) : (
                <div className="mt-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-line bg-canvas">
                  <p className={`text-sm ${video.error ? 'text-red-400' : 'text-ink-mute'}`}>
                    {video.error ?? (review.videoPath ? 'Loading video…' : 'No video was submitted.')}
                  </p>
                </div>
              )}
            </section>

            {review.playerNote && (
              <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
                <h2 className="text-sm font-semibold text-ink">Note from {review.playerName}</h2>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{review.playerNote}</p>
              </section>
            )}

            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">The drill</h2>
              {review.coachNote && (
                <p className="mt-2 text-sm text-ink-soft">
                  <span className="text-ink-mute">Your note: </span>
                  {review.coachNote}
                </p>
              )}
              <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{review.instructions ?? '—'}</p>
            </section>

            {/* The player sees this comment on the drill once it's reviewed. */}
            <section className="mt-4 rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-sm font-semibold text-ink">Your feedback</h2>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="e.g. Good first touch. Keep your head up before the pass."
                className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleReview}
                  disabled={saving}
                  className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Mark as reviewed'}
                </button>
                <span className="text-xs text-ink-mute">The comment is optional.</span>
              </div>
              {saveError && <p className="mt-2 text-xs text-red-400">{saveError}</p>}
            </section>
          </>
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
