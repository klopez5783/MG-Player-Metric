// No /coaches/me/players endpoint exists yet, so every screen that uses this
// type currently renders an empty roster.

export type EvaluationStatus = 'ok' | 'due' | 'overdue'

export interface RosterPlayer {
  id: string
  name: string
  team: string
  position: string
  evaluationStatus: EvaluationStatus
  nextEvaluationDue: string // ISO date
  quarterlyReviewDue: boolean
}
