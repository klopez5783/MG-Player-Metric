import { RouterProvider } from 'react-router'
import AuthProvider from './features/auth/AuthProvider'
import PlayerProvider from './features/players/PlayerProvider'
import { router } from './routes'

function App() {
  return (
    <AuthProvider>
      {/* Inside AuthProvider: it needs the session and role to load players. */}
      <PlayerProvider>
        <RouterProvider router={router} />
      </PlayerProvider>
    </AuthProvider>
  )
}

export default App
