import { createContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { MeResponse } from '../../api/backend'

export interface AuthState {
  session: Session | null
  loading: boolean
  me: MeResponse | null
  meLoading: boolean
}

export const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  me: null,
  meLoading: false,
})

