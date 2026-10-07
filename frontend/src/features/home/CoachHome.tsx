import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import RosterSnapshot from '../players/RosterSnapshot'
import type { Player } from '../../api/backend'
import EvaluationsDue from '../evaluations/EvaluationsDue'
import PendingVideoReviews from '../drills/PendingVideoReviews'
import type { PendingVideoReview } from '../evaluations/types'
import ActivityFeed from './ActivityFeed'
import type { ActivityItem } from './types'
import QuickActions from './QuickActions'
import InviteCard from './InviteCard'
import {getMyPlayers} from '../../api/backend';
import {useAuth} from "../../hooks/useAuth"
import {useEffect, useState} from 'react';

// TODO: replace these with real fetches once the roster, evaluation
// due-dates, video-review and activity endpoints exist.
export default function CoachHome() {
  const {session} = useAuth();
  const [ roster, setRoster ] = useState<Player[]>([]);

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getMyPlayers(session.access_token)
      .then((data) => {
        if (!cancelled) setRoster(data)
          console.log(data)
      })
      .catch((error) => {
        if (!cancelled) console.error('Error fetching my players:', error)
      })

    return () => {
      cancelled = true
    }
  }, [session])


  // const roster: RosterPlayer[] = []
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
          <EvaluationsDue roster={roster} />
          <PendingVideoReviews reviews={reviews} />
        </div>

        <ActivityFeed items={activity} />

        <InviteCard />
      </main>
      <AppFooter />
    </div>
  )
}
