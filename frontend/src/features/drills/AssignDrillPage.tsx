import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { assignDrill } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { useCoachRoster } from '../players/useCoachRoster'
import { useDrillLibrary } from './useDrillLibrary'

// Today's date as "YYYY-MM-DD" in the coach's own timezone (toISOString()
// would give the UTC date).
function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Coach-facing form: pick a player and a drill, optionally a due date and a
// note, and POST it as one drill assignment. Opened from the drill library
// (?drillId=...) or from a player's page (?playerId=...), which pre-selects
// that field.
export default function AssignDrillPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const { roster, loading: rosterLoading } = useCoachRoster()
  const [searchParams] = useSearchParams()
  // Where the coach came from. Kept separate from the dropdowns so the back
  // link doesn't change when another player or drill is picked.
  const fromPlayerId = searchParams.get('playerId')
  const fromDrillId = searchParams.get('drillId')
  const fromPlayer = roster.find((p) => p.id === fromPlayerId)
  const backTo = fromPlayerId ? `/coach/players/${fromPlayerId}/evaluations` : '/coach/drills'

  const { drills, loading: drillsLoading, error: drillsError } = useDrillLibrary()

  const [playerId, setPlayerId] = useState(() => fromPlayerId ?? '')
  const [drillId, setDrillId] = useState(() => fromDrillId ?? '')
  const [dueDate, setDueDate] = useState('')
  const [coachNote, setCoachNote] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const selectedDrill = drills.find((d) => String(d.id) === drillId)

  // Player and drill are required; the due date is optional but can't be in
  // the past. "YYYY-MM-DD" strings compare correctly as plain strings.
  const canSave = playerId !== '' && drillId !== '' && (dueDate === '' || dueDate >= todayLocal()) && !saving

  async function handleSave() {
    if (!session || !canSave) return

    setSaving(true)
    setSaveError(null)
    try {
      await assignDrill(session.access_token, {
        drillId: Number(drillId),
        playerId,
        dueDate: dueDate || null,
        coachNote: coachNote.trim() || null,
      })
      // Replace the form in history so Back doesn't reopen it.
      navigate(backTo, { replace: true })
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not assign the drill.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <Link to={backTo} className="text-sm text-ink-mute hover:text-ink">
          {fromPlayerId ? `← ${fromPlayer?.name ?? 'Player'}'s evaluations` : '← Drill library'}
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Assign a drill</h1>

        <section className="space-y-4 rounded-2xl border border-line bg-surface p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Player">
              <select value={playerId} onChange={(e) => setPlayerId(e.target.value)} className={fieldClass}>
                <option value="">{rosterLoading ? 'Loading…' : 'Select a player…'}</option>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? 'Unnamed player'}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Due date (optional)">
              <input
                type="date"
                value={dueDate}
                min={todayLocal()}
                onChange={(e) => setDueDate(e.target.value)}
                className={fieldClass}
              />
            </Field>
          </div>

          <Field label="Drill">
            <select value={drillId} onChange={(e) => setDrillId(e.target.value)} className={fieldClass}>
              <option value="">{drillsLoading ? 'Loading…' : 'Select a drill…'}</option>
              {drills.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.difficulty ? ` · ${d.difficulty}` : ''}
                  {d.durationMinutes ? ` · ${d.durationMinutes} min` : ''}
                </option>
              ))}
            </select>
            {drillsError && <p className="mt-1 text-xs text-red-400">{drillsError}</p>}
          </Field>

          {/* Summary of the chosen drill, so the coach can check it's the right one */}
          {selectedDrill && (
            <div className="rounded-xl border border-line bg-canvas p-4">
              {selectedDrill.description && <p className="text-sm text-ink-soft">{selectedDrill.description}</p>}
              <p className="mt-2 text-xs text-ink-mute">
                Targets: {selectedDrill.subAttributes.map((sub) => sub.name).join(', ')}
              </p>
              {selectedDrill.equipment && (
                <p className="mt-1 text-xs text-ink-mute">Equipment: {selectedDrill.equipment}</p>
              )}
              {selectedDrill.requiresVideo && (
                <p className="mt-1 text-xs text-amber-400">The player will need to upload a video.</p>
              )}
            </div>
          )}

          <Field label="Note to player (optional)">
            <textarea
              value={coachNote}
              onChange={(e) => setCoachNote(e.target.value)}
              rows={3}
              placeholder="e.g. Focus on using your weaker foot."
              className={fieldClass}
            />
          </Field>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Assigning…' : 'Assign drill'}
          </button>
          {saveError && <p className="text-sm text-red-400">{saveError}</p>}
        </div>
      </main>
      <AppFooter />
    </div>
  )
}

const fieldClass =
  'w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent'

// A small label stacked above any input.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-mute">{label}</label>
      {children}
    </div>
  )
}
