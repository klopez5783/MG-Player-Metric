import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import PendingVideoReviews from './PendingVideoReviews'
import type { PendingVideoReview } from '../evaluations/types'

// TODO: fetch from the backend once a video-review endpoint exists.
export default function ReviewQueuePage() {
  const reviews: PendingVideoReview[] = []

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Video reviews</h1>
        <p className="mt-1 text-sm text-ink-soft">Oldest submissions first, so nothing sits unreviewed.</p>

        <div className="mt-6">
          <PendingVideoReviews reviews={reviews} />
        </div>
      </main>
      <AppFooter />
    </div>
  )
}
