// Placeholder shapes for drills, coach feedback and video reviews. None of
// these have a backend endpoint yet, so screens using them render an empty
// state. Evaluation data uses the real types in api/backend.ts.

export type DrillStatus = 'not_started' | 'submitted' | 'needs_video'

export interface Drill {
  id: string
  name: string
  dueDate: string // ISO date
  status: DrillStatus
  targetSkill: string
  instructions: string
}

export interface CoachFeedback {
  id: string
  subject: string // e.g. the drill or video it's about
  message: string
  date: string // ISO date
  read: boolean
}

export interface PendingVideoReview {
  id: string
  playerName: string
  drillName: string
  submittedDate: string // ISO date
}
