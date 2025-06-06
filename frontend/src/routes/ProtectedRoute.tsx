import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { PermissionType } from '../models';

interface ProtectedRouteProps {
  requiredPermission?: PermissionType;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  requiredPermission, 
  children 
}) => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  
  if (!context) {
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, currentUser } = context;

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if specific permission is required
  if (requiredPermission && currentUser?.roleDetails?.permissions) {
    const hasPermission = currentUser.roleDetails.permissions.includes(requiredPermission);
    if (!hasPermission) {
      return <Navigate to="/" replace />;
    }
  }

  // Render children if provided, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
