import { useNavigate } from 'react-router'
import { supabase } from '../api/supabseClient'
import { useAuth } from '../hooks/useAuth'

export default function AppHeader() {
  const { session, me } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-line bg-canvas">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-semibold text-ink">MG Player Metric</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-soft">{me?.name ?? session?.user.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-hover"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
