import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getDrills, type DrillResponse } from '../../api/backend'

// The last library loaded, kept outside React so it survives moving between
// pages. Tagged with the user id so a different login never sees it.
let cache: { userId: string; drills: DrillResponse[] } | null = null

// Shared by DrillLibraryPage and AssignDrillPage — both need the coach's
// drill library (GET /coaches/me/drills), fetched the same way. The first
// page fetches and shows a loading state; later pages render the cached
// library straight away and refetch quietly in the background.
export function useDrillLibrary() {
  const { session } = useAuth()
  const userId = session?.user.id
  const cached = cache && cache.userId === userId ? cache : null

  const [drills, setDrills] = useState<DrillResponse[]>(cached?.drills ?? [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getDrills(session.access_token)
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
