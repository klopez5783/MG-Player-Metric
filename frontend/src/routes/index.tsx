import { createBrowserRouter, Navigate } from 'react-router'
import LoginForm from '../features/auth/LoginForm'
import SignUpForm from '../features/auth/SignUpForm'
import AttributeDetailPage from '../features/evaluations/AttributeDetailPage'
import StartEvaluationPage from '../features/evaluations/StartEvaluationPage'
import ProgressPage from '../features/evaluations/ProgressPage'
import FeedbackHistoryPage from '../features/evaluations/FeedbackHistoryPage'
import AssignDrillPage from '../features/drills/AssignDrillPage'
import VideoReviewPage from '../features/drills/VideoReviewPage'
import DrillLibraryPage from '../features/drills/DrillLibraryPage'
import ReviewQueuePage from '../features/drills/ReviewQueuePage'
import PlayerDrillsPage from '../features/drills/PlayerDrillsPage'
import DrillDetailPage from '../features/drills/DrillDetailPage'
import CoachHome from '../features/home/CoachHome'
import HomePage from '../features/home/HomePage'
import PlayerHome from '../features/home/PlayerHome'
import PlayerListPage from '../features/players/PlayerListPage'
import ProfilePage from '../features/profile/ProfilePage'
import ProtectedRoute from './ProtectedRoute'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/home" replace /> },
  { path: '/login', element: <LoginForm /> },
  { path: '/signup', element: <SignUpForm /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/home', element: <HomePage /> },

      // Player
      {path : '/player', element: <PlayerHome /> },
      { path: '/player/progress', element: <ProgressPage /> },
      { path: '/player/drills', element: <PlayerDrillsPage /> },
      { path: '/player/drills/:drillId', element: <DrillDetailPage /> },
      { path: '/player/feedback', element: <FeedbackHistoryPage /> },
      { path: '/players/attributes/:attributeKey', element: <AttributeDetailPage /> },

      // Coach
      {path : '/coach', element: <CoachHome /> },
      { path: '/coach/players', element: <PlayerListPage /> },
      { path: '/coach/drills', element: <DrillLibraryPage /> },
      { path: '/coach/drills/assign', element: <AssignDrillPage /> },
      { path: '/coach/reviews', element: <ReviewQueuePage /> },
      { path: '/coach/reviews/:reviewId', element: <VideoReviewPage /> },
      { path: '/coach/evaluations/start', element: <StartEvaluationPage /> },

      { path: '/profile', element: <ProfilePage /> },
    ],
  },
])
