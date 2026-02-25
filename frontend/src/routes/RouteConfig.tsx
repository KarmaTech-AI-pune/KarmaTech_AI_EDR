import { RouteObject } from 'react-router-dom';
import { businessDevelopmentRoutes } from './businessDevelopmentRoutes';
import { programManagementRoutes } from './programManagementRoutes';
import { adminRoutes } from './adminRoutes';
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';
import { lazy } from 'react';

const LoginScreen = lazy(() => import('../pages/LoginScreen'));
const EnhancedLoginScreen = lazy(() => import('../pages/EnhancedLoginScreen'));
const Signup = lazy(() => import('../pages/Signup'));
const Dashboard = lazy(() => import('../components/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const UserProfile = lazy(() => import('../pages/UserProfile'));

const protectedRoutes: RouteObject[] = [
  ...businessDevelopmentRoutes,
  ...programManagementRoutes,
  ...adminRoutes,
];

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
        path: 'signup', 
        element: <Signup />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password',
        element: <ResetPassword />,
      },
      {
        path: '',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'profile',
            element: <UserProfile />,
          },                 
          ...protectedRoutes,
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

export default routes;
