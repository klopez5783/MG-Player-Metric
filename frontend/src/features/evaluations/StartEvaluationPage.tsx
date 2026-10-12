import { useCallback, useMemo, useState } from 'react'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { useCoachRoster } from '../players/useCoachRoster'
import { sendEvaluation } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'

// TODO: replace with a real GET /attributes catalog endpoint once one
// exists — this is just enough to make the form shape visible. A category's
// own score isn't entered directly; it's the average of its sub-attributes,
// so only sub-attributes get a rating control.

// Weighted academy categories — contribute to the weighted "Academy" preview.
const ACADEMY_CATEGORIES = [
  {
    id: 2,
    name: 'Football IQ',
    description: 'Awareness, positioning and tactical decisions',
    weight: 0.3,
    subAttributes: [
      { id: 12, name: 'Awareness' },
      { id: 13, name: 'Decision Making' },
      { id: 14, name: 'Positioning' },
      { id: 15, name: 'Spatial Awareness' },
      { id: 16, name: 'Anticipation' },
      { id: 17, name: 'Movement Off Ball' },
      { id: 18, name: 'Combination Play' },
      { id: 19, name: 'Transition Awareness' },
    ],
  },
  {
    id: 4,
    name: 'Psychological / Learning',
    description: 'Mindset, behavior and learning capacity',
    weight: 0.2,
    subAttributes: [
      { id: 29, name: 'Coachability' },
      { id: 30, name: 'Response to Mistakes' },
      { id: 32, name: 'Concentration' },
      { id: 33, name: 'Work Rate' },
      { id: 34, name: 'Resilience' },
      { id: 35, name: 'Communication' },
    ],
  },
]

// Player-card skills (FIFA-style) — unweighted, shown as their own average,
// never blended into the academy weighted preview.
const SKILL_CATEGORIES = [
  {
    id: 5,
    name: 'Pace',
    subAttributes: [
      { id: 101, name: 'Acceleration' },
      { id: 102, name: 'Sprint Speed' },
    ],
  },
  {
    id: 6,
    name: 'Shooting',
    subAttributes: [
      { id: 103, name: 'Att. Position' },
      { id: 104, name: 'Finishing' },
      { id: 105, name: 'Shot Power' },
      { id: 106, name: 'Long Shots' },
      { id: 107, name: 'Volleys' },
      { id: 108, name: 'Penalties' },
    ],
  },
  {
    id: 7,
    name: 'Passing',
    subAttributes: [
      { id: 109, name: 'Vision' },
      { id: 110, name: 'Crossing' },
      { id: 111, name: 'FK Acc.' },
      { id: 112, name: 'Short Pass' },
      { id: 113, name: 'Long Pass' },
      { id: 114, name: 'Curve' },
    ],
  },
  {
    id: 8,
    name: 'Dribbling',
    subAttributes: [
      { id: 115, name: 'Agility' },
      { id: 116, name: 'Balance' },
      { id: 117, name: 'Reactions' },
      { id: 118, name: 'Ball Control' },
      { id: 119, name: 'Dribbling' },
      { id: 120, name: 'Composure' },
    ],
  },
  {
    id: 9,
    name: 'Defending',
    subAttributes: [
      { id: 121, name: 'Interceptions' },
      { id: 122, name: 'Heading Acc.' },
      { id: 123, name: 'Def. Aware' },
      { id: 124, name: 'Stand Tackle' },
      { id: 125, name: 'Slide Tackle' },
    ],
  },
  {
    id: 10,
    name: 'Physical',
    subAttributes: [
      { id: 126, name: 'Jumping' },
      { id: 127, name: 'Stamina' },
      { id: 128, name: 'Strength' },
      { id: 129, name: 'Aggression' },
    ],
  },
]

interface RatingEntry {
  rating: number | undefined
  comment: string
}

const emptyEntry: RatingEntry = { rating: undefined, comment: '' }

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) / 10
}

// Each category's score is derived from its own sub-attributes — nothing is
// entered at the category level.
function toStats<T extends { id: number; subAttributes: { id: number; name: string }[] }>(
  categories: T[],
  subAttributeRatings: Record<number, RatingEntry>,
) {
  return categories.map((category) => {
    const ratedValues = category.subAttributes
      .map((sub) => subAttributeRatings[sub.id]?.rating)
      .filter((r): r is number => r != null)
    return {
      ...category,
      score: average(ratedValues),
      ratedCount: ratedValues.length,
      totalCount: category.subAttributes.length,
    }
  })
}

export default function StartEvaluationPage() {
  const { roster, loading: rosterLoading } = useCoachRoster()
  const { session } = useAuth()

  const [playerId, setPlayerId] = useState('')
  const [evaluationDate, setEvaluationDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [evaluationType, setEvaluationType] = useState('initial')

  const [subAttributeRatings, setSubAttributeRatings] = useState<Record<number, RatingEntry>>({})

  const [strengths, setStrengths] = useState('')
  const [weaknesses, setWeaknesses] = useState('')
  const [generalComment, setGeneralComment] = useState('')

  function setSubAttributeRating(id: number, patch: Partial<RatingEntry>) {
    setSubAttributeRatings((prev) => ({ ...prev, [id]: { ...(prev[id] ?? emptyEntry), ...patch } }))
  }

  const academyStats = useMemo(() => toStats(ACADEMY_CATEGORIES, subAttributeRatings), [subAttributeRatings])
  const skillStats = useMemo(() => toStats(SKILL_CATEGORIES, subAttributeRatings), [subAttributeRatings])

  // Two separate previews, kept apart on purpose — a weighted academy score
  // and an unweighted player-card average measure different things, so
  // blending them into one number wouldn't mean anything coherent.
  const academyWeighted = useMemo(() => {
    const present = academyStats.filter((c) => c.score != null)
    if (present.length === 0) return null
    const weightSum = present.reduce((sum, c) => sum + c.weight, 0)
    const weightedSum = present.reduce((sum, c) => sum + (c.score ?? 0) * c.weight, 0)
    return Math.round((weightedSum / weightSum) * 10) / 10
  }, [academyStats])

  const skillCardAverage = useMemo(() => {
    const present = skillStats.filter((c) => c.score != null).map((c) => c.score as number)
    return average(present)
  }, [skillStats])

  // No backend endpoint to save to yet — this just collects everything the
  // form currently holds into one object, so you can see the shape of what
  // a real save would eventually send.
  const handleSave = useCallback(async () => {
    if (!session) return // narrows session from `Session | null` to `Session` below

    const ratedSubAttributes = [...ACADEMY_CATEGORIES, ...SKILL_CATEGORIES].flatMap((category) =>
      category.subAttributes
        .filter((sub) => subAttributeRatings[sub.id]?.rating != null)
        .map((sub) => ({
          category: category.name,
          subAttribute: sub.name,
          rating: subAttributeRatings[sub.id].rating,
          comment: subAttributeRatings[sub.id].comment || null,
        })),
    )

    const payload = {
      playerId,
      evaluationDate,
      evaluationType,
      academyWeighted,
      skillCardAverage,
      strengths,
      weaknesses,
      generalComment,
      ratedSubAttributes,
    }

    console.log('Evaluation payload (not saved — no backend yet):', payload)
    await sendEvaluation(session?.access_token, payload)
  }, [
    session,
    playerId,
    evaluationDate,
    evaluationType,
    subAttributeRatings,
    academyWeighted,
    skillCardAverage,
    strengths,
    weaknesses,
    generalComment,
  ])

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Start an evaluation</h1>

        {/* Part 1: Player information */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-ink">Part 1 · Player information</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
            <Field label="Evaluation date">
              <input
                type="date"
                value={evaluationDate}
                onChange={(e) => setEvaluationDate(e.target.value)}
                className={fieldClass}
              />
            </Field>
            <Field label="Evaluation type">
              <select value={evaluationType} onChange={(e) => setEvaluationType(e.target.value)} className={fieldClass}>
                <option value="initial">Initial</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </Field>
          </div>
        </section>

        {/* Part 2: Attribute ratings — header, live stats, and all six
            player-card skills together in one bubble. */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-ink">Part 2 · Attribute ratings</h2>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-ink-mute">Academy weighted (preview)</p>
                <p className="text-2xl font-bold text-ink">{academyWeighted ?? '—'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-mute">Player card (preview)</p>
                <p className="text-2xl font-bold text-ink">{skillCardAverage ?? '—'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 divide-y divide-line">
            {skillStats.map((category) => (
              <div key={category.id} className="pt-6 first:pt-0">
                <CategoryCardBody
                  category={category}
                  subAttributeRatings={subAttributeRatings}
                  onRate={setSubAttributeRating}
                />
              </div>
            ))}
          </div>
        </section>

        <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-ink-mute">Academy categories</h3>
        {academyStats.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            weightLabel={`Weight ${Math.round(category.weight * 100)}%`}
            subAttributeRatings={subAttributeRatings}
            onRate={setSubAttributeRating}
          />
        ))}

        {/* Part 3: Summary */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-ink">Part 3 · Summary</h2>
          <div className="mt-3 space-y-3">
            <Field label="Strengths">
              <textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={2} className={fieldClass} />
            </Field>
            <Field label="Weaknesses">
              <textarea value={weaknesses} onChange={(e) => setWeaknesses(e.target.value)} rows={2} className={fieldClass} />
            </Field>
            <Field label="General comment">
              <textarea
                value={generalComment}
                onChange={(e) => setGeneralComment(e.target.value)}
                rows={2}
                className={fieldClass}
              />
            </Field>
          </div>
        </section>

        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active"
        >
          Save evaluation
        </button>
        <p className="text-xs text-ink-mute">Logs the current form data to the console — nothing is sent to a backend yet.</p>
      </main>
      <AppFooter />
    </div>
  )
}

interface CategoryStat {
  id: number
  name: string
  description?: string
  score: number | null
  ratedCount: number
  totalCount: number
  subAttributes: { id: number; name: string }[]
}

// A standalone card: the body, wrapped in its own bordered bubble. Used for
// the Academy categories, which stay visually separate.
function CategoryCard({
  category,
  weightLabel,
  subAttributeRatings,
  onRate,
}: {
  category: CategoryStat
  weightLabel?: string
  subAttributeRatings: Record<number, RatingEntry>
  onRate: (id: number, patch: Partial<RatingEntry>) => void
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-6">
      <CategoryCardBody category={category} weightLabel={weightLabel} subAttributeRatings={subAttributeRatings} onRate={onRate} />
    </section>
  )
}

// Just the header row + sub-attribute list, no outer bubble — used both
// inside CategoryCard above and directly inside the merged Part 2 bubble,
// where several of these share one outer border instead of each getting
// their own.
function CategoryCardBody({
  category,
  weightLabel,
  subAttributeRatings,
  onRate,
}: {
  category: CategoryStat
  weightLabel?: string
  subAttributeRatings: Record<number, RatingEntry>
  onRate: (id: number, patch: Partial<RatingEntry>) => void
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">{category.name}</h3>
            {weightLabel && (
              <span className="rounded-full border border-line bg-canvas px-2 py-0.5 text-xs text-ink-mute">
                {weightLabel}
              </span>
            )}
          </div>
          {category.description && <p className="mt-1 text-xs text-ink-mute">{category.description}</p>}
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-ink">{category.score ?? '—'}</p>
          <p className="text-xs text-ink-mute">
            {category.ratedCount}/{category.totalCount}
          </p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {category.subAttributes.map((sub) => {
          const entry = subAttributeRatings[sub.id]
          return (
            <li key={sub.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-ink-soft">{sub.name}</p>
                  <p className="text-xs text-ink-mute">{entry?.rating != null ? '' : 'Not rated'}</p>
                </div>
                <RatingInput value={entry?.rating} onChange={(rating) => onRate(sub.id, { rating })} />
              </div>
              <input
                type="text"
                value={entry?.comment ?? ''}
                onChange={(e) => onRate(sub.id, { comment: e.target.value })}
                placeholder="Note (optional)"
                className={`${fieldClass} mt-2`}
              />
            </li>
          )
        })}
      </ul>
    </>
  )
}

const fieldClass =
  'w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-mute">{label}</label>
      {children}
    </div>
  )
}

function RatingInput({ value, onChange }: { value: number | undefined; onChange: (value: number) => void }) {
  // A slider always sits somewhere, so it can't show a true "unrated" state
  // the way a button grid could — it starts at the midpoint visually, but
  // the number label stays "—" until the coach actually moves it, and
  // nothing is recorded into state before that first interaction.
  const displayValue = value ?? 5.5

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={1}
        max={10}
        step={0.5}
        value={displayValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-32 cursor-pointer accent-accent"
      />
      <span className={`w-8 text-right text-sm font-medium ${value == null ? 'text-ink-mute' : 'text-ink'}`}>
        {value ?? '—'}
      </span>
    </div>
  )
}
