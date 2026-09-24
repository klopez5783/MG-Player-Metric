import { useState } from 'react'
import AppHeader from '../../components/AppHeader'
import { getInviteCode } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import {useEffect } from 'react'

export default function CoachHome() {
  const [code, setCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { session } = useAuth()

  useEffect(() => {
    if(!session) return
    let cancelled = false

    getInviteCode(session.access_token).then((response) => {
      if (!cancelled) {
        setCode(response.inviteCode)
      }
    }).catch((error) => {
      if (!cancelled) {
        setError(error instanceof Error ? error.message : 'Could not generate a code.')
      }
    })

    return () => {
      cancelled = true
    }

  },[session])

  async function handleGenerate() {
    if(!session){
      setError('Please sign in to generate an invite code.')
      return
    }
    setError(null)
    setGenerating(true)
    try {
      // TODO: call the backend (GET /coaches/me/invite-code) and use the returned code.
      const { inviteCode } = await getInviteCode(session?.access_token)
      setCode(inviteCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate a code.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy the code. Select it and copy it manually.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Coach dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your players, evaluations and drills will show up here.
        </p>

        <section className="mt-8 max-w-md rounded-2xl bg-white p-6 shadow">
          <h2 className="text-lg font-semibold text-slate-900">Invite players</h2>
          <p className="mt-1 text-sm text-slate-600">
            Share your code with a player so they can join your team.
          </p>

          {code ? (
            <div className="mt-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-300 bg-slate-50 px-4 py-3">
                <span className="font-mono text-2xl font-semibold tracking-widest text-slate-900">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating}
              className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? 'Generating…' : 'Generate code'}
            </button>
          )}

          {error && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}
