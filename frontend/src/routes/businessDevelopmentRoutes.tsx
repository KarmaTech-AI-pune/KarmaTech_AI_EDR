import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { PermissionType } from '../models';

const BusinessDevelopment = lazy(() => import('../pages/BusinessDevelopment'));
const BusinessDevelopmentDetails = lazy(() => import('../pages/BusinessDevelopmentDetails'));
const GoNoGoForm = lazy(() => import('../components/forms/GoNoGoForm'));
const BidPreparationForm = lazy(() => import('../components/forms/BidPreparationForm'));
const GoNoGoFormWrapper = lazy(() => import('../components/GoNoGoFormWrapper'));

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
        path: ':id',
        element: <BusinessDevelopmentDetails />,
      },
      {
        path: ':id/gonogo-form',
        element: <GoNoGoFormWrapper />,
      },
      {
        path: ':id/bid-preparation',
        element: <BidPreparationForm />,
      },
    ],
  },
];
