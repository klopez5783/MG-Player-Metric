import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase } from '../../api/supabseClient'
import { syncUser, type Role } from '../../api/backend'
import AuthCard from '../../components/AuthCard'
import FormField from '../../components/FormField'
type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'confirm-email' }

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: 'coach', label: 'Coach', hint: 'Manage players, drills and evaluations' },
  { value: 'player', label: 'Player', hint: 'View your evaluations and progress' },
]

export default function SignUpForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('player')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  const submitting = status.kind === 'submitting'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (password.length < 8) {
      setStatus({ kind: 'error', message: 'Password must be at least 8 characters.' })
      return
    }
    if (password !== confirmPassword) {
      setStatus({ kind: 'error', message: 'Passwords do not match.' })
      return
    }

    setStatus({ kind: 'submitting' })

    // The role is stored on the Supabase user so the profile can still be
    // created at first login if email confirmation delays the session.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, name: name.trim() } },
    })
    if (error) {
      setStatus({ kind: 'error', message: error.message })
      return
    }

    // With email confirmation enabled Supabase returns a user but no session,
    // so there is no token to call the backend with yet.
    if (!data.session) {
      setStatus({ kind: 'confirm-email' })
      return
    }

    try {
      await syncUser(data.session.access_token, role, name.trim())
      navigate('/home', { replace: true })
    } catch (err) {
      setStatus({
        kind: 'error',
        message: err instanceof Error ? err.message : 'Could not create your profile.',
      })
    }
  }

  if (status.kind === 'confirm-email') {
    return (
      <AuthCard>
        <h1 className="text-2xl font-semibold text-black">Check your email</h1>
        <p className="mt-2 text-sm text-slate-600">
          We sent a confirmation link to <strong>{email}</strong>. Confirm your address, then{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            log in
          </Link>{' '}
          to finish setting up your account.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <h1 className="text-2xl font-semibold text-black">Create your account</h1>
      <p className="mt-1 text-sm text-slate-600">Sign up to start tracking player metrics.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-700">I am a…</legend>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <label
                key={r.value}
                className={`cursor-pointer rounded-lg border p-3 text-sm transition ${
                  role === r.value
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={role === r.value}
                  onChange={() => setRole(r.value)}
                  className="sr-only"
                />
                <span className="block font-medium">{r.label}</span>
                <span className={`block text-xs ${role === r.value ? 'text-slate-300' : 'text-slate-500'}`}>
                  {r.hint}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormField
          label="Full name"
          id="name"
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
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
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <FormField
          label="Confirm password"
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {status.kind === 'error' && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {status.message}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-slate-900 underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  )
}
