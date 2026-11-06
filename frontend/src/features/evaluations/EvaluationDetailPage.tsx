import { useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'

// Where StartEvaluationPage redirects after a successful save. Just confirms
// the id for now; fetching and showing the full evaluation comes later.
export default function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()

  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-ink">Saved evaluation {evaluationId}</h1>
      </main>
      <AppFooter />
    </div>
  )
}
