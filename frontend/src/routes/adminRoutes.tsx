import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PermissionType } from '../models';

const AdminPanel = lazy(() => import('../pages/AdminPanel'));

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    handle: { requiredPermission: PermissionType.SYSTEM_ADMIN },
    children: [
      {
        index: true,
        element: <AdminPanel />,
      },
    ],
  },
];
