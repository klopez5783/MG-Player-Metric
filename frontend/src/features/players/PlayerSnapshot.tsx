import RadarChart from '../evaluations/RadarChart'
import type { EvaluationDetailResponse } from '../../api/backend'
import { scoreTier } from '../evaluations/scoreTier'

// Ratings are 1–10; scoreTier works on 0–100, so scores are multiplied by 10
// for the color only.
export default function PlayerSnapshot({ name, evaluation }: { name: string; evaluation: EvaluationDetailResponse }) {
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const overall = evaluation.overallRating
  const radarAttributes = evaluation.attributes.map((a) => ({ label: a.name, score: a.rating ?? 0 }))

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
              Last evaluated {new Date(evaluation.evaluationDate).toLocaleDateString()}
            </p>
            <p className={`mt-1 text-3xl font-bold ${overall != null ? scoreTier(overall * 10).text : 'text-ink-mute'}`}>
              {overall ?? '—'}
              <span className="ml-1 text-sm font-medium text-ink-mute">Overall</span>
            </p>
          </div>
        </div>

        {radarAttributes.length >= 3 && <RadarChart attributes={radarAttributes} max={10} />}
      </div>
    </div>
  )
}
