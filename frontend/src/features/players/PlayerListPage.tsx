import { useSearchParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { useCoachRoster } from './useCoachRoster'

export default function PlayerListPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const { roster } = useCoachRoster()

  const filtered = roster.filter((player) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (player.name ?? '').toLowerCase().includes(q) || (player.team ?? '').toLowerCase().includes(q)
  })

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Players</h1>

        <input
          type="text"
          value={query}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
          placeholder="Search by name or team…"
          aria-label="Search players"
          className="mt-4 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-accent focus:ring-1 focus:ring-accent"
        />

        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-sm text-ink-soft">
              {roster.length === 0 ? "You don't have any players yet." : `No players match “${query}”.`}
            </li>
          )}
          {filtered.map((player) => (
            <li key={player.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink">{player.name ?? 'Unnamed player'}</p>
                <p className="text-xs text-ink-mute">
                  {player.team ?? 'No team'} · {player.position ?? 'No position'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <AppFooter />
    </div>
  )
}
