import { useContext, lazy } from 'react';
import { RouteObject, Outlet, useLocation, Navigate } from 'react-router-dom';
import LoginScreen from '../pages/LoginScreen';
import EnhancedLoginScreen from '../pages/EnhancedLoginScreen';
import ProtectedRoute from './ProtectedRoute.tsx';
import { PermissionType } from '../models';
import { LoadingProvider } from '../context/LoadingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { useAppNavigation } from '../hooks/useAppNavigation';

const Home = lazy(() => import('../pages/Home'));
const NotFound = lazy(() => import('../components/NotFound'));
const Dashboard = lazy(() => import('../components/Dashboard'));
const Navbar = lazy(() => import('../components/navigation/Navbar'));
const ProjectDetails = lazy(() => import('../pages/ProjectDetails'));
const GoNoGoForm = lazy(() => import('../components/forms/GoNoGoForm'));
const BidPreparationForm = lazy(() => import('../components/forms/BidPreparationForm'));
const BusinessDevelopment = lazy(() => import('../pages/BusinessDevelopment'));
const BusinessDevelopmentDetails = lazy(() => import('../pages/BusinessDevelopmentDetails'));
const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const ResourceManagement = lazy(() => import('../components/ResourceManagement'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));

// Layout component that includes Navbar
const Layout = () => {
  const location = useLocation();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;

  // Don't show navbar on login pages
  const showNavbar = !['/login', '/enhanced-login'].includes(location.pathname) && context?.isAuthenticated;

  return (
    <LoadingProvider>
      <LoadingSpinner />
      {showNavbar && <Navbar />}
      <Outlet />
    </LoadingProvider>
  );
};

// Wrapper component for GoNoGoForm to handle navigation
const GoNoGoFormWrapper = () => {
  const navigation = useAppNavigation();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;

  const handleDecisionStatusChange = (status: string, versionNumber: number) => {
    // Update the current decision based on the status
    if (context?.currentGoNoGoDecision && context?.setCurrentGoNoGoDecision) {
      const updatedDecision = {
        ...context.currentGoNoGoDecision,
        status: status === "GO" ? 1 : 0
      };
      context.setCurrentGoNoGoDecision(updatedDecision);
    }

    // Update the Go/No Go decision status and version number
    if (context?.setGoNoGoDecisionStatus && context?.setGoNoGoVersionNumber) {
      context.setGoNoGoDecisionStatus(status);
      context.setGoNoGoVersionNumber(versionNumber);
    }

    // Navigate back to Business Development Details
    navigation.navigateToBusinessDevelopmentDetails();
  };

  return <GoNoGoForm onDecisionStatusChange={handleDecisionStatusChange} />;
};

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: 'login',
        element: <LoginScreen />,
      },
      {
        path: 'enhanced-login',
        element: <EnhancedLoginScreen />,
      },
      {
        path: '',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Navigate to="dashboard" replace />,
          },
          {
            path: 'home',
            element: <Home />,
          },
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'business-development',
            element: <ProtectedRoute requiredPermission={PermissionType.VIEW_BUSINESS_DEVELOPMENT} />,
            children: [
              {
                index: true,
                element: <BusinessDevelopment />,
              },
              {
                path: ':id',
                element: <BusinessDevelopmentDetails />,
              },
              {
                path: ':id/gonogo-form',
                element: <GoNoGoFormWrapper />,
              },
              {
                path: ':id/bid-preparation',
                element: <BidPreparationForm />,
              },
            ],
          },
          {
            path: 'project-management',
            element: <ProtectedRoute requiredPermission={PermissionType.VIEW_PROJECT} />,
            children: [
              {
                index: true,
                element: <ProjectManagement />,
              },
              {
                path: ':id',
                element: <ProjectDetails />,
              },
              {
                path: ':id/resources',
                element: <ResourceManagement />,
              },
            ],
          },
          {
            path: 'admin',
            element: <ProtectedRoute requiredPermission={PermissionType.SYSTEM_ADMIN} />,
            children: [
              {
                index: true,
                element: <AdminPanel />,
              },
            ],
          },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];

  export default routes;
