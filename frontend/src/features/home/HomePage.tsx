import { Navigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'

export default function HomePage() {
  const { me, meLoading } = useAuth()

  if (meLoading) return null
  if (!me) return <Navigate to="/login" replace />

  return <Navigate to={me.role === 'coach' ? '/coach' : '/player'} replace />
}


