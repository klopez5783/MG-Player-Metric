import { useState, type FormEvent } from 'react'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { useAuth } from '../../hooks/useAuth'
import { joinCoachByCode } from '../../api/backend'
import PlayerSnapshot from '../players/PlayerSnapshot'
import AttributeGrid from '../evaluations/AttributeGrid'
import StrengthsWeaknesses from '../evaluations/StrengthsWeaknesses'
import FeedbackBanner from '../evaluations/FeedbackBanner'
import ActiveDrills from '../drills/ActiveDrills'
import type { CoachFeedback, Drill, Evaluation } from '../evaluations/types'

export default function PlayerHome() {
  const { me } = useAuth()
  const hasCoach = !!me?.coachId

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        {hasCoach ? <PlayerDashboard /> : <JoinCoachCard />}
      </main>
      <AppFooter />
    </div>
  )
}

// TODO: replace these with real fetches once evaluations, drills and coach
// feedback have backend endpoints.
function getEvaluation(): Evaluation | null {
  return null
}

function PlayerDashboard() {
  const { me } = useAuth()
  const evaluation = getEvaluation()
  const drills: Drill[] = []
  const feedback: CoachFeedback[] = []

  return (
    <>
      {evaluation ? (
        <>
          <PlayerSnapshot name={me?.name ?? 'Player'} evaluation={evaluation} />

          <FeedbackBanner feedback={feedback} />

          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink">Attributes</h2>
            <AttributeGrid attributes={evaluation.attributes} />
          </section>

          <StrengthsWeaknesses strengths={evaluation.strengths} weaknesses={evaluation.weaknesses} />
        </>
      ) : (
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h1 className="text-xl font-semibold text-ink">Welcome, {me?.name ?? 'player'}</h1>
          <p className="mt-2 text-sm text-ink-soft">
            You don't have an evaluation yet. Once your coach completes one, your overall rating and
            attributes will show up here.
          </p>
        </div>
      )}

      <ActiveDrills drills={drills} />
    </>
  )
}

function JoinCoachCard() {
  const { session, refreshMe } = useAuth()
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!code.trim()) {
      setError('Enter your coach’s code.')
      return
    }

    if (!session) {
      setError('Please sign in to join a coach.')
      return
    }

    setJoining(true)
    try {
      await joinCoachByCode(session.access_token, code)
      await refreshMe() // pick up coachId and coachName from the backend
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join with that code.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-lg font-semibold text-ink">Join your coach</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Enter the code your coach gave you to connect with them.
      </p>

      <form onSubmit={handleJoin} className="mt-4 space-y-3">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD2345"
          maxLength={8}
          autoComplete="off"
          aria-label="Coach code"
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-center font-mono text-xl uppercase tracking-widest text-ink outline-none placeholder:text-ink-mute focus:border-accent focus:ring-1 focus:ring-accent"
        />

        {error && (
          <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={joining}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {joining ? 'Joining…' : 'Join by code'}
        </button>
      </form>
    </section>
  )
}
