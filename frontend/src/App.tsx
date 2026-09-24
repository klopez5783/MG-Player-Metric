import { RouterProvider } from 'react-router'
import AuthProvider from './features/auth/AuthProvider'
import { router } from './routes'

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App
