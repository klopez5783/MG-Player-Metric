import { useEffect, useState } from 'react'
import { getInviteCode } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'

export default function InviteCard() {
  const [code, setCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { session } = useAuth()

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getInviteCode(session.access_token)
      .then((response) => {
        if (!cancelled) setCode(response.inviteCode)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your code.')
      })

    return () => {
      cancelled = true
    }
  }, [session])

  async function handleGenerate() {
    if (!session) {
      setError('Please sign in to generate an invite code.')
      return
    }
    setError(null)
    setGenerating(true)
    try {
      const { inviteCode } = await getInviteCode(session.access_token)
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
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">Invite players</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Share your code with a player so they can join your team.
      </p>

      {code ? (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-canvas px-4 py-3">
          <span className="font-mono text-2xl font-semibold tracking-widest text-ink">{code}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-hover"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="mt-4 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating ? 'Generating…' : 'Generate code'}
        </button>
      )}

      {error && (
        <p role="alert" className="mt-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}
    </div>
  )
}
