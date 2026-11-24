import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlayers } from '../../hooks/usePlayers'
import { getMyLatestEvaluation, type EvaluationDetailResponse } from '../../api/backend'

// The last evaluation loaded, kept outside React so it survives moving
// between pages. Tagged with the player id so switching players (or logins)
// never shows someone else's.
let cache: { playerId: string; evaluation: EvaluationDetailResponse | null } | null = null

// Loads the selected player's most recent evaluation (GET
// /players/me/{playerId}/evaluations/latest): attributes, sub-attributes,
// ratings and comments in one request. `evaluation` is null while loading and
// when the player has no evaluation yet; check `loading` to tell the two apart.
//
// The first page to use it fetches and shows a loading state. Pages opened
// after that render the cached copy straight away, and quietly refetch in
// the background so a new evaluation from the coach still shows up.
export function useMyLatestEvaluation() {
  const { session } = useAuth()
  const { selectedPlayer, playersLoading } = usePlayers()
  const playerId = selectedPlayer?.id

  // Each result remembers which player it was fetched for, so a stale one
  // from the previous player is ignored instead of being reset in the effect.
  const [result, setResult] = useState<{
    playerId: string
    evaluation: EvaluationDetailResponse | null
    error: string | null
  } | null>(null)

  useEffect(() => {
    if (!session || !playerId) return
    let cancelled = false

    getMyLatestEvaluation(session.access_token, playerId)
      .then((data) => {
        cache = { playerId, evaluation: data }
        if (!cancelled) setResult({ playerId, evaluation: data, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setResult({
            playerId,
            evaluation: null,
            error: err instanceof Error ? err.message : 'Could not load your evaluation.',
          })
      })

    return () => {
      cancelled = true
    }
  }, [session, playerId])

  const current = result && result.playerId === playerId ? result : null
  const cached = cache && cache.playerId === playerId ? cache : null
  // A failed background refresh keeps showing the cached copy.
  const evaluation = current && !current.error ? current.evaluation : (cached?.evaluation ?? null)
  const loading = playersLoading || (!!playerId && !current && !cached)
  const error = current?.error && !cached ? current.error : null

  return { evaluation, loading, error }
}
