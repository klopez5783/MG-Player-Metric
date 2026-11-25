import { useState, type FormEvent } from 'react'
import FormField from '../../components/FormField'
import {
  addPlayer,
  deletePlayer,
  updatePlayer,
  type CreatePlayerRequest,
  type PlayerSummary,
} from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'
import { usePlayers } from '../../hooks/usePlayers'

// The players on this login (one for a player, one per child for a parent),
// with forms to edit them and add another. Player accounts only.
export default function AccountPlayers() {
  const { players, selectedPlayer, playersLoading, playersError, selectPlayer } = usePlayers()
  // One player edited at a time; null when no edit form is open.
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <section className="mt-6 max-w-md rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">Players</h2>
      <p className="mt-1 text-xs text-ink-mute">
        Everyone this account manages. Each player has their own coach, drills and evaluations.
      </p>

      {playersLoading ? (
        <p className="mt-4 text-sm text-ink-mute">Loading players…</p>
      ) : playersError ? (
        <p className="mt-4 text-sm text-red-400">{playersError}</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {players.map((player) => (
            <li key={player.id} className="py-3 first:pt-0 last:pb-0">
              {editingId === player.id ? (
                <EditPlayerForm player={player} onDone={() => setEditingId(null)} />
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-ink">{player.name ?? 'Unnamed player'}</p>
                    <div className="flex flex-none items-center gap-2">
                      {/* Switching is only worth showing with more than one player. */}
                      {players.length > 1 &&
                        (player.id === selectedPlayer?.id ? (
                          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-ink-soft">
                            Viewing
                          </span>
                        ) : (
                          <SmallButton onClick={() => selectPlayer(player.id)}>View</SmallButton>
                        ))}
                      <SmallButton onClick={() => setEditingId(player.id)}>Edit</SmallButton>
                      {/* The account always keeps at least one player. */}
                      {players.length > 1 && <DeletePlayerButton player={player} />}
                    </div>
                  </div>
                  <dl className="mt-1 grid grid-cols-3 gap-2 text-xs">
                    <Detail label="Age" value={player.age?.toString()} />
                    <Detail label="Position" value={player.position} />
                    <Detail label="Team" value={player.team} />
                  </dl>
                  <p className="mt-1 text-xs text-ink-mute">
                    {player.coachName ? `Coach: ${player.coachName}` : 'No coach yet'}
                  </p>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <AddPlayer />
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-ink-mute">{label}</dt>
      <dd className="text-ink-soft">{value || '—'}</dd>
    </div>
  )
}

function SmallButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink transition hover:bg-surface-hover"
    >
      {children}
    </button>
  )
}

// Asks first, since deleting can't be undone. Errors (e.g. the player has
// history) show under the row's buttons.
function DeletePlayerButton({ player }: { player: PlayerSummary }) {
  const { session } = useAuth()
  const { refreshPlayers } = usePlayers()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    if (!session) return
    if (!window.confirm(`Delete ${player.name ?? 'this player'}? This can't be undone.`)) return

    setDeleting(true)
    setError(null)
    try {
      await deletePlayer(session.access_token, player.id)
      // If this was the selected player, the provider falls back to the first one.
      await refreshPlayers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the player.')
      setDeleting(false)
    }
  }

  return (
    <span className="relative">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-lg border border-red-500/40 bg-canvas px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {deleting ? 'Deleting…' : 'Delete'}
      </button>
      {error && (
        <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-56 rounded-md border border-line bg-surface px-2 py-1 text-xs text-red-400">
          {error}
        </span>
      )}
    </span>
  )
}

// Edit form, pre-filled with the player's current details.
function EditPlayerForm({ player, onDone }: { player: PlayerSummary; onDone: () => void }) {
  const { session } = useAuth()
  const { refreshPlayers } = usePlayers()

  async function handleSave(request: CreatePlayerRequest) {
    if (!session) throw new Error('Please sign in to edit this player.')
    await updatePlayer(session.access_token, player.id, request)
    await refreshPlayers()
    onDone()
  }

  return (
    <PlayerForm
      idPrefix={`edit-${player.id}`}
      title={`Edit ${player.name ?? 'player'}`}
      initial={player}
      submitLabel="Save"
      savingLabel="Saving…"
      onSubmit={handleSave}
      onCancel={onDone}
    />
  )
}

// Collapsed to a button until opened, so the list stays the focus.
function AddPlayer() {
  const { session } = useAuth()
  const { refreshPlayers, selectPlayer } = usePlayers()
  const [open, setOpen] = useState(false)

  async function handleAdd(request: CreatePlayerRequest) {
    if (!session) throw new Error('Please sign in to add a player.')
    const player = await addPlayer(session.access_token, request)
    await refreshPlayers()
    // Switch to the new player so the app shows them next.
    selectPlayer(player.id)
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-surface-hover"
      >
        + Add player
      </button>
    )
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <PlayerForm
        idPrefix="new-player"
        title="Add a player"
        submitLabel="Add player"
        savingLabel="Adding…"
        onSubmit={handleAdd}
        onCancel={() => setOpen(false)}
      />
    </div>
  )
}

interface PlayerFormProps {
  /** Keeps input ids unique when more than one form is on the page. */
  idPrefix: string
  title: string
  /** Starting values; empty fields when adding. */
  initial?: Pick<PlayerSummary, 'name' | 'dateOfBirth' | 'position' | 'team'>
  submitLabel: string
  savingLabel: string
  /** Throw to show an error and keep the form open. */
  onSubmit: (request: CreatePlayerRequest) => Promise<void>
  onCancel: () => void
}

// The name, date of birth, position and team fields shared by add and edit.
function PlayerForm({ idPrefix, title, initial, submitLabel, savingLabel, onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(initial?.dateOfBirth ?? '')
  const [position, setPosition] = useState(initial?.position ?? '')
  const [team, setTeam] = useState(initial?.team ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Enter the player’s name.')
      return
    }

    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        // The date input gives "YYYY-MM-DD", or "" when left empty.
        dateOfBirth: dateOfBirth || null,
        position: position.trim() || null,
        team: team.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the player.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>

      <FormField
        label="Name"
        id={`${idPrefix}-name`}
        type="text"
        required
        maxLength={100}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <FormField
        label="Date of birth"
        id={`${idPrefix}-dob`}
        type="date"
        // No birthdays in the future (the backend rejects them too).
        max={new Date().toISOString().slice(0, 10)}
        value={dateOfBirth}
        onChange={(e) => setDateOfBirth(e.target.value)}
      />
      <FormField
        label="Position"
        id={`${idPrefix}-position`}
        type="text"
        maxLength={50}
        placeholder="e.g. Midfielder"
        value={position}
        onChange={(e) => setPosition(e.target.value)}
      />
      <FormField
        label="Team"
        id={`${idPrefix}-team`}
        type="text"
        maxLength={100}
        value={team}
        onChange={(e) => setTeam(e.target.value)}
      />

      {error && (
        <p role="alert" className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-ink">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? savingLabel : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="text-sm font-medium text-ink-soft underline hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  )
}
