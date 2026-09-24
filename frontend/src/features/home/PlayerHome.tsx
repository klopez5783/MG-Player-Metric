import { useState, type FormEvent } from 'react'
import AppHeader from '../../components/AppHeader'

export default function PlayerHome() {
  // TODO: derive from the backend profile (me.coachId) and the coach's name.
  const [coachName, setCoachName] = useState<string | null>(null)
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

    setJoining(true)
    try {
      // TODO: call the backend (POST /players/me/coach with { code }), then refresh the profile.
      setCoachName('Your coach') // TEMP placeholder so the UI can be seen
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not join with that code.')
    } finally {
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Player dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your evaluations and progress will show up here.
        </p>

        <section className="mt-8 max-w-md rounded-2xl bg-white p-6 shadow">
          {coachName ? (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Your coach</h2>
              <p className="mt-2 text-xl font-semibold text-slate-900">{coachName}</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900">Join your coach</h2>
              <p className="mt-1 text-sm text-slate-600">
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
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center font-mono text-xl uppercase tracking-widest text-slate-900 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />

                {error && (
                  <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={joining}
                  className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joining ? 'Joining…' : 'Join by code'}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
