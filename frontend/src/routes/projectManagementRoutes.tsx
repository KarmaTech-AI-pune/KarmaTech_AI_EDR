import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PermissionType } from '../models';

const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const ProjectDetails = lazy(() => import('../pages/ProjectDetails'));
const ResourceManagement = lazy(() => import('../components/ResourceManagement'));

export const projectManagementRoutes: RouteObject[] = [
  {
    path: 'project-management',
    handle: { requiredPermission: PermissionType.VIEW_PROJECT },
    children: [
      {
        index: true,
        element: <ProjectManagement />,
      },
      {
        path: 'project',
        element: <ProjectDetails />,
      },
      {
        path: 'project/resources',
        element: <ResourceManagement />,
      },
    ],
  },
];
