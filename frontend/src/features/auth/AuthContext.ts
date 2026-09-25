import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { MeResponse } from '../../api/backend'

export interface AuthState {
  session: Session | null
  loading: boolean
  me: MeResponse | null
  meLoading: boolean
  /** Re-fetch the profile, e.g. after joining a coach or updating the name. */
  refreshMe: () => Promise<void>
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  me: null,
  meLoading: false,
  refreshMe: async () => {},
})

