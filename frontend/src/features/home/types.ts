// A coach-dashboard composition of events that will eventually come from
// several tables (videos, evaluations, drills). No activity-feed endpoint
// exists yet — see CoachHome.tsx, which passes [] until one does.

export type ActivityType = 'video_submitted' | 'evaluation_completed' | 'drill_assigned'

export interface ActivityItem {
  id: string
  type: ActivityType
  description: string
  date: string // ISO date
}
