import { useParams } from 'react-router'
import ComingSoonPage from '../../components/ComingSoonPage'
import type { PendingVideoReview } from '../evaluations/types'

// TODO: fetch the real review by id once a video-review endpoint exists.
export default function VideoReviewPage() {
  const { reviewId } = useParams<{ reviewId: string }>()
  const reviews: PendingVideoReview[] = []
  const review = reviews.find((r) => r.id === reviewId)

  return (
    <ComingSoonPage
      title={review ? `${review.drillName} — ${review.playerName}` : 'Video review'}
      description="Watch the submission and leave feedback the player will see on their dashboard."
      backTo="/coach"
      backLabel="Back to dashboard"
    >
      {review && (
        <p className="text-sm text-ink-soft">
          Submitted {new Date(review.submittedDate).toLocaleDateString()}
        </p>
      )}
    </ComingSoonPage>
  )
}
