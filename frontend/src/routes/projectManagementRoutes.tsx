import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { PermissionType } from '../models';
import NotFound from '../pages/NotFound';

const ProjectManagement = lazy(() => import('../pages/ProjectManagement'));
const ProjectDetails = lazy(() => import('../pages/projectManagement/ProjectDetails'));
const ResourceManagement = lazy(() => import('../components/ResourceManagement'));
const ProjectOverview = lazy(() => import('../pages/projectManagement/ProjectOverview'));
const ProjectForms = lazy(() => import('../pages/projectManagement/ProjectForms'));
const ProjectDocuments = lazy(() => import('../pages/projectManagement/ProjectDocuments'));
const ProjectTimeline = lazy(() => import('../pages/projectManagement/ProjectTimeline'));
const ProjectBudgetHistory = lazy(() => import('../pages/projectManagement/ProjectBudgetHistory'));

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
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: 'overview',
            element: <ProjectOverview />,
          },
          {
            path: 'forms',
            element: <ProjectForms />,
          },
          {
            path: 'forms/:formId',
            element: <ProjectForms />,
          },
          {
            path: 'forms/:formId/:subFormId',
            element: <ProjectForms />,
          },
          {
            path: 'documents',
            element: <ProjectDocuments />,
          },
          {
            path: 'timeline',
            element: <ProjectTimeline />,
          },
          {
            path: 'budget-history',
            element: <ProjectBudgetHistory />,
          },
          {
        path: '*',
        element: <NotFound />,
      },
        ]
      },
      {
        path: 'project/resources',
        element: <ResourceManagement />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
