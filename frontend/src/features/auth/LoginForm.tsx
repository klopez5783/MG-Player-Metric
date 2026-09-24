import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../../api/supabseClient'
import { syncUser, type Role } from '../../api/backend'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
export default function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    // Users who had to confirm their email never got a profile at sign-up, so
    // create it now from the role they picked. The endpoint is idempotent.
    const role = data.user.user_metadata?.role as Role | undefined
    if (role) {
      try {
        await syncUser(data.session.access_token, role)
      } catch (err) {
        await supabase.auth.signOut()
        setError(err instanceof Error ? err.message : 'Could not load your profile.')
        setSubmitting(false)
        return
      }
    }

    navigate('/home', { replace: true })
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold text-black">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-600">Log in to your account.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Email"
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          label="Password"
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-slate-900 underline">
          Sign up
        </Link>
      </p>
    </AuthCard>
  )
}
