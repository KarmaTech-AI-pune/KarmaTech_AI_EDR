import { RouteObject } from 'react-router-dom';
import { coreRoutes } from './coreRoutes';
import { businessDevelopmentRoutes } from './businessDevelopmentRoutes';
import { projectManagementRoutes } from './projectManagementRoutes';
import { adminRoutes } from './adminRoutes';
import Layout from '../components/Layout';
import ProtectedRoute from './ProtectedRoute';
import LoginScreen from '../pages/LoginScreen';
import Dashboard from '../components/Dashboard';
import NotFound from '../components/NotFound';

const protectedRoutes: RouteObject[] = [
  ...businessDevelopmentRoutes,
  ...projectManagementRoutes,
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
        path: '',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Dashboard />,
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
