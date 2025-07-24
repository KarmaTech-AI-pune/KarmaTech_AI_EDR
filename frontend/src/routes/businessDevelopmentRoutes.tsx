import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { PermissionType } from '../models';

const BusinessDevelopment = lazy(() => import('../pages/BusinessDevelopment'));
const BusinessDevelopmentDetails = lazy(() => import('../pages/BusinessDevelopmentDetails'));
const BOverview = lazy(() => import('../pages/businessDevelopment/BOverview'));
const BForms = lazy(() => import('../pages/businessDevelopment/BForms'));
const BFormRenderer = lazy(() => import('../pages/businessDevelopment/BFormRenderer'));
const BDocuments = lazy(() => import('../pages/businessDevelopment/BDocuments'));
const BTimeline = lazy(() => import('../pages/businessDevelopment/BTimeline'));

export const businessDevelopmentRoutes: RouteObject[] = [
  {
    path: 'business-development',
    handle: { requiredPermission: PermissionType.VIEW_BUSINESS_DEVELOPMENT },
    children: [
      {
        index: true,
        element: <BusinessDevelopment />,
      },
      {
        path: 'details',
        element: <BusinessDevelopmentDetails />,
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: 'overview',
            element: <BOverview />,
          },
          {
            path: 'forms',
            element: <BForms />,
          },
          {
            path: 'forms/:formId',
            element: <BFormRenderer />,
          },
          {
            path: 'documents',
            element: <BDocuments />,
          },
          {
            path: 'timeline',
            element: <BTimeline />,
          },
        ],
      },
    ],
  },
];
