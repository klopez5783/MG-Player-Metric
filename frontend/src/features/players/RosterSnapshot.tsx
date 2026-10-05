import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import type { RosterPlayer } from './types'

export default function RosterSnapshot({ roster }: { roster: RosterPlayer[] }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const teamCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const player of roster) {
      counts.set(player.team, (counts.get(player.team) ?? 0) + 1)
    }
    return [...counts.entries()]
  }, [roster])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    navigate(query.trim() ? `/coach/players?q=${encodeURIComponent(query.trim())}` : '/coach/players')
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-bold text-ink">{roster.length}</p>
          <p className="text-sm text-ink-mute">Players on your roster</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {teamCounts.map(([team, count]) => (
            <span
              key={team}
              className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-soft"
            >
              {team} · {count}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players…"
          aria-label="Search players"
          className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-mute focus:border-accent focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          className="flex-none rounded-lg border border-line bg-canvas px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-hover"
        >
          Search
        </button>
      </form>
    </div>
  )
}
