import RadarChart from '../evaluations/RadarChart'
import type { Evaluation } from '../evaluations/types'
import { scoreTier } from '../evaluations/scoreTier'

export default function PlayerSnapshot({ name, evaluation }: { name: string; evaluation: Evaluation }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-accent text-lg font-semibold text-ink">
            {initials || '?'}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">{name}</h1>
            <p className="text-sm text-ink-mute">
              Last evaluated {new Date(evaluation.date).toLocaleDateString()}
            </p>
            <p className={`mt-1 text-3xl font-bold ${scoreTier(evaluation.overallRating).text}`}>
              {evaluation.overallRating}
              <span className="ml-1 text-sm font-medium text-ink-mute">Overall</span>
            </p>
          </div>
        </div>

        <RadarChart attributes={evaluation.attributes} />
      </div>
    </div>
  )
}
