import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAssignedDrills, type AssignedDrillResponse } from '../../api/backend'

let cache: { userId: string; drills: AssignedDrillResponse[] } | null = null

export function useAssignedDrills() {
  const { session } = useAuth()
  const userId = session?.user.id
  const cached = cache && cache.userId === userId ? cache : null

  const [drills, setDrills] = useState<AssignedDrillResponse[]>(cached?.drills ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getAssignedDrills(session.access_token)
      .then((data) => {
        cache = { userId: session.user.id, drills: data }
        if (!cancelled) setDrills(data)
      })
      .catch((err) => {
        // A failed background refresh keeps showing the cached library.
        const hasCached = cache?.userId === session.user.id
        if (!cancelled && !hasCached) {
          setError(err instanceof Error ? err.message : 'Could not load drills.')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  return { drills, loading, error }
}
