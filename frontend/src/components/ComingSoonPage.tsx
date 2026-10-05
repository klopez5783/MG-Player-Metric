import { Link } from 'react-router'
import AppHeader from './AppHeader'
import AppFooter from './AppFooter'

// Shared placeholder for a flow whose form/backend doesn't exist yet — used
// so a "quick action" link never leads to a dead click while it's unbuilt.
export default function ComingSoonPage({
  title,
  description,
  backTo,
  backLabel,
  children,
}: {
  title: string
  description: string
  backTo: string
  backLabel: string
  children?: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link to={backTo} className="text-sm font-medium text-ink-soft underline hover:text-ink">
          ← {backLabel}
        </Link>

        <h1 className="mt-4 text-2xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{description}</p>

        {children && <div className="mt-6 rounded-2xl border border-line bg-surface p-6">{children}</div>}

        <p className="mt-6 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink-mute">
          This flow isn't built yet.
        </p>
      </main>
      <AppFooter />
    </div>
  )
}
