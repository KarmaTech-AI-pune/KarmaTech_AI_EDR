import { UserRole } from './dummyusers';
// Comprehensive Permission Enum
export enum PermissionType {
  // Project Permissions
  VIEW_PROJECTS = 'VIEW_PROJECTS',
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',

  // Opportunity Permissions
  VIEW_OPPORTUNITIES = 'VIEW_OPPORTUNITIES',
  CREATE_OPPORTUNITY = 'CREATE_OPPORTUNITY',
  EDIT_OPPORTUNITY = 'EDIT_OPPORTUNITY',
  DELETE_OPPORTUNITY = 'DELETE_OPPORTUNITY',

  // Go/No-Go Permissions
  VIEW_GO_NO_GO = 'VIEW_GO_NO_GO',
  CREATE_GO_NO_GO = 'CREATE_GO_NO_GO',
  APPROVE_GO_NO_GO = 'APPROVE_GO_NO_GO',

  // User Management Permissions
  VIEW_USERS = 'VIEW_USERS',
  CREATE_USER = 'CREATE_USER',
  EDIT_USER = 'EDIT_USER',
  DELETE_USER = 'DELETE_USER',

  // Business Development Permissions
  VIEW_BUSINESS_DEVELOPMENT = 'VIEW_BUSINESS_DEVELOPMENT',
  MANAGE_BUSINESS_DEVELOPMENT = 'MANAGE_BUSINESS_DEVELOPMENT',

  // Reporting Permissions
  VIEW_REPORTS = 'VIEW_REPORTS',
  GENERATE_REPORTS = 'GENERATE_REPORTS',

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
    permissions: Object.values(PermissionType)  // Full access
  },
  [UserRole.ManagingDirector]: {
    id: 'managing_director',
    name: 'Managing Director',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.VIEW_OPPORTUNITIES,
      PermissionType.VIEW_GO_NO_GO,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_REPORTS,
      PermissionType.GENERATE_REPORTS,
      PermissionType.APPROVE_GO_NO_GO
    ]
  },
  [UserRole.ProjectManager]: {
    id: 'project_manager',
    name: 'Project Manager',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.VIEW_GO_NO_GO,
      PermissionType.VIEW_REPORTS
    ]
  },
  [UserRole.ProjectCoordinator]: {
    id: 'project_coordinator',
    name: 'Project Coordinator',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.VIEW_GO_NO_GO
    ]
  },
  [UserRole.BusinessDevelopmentManager]: {
    id: 'business_dev_manager',
    name: 'Business Development Manager',
    permissions: [
      PermissionType.VIEW_OPPORTUNITIES,
      PermissionType.CREATE_OPPORTUNITY,
      PermissionType.EDIT_OPPORTUNITY,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
      PermissionType.CREATE_GO_NO_GO
    ]
  },
  [UserRole.SalesProfessional]: {
    id: 'sales_professional',
    name: 'Sales Professional',
    permissions: [
      PermissionType.VIEW_OPPORTUNITIES,
      PermissionType.CREATE_OPPORTUNITY
    ]
  },
  [UserRole.Director]: {
    id: 'director',
    name: 'Director',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.VIEW_OPPORTUNITIES,
      PermissionType.VIEW_GO_NO_GO,
      PermissionType.VIEW_REPORTS
    ]
  },
  [UserRole.RegionalDirector]: {
    id: 'regional_director',
    name: 'Regional Director',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.VIEW_OPPORTUNITIES,
      PermissionType.VIEW_GO_NO_GO,
      PermissionType.VIEW_REPORTS
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
