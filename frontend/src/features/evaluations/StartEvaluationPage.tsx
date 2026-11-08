import { useCallback, useMemo, useState } from "react";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import { useCoachRoster } from "../players/useCoachRoster";
import { sendEvaluation } from "../../api/backend";
import { useAuth } from "../../hooks/useAuth";
import { useAttributeCatalog } from "./useAttributeCatalog";
import { useNavigate, useSearchParams } from "react-router";

// One sub-attribute's input: the slider value (undefined until the coach
// moves it) and an optional note.
interface RatingEntry {
  rating: number | undefined;
  comment: string;
}

const emptyEntry: RatingEntry = { rating: undefined, comment: "" };

// Mean rounded to one decimal; null when there's nothing to average.
function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return (
    Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 10) /
    10
  );
}

// Adds a score (average of rated sub-attributes) and rated/total counts to
// each category. Nothing is entered at the category level.
function toStats<
  T extends { id: number; subAttributes: { id: number; name: string }[] },
>(categories: T[], subAttributeRatings: Record<number, RatingEntry>) {
  return categories.map((category) => {
    const ratedValues = category.subAttributes
      .map((sub) => subAttributeRatings[sub.id]?.rating)
      .filter((r): r is number => r != null);
    return {
      ...category,
      score: average(ratedValues),
      ratedCount: ratedValues.length,
      totalCount: category.subAttributes.length,
    };
  });
}

// Coach-facing form: pick a player, rate each sub-attribute from the
// GET /attributes catalog, add a summary, and POST it as one evaluation.
export default function StartEvaluationPage() {
  const { roster, loading: rosterLoading } = useCoachRoster();
  const {
    catalog,
    loading: catalogLoading,
    error: catalogError,
  } = useAttributeCatalog();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Pre-selected when arriving from a player's page (?playerId=...).
  const [playerId, setPlayerId] = useState(
    () => searchParams.get("playerId") ?? "",
  );
  const [evaluationDate, setEvaluationDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [evaluationType, setEvaluationType] = useState("initial");

  // Every rating on the form, keyed by sub-attribute id.
  const [subAttributeRatings, setSubAttributeRatings] = useState<
    Record<number, RatingEntry>
  >({});

  const [strengths, setStrengths] = useState("");
  const [weaknesses, setWeaknesses] = useState("");
  const [generalComment, setGeneralComment] = useState("");

  // Updates one sub-attribute's rating or comment, keeping the other field.
  function setSubAttributeRating(id: number, patch: Partial<RatingEntry>) {
    setSubAttributeRatings((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? emptyEntry), ...patch },
    }));
  }

  // The catalog with live scores; recalculated when it loads or a rating changes.
  const skillStats = useMemo(
    () => toStats(catalog, subAttributeRatings),
    [catalog, subAttributeRatings],
  );

  // Coachability preview: the Psychological / Learning score, matched by name
  // since ids can change when the catalog is re-seeded.
  const coachabilityRating = useMemo(
    () =>
      skillStats.find((c) => c.name === "Psychological / Learning")?.score ??
      null,
    [skillStats],
  );

  // Player-card preview: average of every other rated category.
  const skillCardAverage = useMemo(() => {
    const present = skillStats
      .filter((c) => c.name !== "Psychological / Learning" && c.score != null)
      .map((c) => c.score as number);
    return average(present);
  }, [skillStats]);

  // Save stays disabled until a player and date are chosen and every
  // sub-attribute has a rating. Notes and the summary are optional.
  const canSave =
    playerId !== "" &&
    evaluationDate !== "" &&
    skillStats.length > 0 &&
    skillStats.every((c) => c.ratedCount === c.totalCount);

  // Builds the request body from the form and sends it to
  // POST /coaches/me/evaluations. Only sub-attributes the coach actually rated
  // are included, and categories with none rated are left out.
  const handleSave = useCallback(async () => {
    if (!session) return; // narrows session from `Session | null` to `Session` below

    const attributes = [...skillStats]
      .map((category) => ({
        attributeId: category.id,
        attribute: category.name,
        rating: category.score,
        comment: null,
        subAttributes: category.subAttributes
          .filter((sub) => subAttributeRatings[sub.id]?.rating != null)
          .map((sub) => ({
            subAttributeId: sub.id,
            rating: subAttributeRatings[sub.id].rating,
            comment: subAttributeRatings[sub.id].comment || null,
          })),
      }))
      .filter((attribute) => attribute.subAttributes.length > 0);

    const overallRating = average(
      [skillCardAverage].filter((r): r is number => r != null),
    );

    const payload = {
      playerId,
      evaluationDate,
      evaluationType,
      overallRating,
      strengths,
      weaknesses,
      generalComment,
      attributes,
    };

    setSaving(true);
    setSaveError(null);
    try {
      const { id } = await sendEvaluation(session.access_token, payload);
      navigate(`/coach/evaluations/${id}`);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Failed to save evaluation",
      );
    } finally {
      setSaving(false);
    }
  }, [
    session,
    playerId,
    evaluationDate,
    evaluationType,
    skillStats,
    subAttributeRatings,
    skillCardAverage,
    strengths,
    weaknesses,
    generalComment,
  ]);

  return (
    <div className="min-h-screen bg-canvas">
      {saving && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-canvas/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-line border-t-accent" />
          <p className="text-sm font-medium text-ink">Saving evaluation…</p>
        </div>
      )}

      {saveError && (
        <div className="border-b border-line bg-red-50 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <AppHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Start an evaluation</h1>

        {/* Part 1: Player information */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-ink">
            Part 1 · Player information
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Player">
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className={fieldClass}
              >
                <option value="">
                  {rosterLoading ? "Loading…" : "Select a player…"}
                </option>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? "Unnamed player"}
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
              <select
                value={evaluationType}
                onChange={(e) => setEvaluationType(e.target.value)}
                className={fieldClass}
              >
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
            <h2 className="text-sm font-semibold text-ink">
              Part 2 · Attribute ratings
            </h2>
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-xs text-ink-mute">
                  Coachability rating (preview)
                </p>
                <p className="text-2xl font-bold text-ink">
                  {coachabilityRating ?? "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-mute">Player card (preview)</p>
                <p className="text-2xl font-bold text-ink">
                  {skillCardAverage ?? "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 divide-y divide-line">
            <div className="mt-6 divide-y divide-line">
              {catalogError ? (
                <p className="text-sm text-red-400">
                  Couldn't load the attributes: {catalogError}. Refresh the page
                  to try again.
                </p>
              ) : catalogLoading ? (
                <p className="text-sm text-ink-mute">Loading attributes…</p>
              ) : skillStats.length === 0 ? (
                <p className="text-sm text-ink-mute">
                  No attributes have been set up yet.
                </p>
              ) : (
                skillStats.map((category) => (
                  <div key={category.id} className="pt-6 first:pt-0">
                    <CategoryCardBody
                      category={category}
                      subAttributeRatings={subAttributeRatings}
                      onRate={setSubAttributeRating}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Part 3: Summary */}
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-sm font-semibold text-ink">Part 3 · Summary</h2>
          <div className="mt-3 space-y-3">
            <Field label="Strengths">
              <textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                rows={2}
                className={fieldClass}
              />
            </Field>
            <Field label="Weaknesses">
              <textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                rows={2}
                className={fieldClass}
              />
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
          disabled={!canSave}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save evaluation
        </button>
        {!canSave && (
          <p className="text-xs text-ink-mute">
            Select a player and rate every sub-attribute to save.
          </p>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

// A catalog category after toStats has added its score and counts.
interface CategoryStat {
  id: number;
  name: string;
  description?: string | null;
  score: number | null;
  ratedCount: number;
  totalCount: number;
  subAttributes: { id: number; name: string }[];
}

// One category inside the Part 2 bubble: name, description and live score,
// then a slider and note field for each sub-attribute. No outer border, so
// several can share the one bubble.
function CategoryCardBody({
  category,
  weightLabel,
  subAttributeRatings,
  onRate,
}: {
  category: CategoryStat;
  weightLabel?: string;
  subAttributeRatings: Record<number, RatingEntry>;
  onRate: (id: number, patch: Partial<RatingEntry>) => void;
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
          {category.description && (
            <p className="mt-1 text-xs text-ink-mute">{category.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-ink">
            {category.score ?? "—"}
          </p>
          <p className="text-xs text-ink-mute">
            {category.ratedCount}/{category.totalCount}
          </p>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-line">
        {category.subAttributes.map((sub) => {
          const entry = subAttributeRatings[sub.id];
          return (
            <li key={sub.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-ink-soft">{sub.name}</p>
                  <p className="text-xs text-ink-mute">
                    {entry?.rating != null ? "" : "Not rated"}
                  </p>
                </div>
                <RatingInput
                  value={entry?.rating}
                  onChange={(rating) => onRate(sub.id, { rating })}
                />
              </div>
              <input
                type="text"
                value={entry?.comment ?? ""}
                onChange={(e) => onRate(sub.id, { comment: e.target.value })}
                placeholder="Note (optional)"
                className={`${fieldClass} mt-2`}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent focus:ring-1 focus:ring-accent";

// A small label stacked above any input.
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink-mute">
        {label}
      </label>
      {children}
    </div>
  );
}

// 1–10 slider in half steps, with the current value shown beside it.
function RatingInput({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number) => void;
}) {
  // A slider always sits somewhere, so it can't show a true "unrated" state
  // the way a button grid could — it starts at the midpoint visually, but
  // the number label stays "—" until the coach actually moves it, and
  // nothing is recorded into state before that first interaction.
  const displayValue = value ?? 5.5;

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
      <span
        className={`w-8 text-right text-sm font-medium ${value == null ? "text-ink-mute" : "text-ink"}`}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
