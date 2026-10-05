import type { CoachFeedback } from './types'

export default function FeedbackBanner({ feedback }: { feedback: CoachFeedback[] }) {
  const unread = feedback.filter((f) => !f.read)
  if (unread.length === 0) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent bg-accent/10 p-4">
      <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-accent" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-ink">
          New feedback from your coach{unread.length > 1 ? ` (${unread.length})` : ''}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {unread[0].subject}: “{unread[0].message}”
        </p>
      </div>
    </div>
  )
}
