import { screensArrayType, projectManagementAppContextType, User, Project } from './types'
import { createContext, useState, useEffect } from 'react'
import { Home } from './pages/Home'
import { ProjectDetails } from './pages/ProjectDetails'
import { Navbar } from './components/navigation/Navbar'
import LoginScreen from './components/LoginScreen'
import { Dashboard } from './components/Dashboard'
import { ProjectList } from './components/projects/ProjectList'
import { ResourceManagement } from './components/ResourceManagement'
import { ReportsList } from './components/ReportsList'
import { NotificationCenter } from './components/navigation/NotificationCenter'
import { authApi } from './services/api'

export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)

function App() {
  const [screenState, setScreenState] = useState<string>("Login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await authApi.checkAuth();
        
        if (isValid) {
          const userData = await authApi.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            setScreenState("Home");
          } else {
            handleLogout();
          }
        }
      } catch (error) {
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setScreenState("Login");
    setSelectedProject(null);
  };

  const screenArray : screensArrayType = {
    "Login": <LoginScreen />,
    "Home": <Home />,
    "Dashboard": <Dashboard />,
    "Projects": <ProjectList />,
    "Resources": <ResourceManagement />,
    "Reports": <ReportsList />,
    "Notifications": <NotificationCenter />,
    "Project Details": <ProjectDetails />
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <projectManagementAppContext.Provider value={{
      screenState, 
      setScreenState, 
      isAuthenticated, 
      setIsAuthenticated,
      user,
      setUser,
      handleLogout,
      selectedProject,
      setSelectedProject
    }}>
      {isAuthenticated && <Navbar />}
      {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  );
}

export default App;
