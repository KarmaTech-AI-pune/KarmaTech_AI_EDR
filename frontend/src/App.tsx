import { screensArrayType, projectManagementAppContextType } from './types'
import { createContext, useState } from 'react'
import { Home } from './pages/Home'
import { ProjectDetails } from './pages/ProjectDetails'
import { Navbar } from './components/Navbar'
import LoginScreen from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { ProjectList } from './components/ProjectList'
import { ResourceManagement } from './components/ResourceManagement'
import { ReportsList } from './components/ReportsList'
import { NotificationCenter } from './components/NotificationCenter'

export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)

function App() {
  const [screenState, setScreenState] = useState<string>("Home")

  const [isAuthenticated, setIsAuthenticated] = useState(true)

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
    <projectManagementAppContext.Provider value={{screenState, setScreenState, isAuthenticated, setIsAuthenticated}}>
      {isAuthenticated && <Navbar />}
      {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  )
}

export default App
