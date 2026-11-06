import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import AppHeader from '../../components/AppHeader'
import AppFooter from '../../components/AppFooter'
import { getEvaluation, type EvaluationDetailResponse } from '../../api/backend'
import { useAuth } from '../../hooks/useAuth'

// Where StartEvaluationPage redirects after a successful save. Just confirms
// the id for now; fetching and showing the full evaluation comes later.
export default function EvaluationDetailPage() {
  const { evaluationId } = useParams<{ evaluationId: string }>()
  const [evaluation, setEvaluation] = useState<EvaluationDetailResponse | null>(null)
  const { session } = useAuth()

    useEffect(() => {
    if (!session || !evaluationId) return
    let cancelled = false

    getEvaluation(session.access_token, evaluationId)
      .then((data) => {
        if (!cancelled) setEvaluation(data)
        console.log("Evaluation fetched successfully for evaluationId:", evaluationId)
        console.log("Evaluation data:", data)
      })
      .catch((error) => {
        if (!cancelled) console.error(error)
      })

    return () => {
      cancelled = true
      console.log("Evaluation fetch cancelled for evaluationId:", evaluationId)
    }
  }, [session, evaluationId])

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
