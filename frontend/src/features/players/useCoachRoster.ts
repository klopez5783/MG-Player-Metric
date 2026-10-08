import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getMyPlayers, type Player } from '../../api/backend'

// Shared by CoachHome and PlayerListPage — both need the coach's roster,
// fetched the same way.
export function useCoachRoster() {
  const { session } = useAuth()
  const [roster, setRoster] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getMyPlayers(session.access_token)
      .then((data) => {
        if (!cancelled) setRoster(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your players.')
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
