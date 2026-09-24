import { useNavigate } from 'react-router'
import { supabase } from '../api/supabseClient'
import { useAuth } from '../hooks/useAuth'

export default function AppHeader() {
  const { session } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="text-lg font-semibold text-slate-900">MG Player Metric</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{session?.user.email}</span>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
