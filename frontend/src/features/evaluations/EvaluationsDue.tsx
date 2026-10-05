import { Link } from 'react-router'
import type { RosterPlayer } from '../players/types'

// The most action-oriented card on the dashboard: what a coach has to
// remember ("evaluate everyone monthly") shown as what's due right now.
export default function EvaluationsDue({ roster }: { roster: RosterPlayer[] }) {
  const overdue = roster.filter((p) => p.evaluationStatus === 'overdue')
  const due = roster.filter((p) => p.evaluationStatus === 'due')
  const quarterly = roster.filter((p) => p.quarterlyReviewDue)

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <h2 className="text-sm font-semibold text-ink">Evaluations needing attention</h2>

      {roster.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">You don't have any players yet.</p>
      ) : overdue.length === 0 && due.length === 0 ? (
        <p className="mt-3 text-sm text-ink-soft">Every player is up to date.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {[...overdue, ...due].map((player) => (
            <PlayerRow key={player.id} player={player} />
          ))}
        </ul>
      )}

      {quarterly.length > 0 && (
        <>
          <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-ink-mute">
            Quarterly reassessment approaching
          </h3>
          <ul className="mt-2 divide-y divide-line">
            {quarterly.map((player) => (
              <li key={player.id} className="flex items-center justify-between gap-3 py-2">
                <Link to="/coach/players" className="text-sm text-ink hover:underline">
                  {player.name}
                </Link>
                <span className="text-xs text-ink-mute">
                  {new Date(player.nextEvaluationDue).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

function PlayerRow({ player }: { player: RosterPlayer }) {
  const overdue = player.evaluationStatus === 'overdue'
  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div>
        <Link to="/coach/players" className="text-sm font-medium text-ink hover:underline">
          {player.name}
        </Link>
        <p className="text-xs text-ink-mute">{player.team}</p>
      </div>
      <span
        className={`flex-none rounded-full px-2.5 py-1 text-xs font-medium ${
          overdue
            ? 'border border-accent/40 bg-accent/10 text-red-400'
            : 'border border-amber-500/30 bg-amber-500/10 text-amber-400'
        }`}
      >
        {overdue ? 'Overdue' : 'Due'} · {new Date(player.nextEvaluationDue).toLocaleDateString()}
      </span>
    </li>
  )
}
