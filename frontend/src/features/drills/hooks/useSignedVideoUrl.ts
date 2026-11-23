import { useEffect, useState } from 'react'
import { supabase } from '../../../api/supabseClient'

// A temporary link to a private video in the Drill_Videos bucket, valid for
// an hour. Supabase only signs it if a Storage policy lets this user read the
// file (players their own folder, coaches videos for drills they assigned).
// Pass null while the path isn't known yet. Bump version after replacing the
// file at the same path, so a fresh link is signed and the browser doesn't
// replay its cached copy of the old video.
export function useSignedVideoUrl(path: string | null | undefined, version = 0) {
  // Each result remembers which path/version it was signed for, so a stale
  // one from a previous video is ignored instead of being reset in the effect.
  const key = path ? `${path}#${version}` : null
  const [result, setResult] = useState<{ key: string; url: string | null; error: string | null } | null>(null)

  useEffect(() => {
    if (!path) return
    const requestKey = `${path}#${version}`
    let cancelled = false

    supabase.storage
      .from('Drill_Videos')
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (cancelled) return
        setResult({ key: requestKey, url: data?.signedUrl ?? null, error: error?.message ?? null })
      })

    return () => {
      cancelled = true
    }
  }, [path, version])

  const current = result && result.key === key ? result : null
  return { url: current?.url ?? null, loading: key !== null && !current, error: current?.error ?? null }
}
