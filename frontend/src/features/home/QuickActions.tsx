import { Link } from 'react-router'

export default function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        to="/coach/drills/assign"
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-accent-hover active:bg-accent-active"
      >
        Assign a drill
      </Link>
      <Link
        to="/coach/evaluations/start"
        className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-surface-hover"
      >
        Start an evaluation
      </Link>
    </div>
  )
}
