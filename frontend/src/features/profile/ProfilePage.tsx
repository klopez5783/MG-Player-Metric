import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import AppHeader from '../../components/AppHeader'
import FormField from '../../components/FormField'
import { updateProfile } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'

// Wait for the profile before mounting the form, so the name box starts with the saved value.
export default function ProfilePage() {
  const { meLoading } = useAuth()
  return meLoading ? null : <ProfileForm />
}

function ProfileForm() {
  const { session, me, refreshMe } = useAuth()
  const [name, setName] = useState(me?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    if (!name.trim()) {
      setError('Enter your name.')
      return
    }
    if (!session) {
      setError('Please sign in to update your profile.')
      return
    }

    setSaving(true)
    try {
      await updateProfile(session.access_token, name.trim())
      await refreshMe()
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Your profile</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your name is shown to your {me?.role === 'coach' ? 'players' : 'coach'}.
        </p>

        <form onSubmit={handleSave} className="mt-8 max-w-md space-y-4 rounded-2xl bg-white p-6 shadow">
          <FormField
            label="Full name"
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <p className="text-sm text-slate-600">{session?.user.email}</p>
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
              Profile updated.
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <Link to="/home" className="text-sm font-medium text-slate-700 underline">
              Back
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
