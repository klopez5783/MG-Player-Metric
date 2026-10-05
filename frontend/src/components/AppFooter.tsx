import { NavLink } from 'react-router'
import type { Role } from '../api/backend'
import { useAuth } from '../hooks/useAuth'

const COACH_TABS = [
  { to: '/coach', label: 'Dashboard' },
  { to: '/coach/players', label: 'Players' },
  { to: '/coach/drills', label: 'Drills' },
  { to: '/coach/reviews', label: 'Reviews' },
  { to: '/profile', label: 'Profile' },
]

const PLAYER_TABS = [
  { to: '/player', label: 'Home' },
  { to: '/player/progress', label: 'Progress' },
  { to: '/player/drills', label: 'Drills' },
  { to: '/player/feedback', label: 'Feedback' },
  { to: '/profile', label: 'Profile' },
]

function tabsFor(role: Role | undefined) {
  if (role === 'coach') return COACH_TABS
  if (role === 'player') return PLAYER_TABS
  return null
}

// The primary navigation, placed at the bottom of the page like a mobile
// app's tab bar. Sticks to the viewport bottom so it stays reachable on a
// long page; each page adds bottom padding to its content so nothing sits
// underneath it.
export default function AppFooter() {
  const { me } = useAuth()
  const tabs = tabsFor(me?.role)
  if (!tabs) return null

  return (
    <footer className="sticky bottom-0 border-t border-line bg-canvas" aria-label="Primary">
      <nav className="mx-auto flex max-w-5xl" aria-label="Primary">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/coach' || tab.to === '/player'}
            className={({ isActive }) =>
              `flex-1 border-t-2 px-2 py-3 text-center text-sm font-medium transition ${
                isActive
                  ? 'border-accent text-ink'
                  : 'border-transparent text-ink-mute hover:text-ink-soft'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </footer>
  )
}
