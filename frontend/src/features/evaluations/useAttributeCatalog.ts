import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getAttributes, type AttributeResponse } from '../../api/backend'

// Loads the attribute catalog (GET /attributes) once the user is signed in.
// Ignores the response if the component unmounts before it arrives.
export function useAttributeCatalog() {
  const { session } = useAuth()
  const [catalog, setCatalog] = useState<AttributeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    let cancelled = false

    getAttributes(session.access_token)
      .then((data) => {
        if (!cancelled) setCatalog(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load attributes.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session])

  return { catalog, loading, error }
}
