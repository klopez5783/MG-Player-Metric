import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}
