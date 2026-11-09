import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getMyLatestEvaluation, type EvaluationDetailResponse } from '../../api/backend'

// The last evaluation loaded, kept outside React so it survives moving
// between pages. Tagged with the user id so a different login never sees it.
let cache: { userId: string; evaluation: EvaluationDetailResponse | null } | null = null

// Loads the logged-in player's most recent evaluation (GET
// /players/me/evaluations/latest): attributes, sub-attributes, ratings and
// comments in one request. `evaluation` is null while loading and when the
// player has no evaluation yet; check `loading` to tell the two apart.
//
// The first page to use it fetches and shows a loading state. Pages opened
// after that render the cached copy straight away, and quietly refetch in
// the background so a new evaluation from the coach still shows up.
export function useMyLatestEvaluation() {
  const { session } = useAuth()
  const userId = session?.user.id
  const cached = cache && cache.userId === userId ? cache : null

  const [evaluation, setEvaluation] = useState<EvaluationDetailResponse | null>(cached?.evaluation ?? null)
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getMyLatestEvaluation(session.access_token)
      .then((data) => {
        cache = { userId: session.user.id, evaluation: data }
        if (!cancelled) setEvaluation(data)
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached copy.
        const hasCached = cache?.userId === session.user.id
        if (!cancelled && !hasCached) {
          setError(err instanceof Error ? err.message : 'Could not load your evaluation.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  return { evaluation, loading, error }
}
