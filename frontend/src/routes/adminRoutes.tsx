import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PermissionType } from '../models';

const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const MigrationManagement = lazy(() => import('../pages/MigrationManagement'));

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
    ],
  },
];
