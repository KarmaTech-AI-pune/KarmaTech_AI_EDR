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
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,

      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,

      PermissionType.SYSTEM_ADMIN
    ] // Full access
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
  [UserRole.SeniorProjectManager]: {
    id: 'senior_project_manager',
    name: 'Senior Project Manager',
    permissions: [
      PermissionType.VIEW_PROJECTS,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
    ]
  },
  [UserRole.RegionalManager]: {
    id: 'regional_manager',
    name: 'Regional Manager',
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
  [UserRole.BusinessDevelopmentManager]: {
    id: 'business_dev_manager',
    name: 'Business Development Manager',
    permissions: [
      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.SubjectMatterExpert]: {
    id: 'subject_matter_expert',
    name: 'Subject Matter Expert',
    permissions: [
      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
    ]
  },
  [UserRole.BusinessDevelopmentHead]:{
    id: 'business_dev_head',
    name: 'Business Development Head',
    permissions : [
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
