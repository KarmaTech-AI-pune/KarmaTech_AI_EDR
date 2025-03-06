import { ReactElement } from 'react';
import { projectManagementAppContextType, UserWithRole  } from './types'
import { User} from './models'
import { Project, OpportunityTracking } from "./models"
import { GoNoGoDecision } from "./models/goNoGoDecisionModel"
import { createContext, useState, useEffect } from 'react'
import { Home, ProjectDetails, LoginScreen, BusinessDevelopment, ProjectManagement, BusinessDevelopmentDetails, AdminPanel } from './pages'
import { Navbar } from './components/navigation/Navbar'
import { Dashboard } from './components/Dashboard'
import { ResourceManagement } from './components/ResourceManagement'
import { authApi } from './services/authApi'
import { PermissionType } from './models'
import GoNoGoForm from './components/forms/GoNoGoForm'
import BidPreparationForm from './components/forms/BidPreparationForm'
export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)

function App() {
  const [screenState, setScreenState] = useState<string>("Login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | OpportunityTracking | null>(null)

  const [currentGoNoGoDecision, setCurrentGoNoGoDecision] = useState<GoNoGoDecision | null>(null)
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canEditOpportunity, setCanEditOpportunity] = useState(false);
  const [canDeleteOpportunity, setCanDeleteOpportunity] = useState(false);
  const [canSubmitForReview, setCanSubmitForReview] = useState(false);
  const [canReviewBD, setCanReviewBD] = useState(false);
  const [canApproveBD, setCanApproveBD] = useState(false);
  const [canSubmitForApproval, setCanSubmitForApproval] = useState(false);

  useEffect(() => {
    const checkUserPermissions = async () => {
      try {
        const user = await authApi.getCurrentUser();
        
        if (!user) {
          setCurrentUser(null);
          setCanEditOpportunity(false);
          setCanDeleteOpportunity(false);
          setCanSubmitForReview(false);
          setCanReviewBD(false);
          setCanApproveBD(false);
          return;
        }
 
        setCurrentUser(user);

        if (user.roleDetails) {
          setCanEditOpportunity(
            user.roleDetails.permissions.includes(PermissionType.EDIT_BUSINESS_DEVELOPMENT)
          );
          setCanDeleteOpportunity(
            user.roleDetails.permissions.includes(PermissionType.DELETE_BUSINESS_DEVELOPMENT)
          );
          setCanSubmitForReview(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_FOR_REVIEW)
          );
          setCanSubmitForApproval(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_FOR_APPROVAL)
          );
          setCanReviewBD(
            user.roleDetails.permissions.includes(PermissionType.REVIEW_BUSINESS_DEVELOPMENT)
          );
          setCanApproveBD(
            user.roleDetails.permissions.includes(PermissionType.APPROVE_BUSINESS_DEVELOPMENT)
          );
        }
      } catch (err) {
        console.error('Error checking user permissions:', err as Error);
        setCanEditOpportunity(false);
        setCanDeleteOpportunity(false);
        setCanSubmitForReview(false);
        setCanReviewBD(false);
        setCanApproveBD(false);
      }
    };
    
    checkUserPermissions();
  }, [user]);

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
      } catch (err) {
        console.error('Error checking auth:', err as Error);
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
    setCurrentGoNoGoDecision(null);
  };

  const screenArray: { [key: string]: ReactElement } = {
    "Login": <LoginScreen />,
    "Home": <Home />,
    "Dashboard": <Dashboard />,
    "Business Development": <BusinessDevelopment />,
    "Project Management": <ProjectManagement />,
    "Resources": <ResourceManagement />,
    "Project Details": <ProjectDetails />,
    "Business Development Details": <BusinessDevelopmentDetails />,
    "Bid Preparation Form" : <BidPreparationForm/>,
    "GoNoGo Form" : selectedProject ? (
      <GoNoGoForm 
        onDecisionStatusChange={(status) => {
          // Update the current decision based on the status
          if (currentGoNoGoDecision) {
            const updatedDecision = { ...currentGoNoGoDecision, status: status === "GO" ? 1 : 0 };
            setCurrentGoNoGoDecision(updatedDecision);
          }
          setScreenState("Business Development Details");
        }}
      />
    ) : <div>No project selected</div>,
    "Admin Panel": <AdminPanel />,
  };

  if (isLoading) {
    return (
      <span style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </span>
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
      setSelectedProject,
      currentGoNoGoDecision,
      setCurrentGoNoGoDecision,
      currentUser,
      setCurrentUser,
      canEditOpportunity,
      setCanEditOpportunity,
      canDeleteOpportunity,
      setCanDeleteOpportunity,
      canSubmitForReview,
      setCanSubmitForReview,
      canReviewBD,
      setCanReviewBD,
      canApproveBD,
      setCanApproveBD,
      canSubmitForApproval,
      setCanSubmitForApproval
    }}>
      {isAuthenticated && <Navbar />}
      {screenArray[screenState]}
    </projectManagementAppContext.Provider>
  );
}

export default App;
