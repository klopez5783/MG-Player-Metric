import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getMyPlayers, type Player } from '../../api/backend'

// The last roster loaded, kept outside React so it survives moving between
// pages. Tagged with the user id so a different login never sees it.
let cache: { userId: string; roster: Player[] } | null = null

// Shared by CoachHome, PlayerListPage, PlayerEvaluationsPage and
// StartEvaluationPage — all need the coach's roster, fetched the same way.
// The first page fetches and shows a loading state; later pages render the
// cached roster straight away and refetch quietly in the background.
export function useCoachRoster() {
  const { session } = useAuth()
  const userId = session?.user.id
  const cached = cache && cache.userId === userId ? cache : null

  const [roster, setRoster] = useState<Player[]>(cached?.roster ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getMyPlayers(session.access_token)
      .then((data) => {
        cache = { userId: session.user.id, roster: data }
        if (!cancelled) setRoster(data)
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached roster.
        const hasCached = cache?.userId === session.user.id
        if (!cancelled && !hasCached) {
          setError(err instanceof Error ? err.message : 'Could not load your players.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  return { roster, loading, error }
}
