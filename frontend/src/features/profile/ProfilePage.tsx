import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
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
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Your profile</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Your name is shown to your {me?.role === 'coach' ? 'players' : 'coach'}.
        </p>

        <form onSubmit={handleSave} className="mt-8 max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6">
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
            <span className="mb-1 block text-sm font-medium text-ink-soft">Email</span>
            <p className="text-sm text-ink-mute">{session?.user.email}</p>
          </div>

          {error && (
            <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink">
              {error}
            </p>
          )}
          {saved && (
            <p role="status" className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
              Profile updated.
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <Link to="/home" className="text-sm font-medium text-ink-soft underline hover:text-ink">
              Back
            </Link>
          </div>
        </form>
      </main>
      <AppFooter />
    </div>
  )
}
