import { createBrowserRouter, Navigate } from 'react-router'
import SignUpForm from '../features/auth/SignUpForm'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/signup" replace /> },
  { path: '/signup', element: <SignUpForm /> },
])
