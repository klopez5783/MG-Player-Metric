import { useSearchParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import PendingVideoReviews from './PendingVideoReviews'
import ReviewedVideoReviews from './ReviewedVideoReviews'

// Pending and Reviewed tabs. The tab lives in the URL (?tab=reviewed) so the
// review page's back link can return to the tab the coach came from.
export default function ReviewQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') === 'reviewed' ? 'reviewed' : 'pending'

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Video reviews</h1>
        <p className="mt-1 text-sm text-ink-soft">
          {tab === 'pending'
            ? 'Oldest submissions first, so nothing sits unreviewed.'
            : 'Your past feedback, most recent first.'}
        </p>

        <div className="mt-6 inline-flex rounded-lg border border-line bg-surface p-1">
          <TabButton active={tab === 'pending'} onClick={() => setSearchParams({}, { replace: true })}>
            Pending
          </TabButton>
          <TabButton active={tab === 'reviewed'} onClick={() => setSearchParams({ tab: 'reviewed' }, { replace: true })}>
            Reviewed
          </TabButton>
        </div>

        <div className="mt-4">{tab === 'pending' ? <PendingVideoReviews /> : <ReviewedVideoReviews />}</div>
      </main>
      <AppFooter />
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-canvas text-ink' : 'text-ink-mute hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}
