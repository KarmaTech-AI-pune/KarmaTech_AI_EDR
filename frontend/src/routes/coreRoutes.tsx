import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import LoginScreen from '../pages/LoginScreen';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';

const Dashboard = lazy(() => import('../components/Dashboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const UserProfile = lazy(() => import('../pages/UserProfile'));


export const coreRoutes: RouteObject[] = [
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
          {
            path: 'profile',
            element: <UserProfile />,
          }          
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
];
