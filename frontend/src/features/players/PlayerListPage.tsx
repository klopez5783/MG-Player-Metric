import { useSearchParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import type { EvaluationStatus, RosterPlayer } from './types'

const STATUS_LABEL: Record<EvaluationStatus, string> = {
  ok: 'Up to date',
  due: 'Due soon',
  overdue: 'Overdue',
}

const STATUS_STYLE: Record<EvaluationStatus, string> = {
  ok: 'bg-canvas text-ink-soft border border-line',
  due: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  overdue: 'bg-accent/10 text-red-400 border border-accent/40',
}

// TODO: replace with GET /coaches/me/players once it exists.
export default function PlayerListPage() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const roster: RosterPlayer[] = []

  const filtered = roster.filter((player) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return player.name.toLowerCase().includes(q) || player.team.toLowerCase().includes(q)
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
                <p className="text-sm font-medium text-ink">{player.name}</p>
                <p className="text-xs text-ink-mute">
                  {player.team} · {player.position}
                </p>
              </div>
              <span
                className={`flex-none rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[player.evaluationStatus]}`}
              >
                {STATUS_LABEL[player.evaluationStatus]}
              </span>
            </li>
          ))}
        </ul>
      </main>
      <AppFooter />
    </div>
  )
}
