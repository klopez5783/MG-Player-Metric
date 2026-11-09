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
// app's tab bar. Fixed to the bottom of the screen on every page, short or
// long. A spacer of the same height (h-12) sits where the footer would be,
// so the end of the page can still scroll out from underneath it.
export default function AppFooter() {
  const { me } = useAuth()
  const tabs = tabsFor(me?.role)
  if (!tabs) return null

  return (
    <>
      <div className="h-12" aria-hidden="true" />
      <footer className="fixed inset-x-0 bottom-0 z-40 h-12 border-t border-line bg-canvas">
        <nav className="mx-auto flex h-full max-w-5xl" aria-label="Primary">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/coach' || tab.to === '/player'}
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center border-t-2 px-2 text-sm font-medium transition ${
                  isActive ? 'border-accent text-ink' : 'border-transparent text-ink-mute hover:text-ink-soft'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </footer>
    </>
  )
}
