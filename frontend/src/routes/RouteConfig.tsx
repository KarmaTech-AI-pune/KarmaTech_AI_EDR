import { RouteObject } from 'react-router-dom';
import { businessDevelopmentRoutes } from './businessDevelopmentRoutes';
import { programManagementRoutes } from './programManagementRoutes';
import { adminRoutes } from './adminRoutes';
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginScreen from '../pages/LoginScreen';
import EnhancedLoginScreen from '../pages/EnhancedLoginScreen';
import Signup from '../pages/Signup';
import Dashboard from '../components/Dashboard';
import NotFound from '../pages/NotFound';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import { lazy } from 'react';

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
