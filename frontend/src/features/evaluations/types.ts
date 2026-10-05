// Shapes for a player's evaluation data. No backend endpoint exists for any
// of this yet (there's no evaluations/attributes/drills table), so every
// screen that uses these types currently renders an empty/zero state.

export interface SubAttribute {
  label: string
  score: number // 0-100
}

export interface MajorAttribute {
  key: string
  label: string
  score: number // 0-100, the average of its sub-attributes
  subAttributes: SubAttribute[]
}

export interface StrengthWeakness {
  attributeKey: string
  label: string
  note: string
}

export interface Evaluation {
  date: string // ISO date
  overallRating: number // 0-100
  attributes: MajorAttribute[]
  strengths: StrengthWeakness[]
  weaknesses: StrengthWeakness[]
}

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
