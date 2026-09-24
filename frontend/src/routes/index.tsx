import { createBrowserRouter, Navigate } from 'react-router'
import LoginForm from '../features/auth/LoginForm'
import SignUpForm from '../features/auth/SignUpForm'
import CoachHome from '../features/home/CoachHome'
import HomePage from '../features/home/HomePage'
import PlayerHome from '../features/home/PlayerHome'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/home" replace /> },
  { path: '/login', element: <LoginForm /> },
  { path: '/signup', element: <SignUpForm /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <HomePage /> },
      {path : '/player', element: <PlayerHome /> },
      {path : '/coach', element: <CoachHome /> },
    ],
  },
])
