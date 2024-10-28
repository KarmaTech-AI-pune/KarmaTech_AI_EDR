import { screensArrayType, projectManagementAppContextType, User } from './types'
import { createContext, useState, useEffect } from 'react'
import { Home } from './pages/Home'
import { ProjectDetails } from './pages/ProjectDetails'
import { Navbar } from './components/Navbar'
import LoginScreen from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { ProjectList } from './components/ProjectList'
import { ResourceManagement } from './components/ResourceManagement'
import { ReportsList } from './components/ReportsList'
import { NotificationCenter } from './components/NotificationCenter'
import { authApi } from './services/api'

export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)

function App() {
  // Screen state management
  const [screenState, setScreenState] = useState<string>("Login")
  
  // Authentication and user state management
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          const isValid = await authApi.checkAuth()
          if (isValid) {
            // If we have a valid token, fetch user details
            const userResponse = await fetch(`${API_BASE_URL}/user/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            })
            if (userResponse.ok) {
              const userData = await userResponse.json()
              setUser(userData)
              setIsAuthenticated(true)
              setScreenState("Home")
            } else {
              handleLogout()
            }
          } else {
            handleLogout()
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])
  // Logout helper function
  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setIsAuthenticated(false)
    setScreenState("Login")
  }

  const screenArray : screensArrayType = {
    "Login": <LoginScreen />,
    "Home": <Home />,
    "Dashboard": <Dashboard />,
    "Projects": <ProjectList />,
    "Resources": <ResourceManagement />,
    "Reports": <ReportsList />,
    "Notifications": <NotificationCenter />,
    "Project Details": <ProjectDetails />
  }


  return (
    <projectManagementAppContext.Provider value={{
      screenState, 
      setScreenState, 
      isAuthenticated, 
      setIsAuthenticated,
      user,
      setUser,
      handleLogout
    }}>
      {isAuthenticated && <Navbar />}
      {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  )
}

export default App
