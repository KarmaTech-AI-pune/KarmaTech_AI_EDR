import { projectManagementAppContextType, UserWithRole  } from './types'
import { User} from './models'
import { Project, OpportunityTracking } from "./models"
import { GoNoGoDecision } from "./models/goNoGoDecisionModel"
import { createContext, useState, useEffect, useMemo } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProjectProvider } from './context/ProjectContext';
import { BusinessDevelopmentProvider } from './context/BusinessDevelopmentContext';
import { TenantProvider } from './hooks/useTenantContext';
import { authApi } from './services/authApi';
import { PermissionType } from './models';
import { routes } from './routes/RouteConfig';
import { UserSubscriptionProvider } from './context/UserSubscriptionContext'; // Import the new provider
import { initializeCaches } from './utils/cacheInitializer'; // Import cache initializer

export const projectManagementAppContext = createContext<projectManagementAppContextType | null>(null)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | OpportunityTracking | null>(null)

  const [currentGoNoGoDecision, setCurrentGoNoGoDecision] = useState<GoNoGoDecision | null>(null)
  const [goNoGoDecisionStatus, setGoNoGoDecisionStatus] = useState<string | null>(null);
  const [goNoGoVersionNumber, setGoNoGoVersionNumber] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [canEditOpportunity, setCanEditOpportunity] = useState(false);
  const [canDeleteOpportunity, setCanDeleteOpportunity] = useState(false);
  const [canSubmitForReview, setCanSubmitForReview] = useState(false);
  const [canReviewBD, setCanReviewBD] = useState(false);
  const [canApproveBD, setCanApproveBD] = useState(false);
  const [canSubmitForApproval, setCanSubmitForApproval] = useState(false);

  const [canProjectSubmitForReview, setProjectCanSubmitForReview] = useState(false);
  const [canProjectSubmitForApproval, setProjectCanSubmitForApproval] = useState(false);
  const [canProjectCanApprove, setProjectCanApprove] = useState(false);


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
          setProjectCanSubmitForReview(false)
          setProjectCanSubmitForApproval(false)
          setProjectCanApprove(false)
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
          // setCanSubmitForReview(
          //   user.roleDetails.permissions.includes(PermissionType.SUBMIT_FOR_REVIEW)
          // );
          setCanSubmitForApproval(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_FOR_APPROVAL)
          );
          setCanReviewBD(
            user.roleDetails.permissions.includes(PermissionType.REVIEW_BUSINESS_DEVELOPMENT)
          );
          setCanApproveBD(
            user.roleDetails.permissions.includes(PermissionType.APPROVE_BUSINESS_DEVELOPMENT)
          );

          //project approval workflow permissions
          setProjectCanSubmitForReview(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_REVIEW)
          );

          setProjectCanApprove(
            user.roleDetails.permissions.includes(PermissionType.APPROVE_PROJECT)
          );

          setProjectCanSubmitForApproval(
            user.roleDetails.permissions.includes(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL)
          );
        }
      } catch (err) {
        console.error('Error checking user permissions:', err as Error);
        setCanEditOpportunity(false);
        setCanDeleteOpportunity(false);
        setCanSubmitForReview(false);
        setCanReviewBD(false);
        setCanApproveBD(false);
        setProjectCanSubmitForReview(false)
        setProjectCanSubmitForApproval(false)
        setProjectCanApprove(false)
      }
    };

    checkUserPermissions();
  }, [user]);

  useEffect(() => {
    // Initialize caches on app startup
    initializeCaches();
    
    const checkAuth = async () => {
      try {
        const isValid = await authApi.checkAuth();

        if (isValid) {
          const userData = await authApi.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
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
    setSelectedProject(null);
    setCurrentGoNoGoDecision(null);
  };

  const contextValue = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
    user,
    setUser,
    handleLogout,
    selectedProject,
    setSelectedProject,
    currentGoNoGoDecision,
    setCurrentGoNoGoDecision,
    goNoGoDecisionStatus,
    setGoNoGoDecisionStatus,
    goNoGoVersionNumber,
    setGoNoGoVersionNumber,
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
    setCanSubmitForApproval,
    canProjectSubmitForReview,
    setProjectCanSubmitForReview,
    canProjectSubmitForApproval,
    setProjectCanSubmitForApproval,
    canProjectCanApprove,
    setProjectCanApprove,
  }), [
    isAuthenticated,
    user,
    selectedProject,
    currentGoNoGoDecision,
    goNoGoDecisionStatus,
    goNoGoVersionNumber,
    currentUser,
    canEditOpportunity,
    canDeleteOpportunity,
    canSubmitForReview,
    canReviewBD,
    canApproveBD,
    canSubmitForApproval,
    canProjectSubmitForReview,
    canProjectSubmitForApproval,
    canProjectCanApprove
  ]);

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

  const router = createBrowserRouter(routes);

  return (
    <projectManagementAppContext.Provider value={contextValue}>
      <TenantProvider>
        <UserSubscriptionProvider> {/* Wrap the application with UserSubscriptionProvider */}
          <ProjectProvider>
            <BusinessDevelopmentProvider>
              <RouterProvider router={router} />
            </BusinessDevelopmentProvider>
          </ProjectProvider>
        </UserSubscriptionProvider>
      </TenantProvider>
    </projectManagementAppContext.Provider>
  );
}

export default App;
