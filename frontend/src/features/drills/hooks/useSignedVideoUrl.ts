import { useEffect, useState } from 'react'
import { supabase } from '../../../api/supabseClient'

// A temporary link to a private video in the Drill_Videos bucket, valid for
// an hour. Supabase only signs it if a Storage policy lets this user read the
// file (players their own folder, coaches videos for drills they assigned).
// Pass null while the path isn't known yet. Bump version after replacing the
// file at the same path, so a fresh link is signed and the browser doesn't
// replay its cached copy of the old video.
export function useSignedVideoUrl(path: string | null | undefined, version = 0) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!path) return
    let cancelled = false
    setLoading(true)
    setError(null)

    supabase.storage
      .from('Drill_Videos')
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error.message)
        else setUrl(data.signedUrl)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [path, version])

  return { url, loading, error }
}
