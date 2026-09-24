import { useNavigate } from 'react-router'
import { supabase } from '../../api/supabseClient'
import { useAuth } from '../../hooks/useAuth'

export default function HomePage() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const user = session?.user
  const role = user?.user_metadata?.role as string | undefined

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-semibold text-slate-900">MG Player Metric</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{user?.email}</span>
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

      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome{role ? `, ${role}` : ''}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Your players, evaluations and drills will show up here.
        </p>
      </main>
    </div>
  )
}
