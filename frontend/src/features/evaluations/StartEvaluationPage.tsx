import ComingSoonPage from '../../components/ComingSoonPage'

export default function StartEvaluationPage() {
  return (
    <ComingSoonPage
      title="Start an evaluation"
      description="Score a player's attributes and leave comments — this becomes their next evaluation."
      backTo="/coach"
      backLabel="Back to dashboard"
    />
  )
}
