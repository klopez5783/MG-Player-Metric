import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../api/supabseClient'
import { AuthContext } from './AuthContext'
import type { MeResponse } from '../../api/backend'
import { getMe } from '../../api/backend'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [meLoaded, setMeLoaded] = useState(false)

useEffect(() => {                       // effect 1: subscribe once
  const { data } = supabase.auth.onAuthStateChange((_event, next) => {
    setSession(next)
    setLoading(false)
    if (!next) {
      setMe(null)
      setMeLoaded(false)
    }
  })
  return () => data.subscription.unsubscribe()
}, [])

useEffect(() => {                       // effect 2: fetch when the session changes
  if (!session) return
  getMe(session.access_token)
    .then(setMe)
    .catch(() => setMe(null))
    .finally(() => setMeLoaded(true))
}, [session])

// Manual re-fetch. Reads the session from Supabase so it always uses the current token.
const refreshMe = useCallback(async () => {
  const { data } = await supabase.auth.getSession()
  if (!data.session) return
  try {
    setMe(await getMe(data.session.access_token))
  } catch {
    setMe(null)
  }
}, [])

const meLoading = !!session && !meLoaded

return (
  <AuthContext.Provider value={{ session, loading, me, meLoading, refreshMe }}>
    {children}
  </AuthContext.Provider>
)

}
