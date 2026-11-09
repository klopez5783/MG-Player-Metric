// The coach's written strengths and weaknesses from an evaluation. Each is
// free text, so line breaks the coach typed are kept.
export default function StrengthsWeaknesses({
  strengths,
  weaknesses,
}: {
  strengths: string | null
  weaknesses: string | null
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Note title="Strengths" text={strengths} tone="green" />
      <Note title="Areas to work on" text={weaknesses} tone="accent" />
    </div>
  )
}

function Note({ title, text, tone }: { title: string; text: string | null; tone: 'green' | 'accent' }) {
  const dot = tone === 'green' ? 'bg-green-500' : 'bg-accent'
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className={`h-2 w-2 flex-none rounded-full ${dot}`} aria-hidden="true" />
        {title}
      </h3>
      <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">{text?.trim() || 'Nothing noted yet.'}</p>
    </div>
  )
}
