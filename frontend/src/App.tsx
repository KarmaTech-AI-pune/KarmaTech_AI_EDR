import { screensArrayType, projectManagementAppContextType } from './types'
import { createContext, useState } from 'react'
import { Home } from './pages/Home'
import { ProjectDetails } from './pages/ProjectDetails'
import { Navbar } from './components/Navbar'
import LoginScreen from './components/LoginScreen'

export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)
function App() {
  const [screenState, setScreenState] = useState<string>("Login")

  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const screenArray : screensArrayType = {
    "Login": <LoginScreen />,
    "Home" : <Home/>,
    "Project Details" : <ProjectDetails />
  }


  return (
    <projectManagementAppContext.Provider value={{screenState, setScreenState, isAuthenticated, setIsAuthenticated}}>
      {isAuthenticated && <Navbar />}
      {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  )
}

export default App
