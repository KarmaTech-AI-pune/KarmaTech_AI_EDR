import { screensArrayType, projectManagementAppContextType } from './types'
import { createContext, useState } from 'react'
import { Home } from './pages/Home'
import { ProjectDetails } from './pages/ProjectDetails'
import { Navbar } from './components/Navbar'


export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)
function App() {
  const [screenState, setScreenState] = useState<string>("Home")

  const screenArray : screensArrayType = {
    "Home" : <Home/>,
    "Project Details" : <ProjectDetails />
  }


  return (
    <projectManagementAppContext.Provider value={{screenState, setScreenState}}>
      <Navbar />
     {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  )
}

export default App
