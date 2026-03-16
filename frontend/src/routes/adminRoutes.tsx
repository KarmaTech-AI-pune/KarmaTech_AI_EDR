import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PermissionType } from '../models';

const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const MigrationManagement = lazy(() => import('../pages/MigrationManagement'));
const FeaturesManagement = lazy(() => import('../pages/FeaturesManagement'));
const ReleaseManagement = lazy(() => import('../components/adminpanel/ReleaseManagement'));

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    handle: { requiredPermission: PermissionType.SYSTEM_ADMIN },
    children: [
      {
        index: true,
        element: <AdminPanel />,
      },
      {
        path: 'migrations',
        element: <MigrationManagement />,
      },
      {
        path: 'features',
        element: <FeaturesManagement />,
      },
      {
        path: 'release',
        element: <ReleaseManagement />,
      },
    ],
  },
];
