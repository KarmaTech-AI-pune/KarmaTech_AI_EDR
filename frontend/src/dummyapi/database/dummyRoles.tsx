import { UserRole } from './dummyusers';
// Comprehensive Permission Enum
export enum PermissionType {
  // Project Permissions
  VIEW_PROJECTS = 'VIEW_PROJECTS',
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  
  // Business Development Permissions
  VIEW_BUSINESS_DEVELOPMENT = 'VIEW_BUSINESS_DEVELOPMENT',
  CREATE_BUSINESS_DEVELOPMENT = 'CREATE_BUSINESS_DEVELOPMENT',
  EDIT_BUSINESS_DEVELOPMENT = 'EDIT_BUSINESS_DEVELOPMENT',
  DELETE_BUSINESS_DEVELOPMENT = 'DELETE_BUSINESS_DEVELOPMENT',

  // System Permissions
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}


// Role Definition with Permissions
export interface RoleDefinition {
  id: string;
  name: string;
  permissions: PermissionType[];
}

// Predefined Roles with Specific Permissions
export const ROLES: Record<UserRole, RoleDefinition> = {
  [UserRole.Admin]: {
    id: 'admin',
    name: 'Administrator',
    permissions:[
        PermissionType.VIEW_PROJECTS,
        PermissionType.CREATE_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.DELETE_PROJECT,
  
        PermissionType.CREATE_BUSINESS_DEVELOPMENT,
        PermissionType.EDIT_BUSINESS_DEVELOPMENT,
        PermissionType.DELETE_BUSINESS_DEVELOPMENT,
        PermissionType.VIEW_BUSINESS_DEVELOPMENT,

        PermissionType.SYSTEM_ADMIN
    ]  // Full access
  },
  [UserRole.ManagingDirector]: {
    id: 'managing_director',
    name: 'Managing Director',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,

      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.ProjectManager]: {
    id: 'project_manager',
    name: 'Project Manager',
    permissions: [
        PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
    ]
  },
  [UserRole.ProjectCoordinator]: {
    id: 'project_coordinator',
    name: 'Project Coordinator',
    permissions: [
        PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
    ]
  },
  [UserRole.BusinessDevelopmentManager]: {
    id: 'business_dev_manager',
    name: 'Business Development Manager',
    permissions: [
        PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
        PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.SalesProfessional]: {
    id: 'sales_professional',
    name: 'Sales Professional',
    permissions: [
        PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.Director]: {
    id: 'director',
    name: 'Director',
    permissions: [
        PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.RegionalDirector]: {
    id: 'regional_director',
    name: 'Regional Director',
    permissions: [
        PermissionType.VIEW_PROJECTS,
        PermissionType.CREATE_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.DELETE_PROJECT,
        
        PermissionType.CREATE_BUSINESS_DEVELOPMENT,
        PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  }
};

// Utility function to check if a user has a specific permission
export const hasPermission = (role: UserRole, permission: PermissionType): boolean => {
  const roleDefinition = ROLES[role];
  return roleDefinition.permissions.includes(permission);
};

// Get all permissions for a specific role
export const getRolePermissions = (role: UserRole): PermissionType[] => {
  return ROLES[role].permissions;
};

// Get role definition by role
export const getRoleDefinition = (role: UserRole): RoleDefinition => {
  return ROLES[role];
};
