import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import RosterSnapshot from '../players/RosterSnapshot'
import { useCoachRoster } from '../players/useCoachRoster'
import EvaluationsDue from '../evaluations/EvaluationsDue'
import PendingVideoReviews from '../drills/PendingVideoReviews'
import type { PendingVideoReview } from '../evaluations/types'
import type { RosterPlayer } from '../players/types'
import ActivityFeed from './ActivityFeed'
import type { ActivityItem } from './types'
import QuickActions from './QuickActions'
import InviteCard from './InviteCard'

// TODO: replace these with real fetches once the evaluation due-dates,
// video-review and activity endpoints exist.
export default function CoachHome() {
  const { roster } = useCoachRoster()

  const dueRoster: RosterPlayer[] = [] // no evaluations table yet — see EvaluationsDue
  const reviews: PendingVideoReview[] = []
  const activity: ActivityItem[] = []

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-5xl space-y-4 px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-ink">Coach dashboard</h1>
          <QuickActions />
        </div>

        <RosterSnapshot roster={roster} />

        <div className="grid gap-4 lg:grid-cols-2">
          <EvaluationsDue roster={dueRoster} />
          <PendingVideoReviews reviews={reviews} />
        </div>

        <ActivityFeed items={activity} />

        <InviteCard />
      </main>
      <AppFooter />
    </div>
  )
}
