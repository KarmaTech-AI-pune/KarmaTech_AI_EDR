import { UserRole,PermissionType, RoleDefinition } from '../../models';


export const ROLES: Record<UserRole, RoleDefinition> = {
  [UserRole.Admin]: {
    id: 'admin',
    name: 'Administrator',
    permissions: [
      PermissionType.VIEW_PROJECT,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.REVIEW_PROJECT,
      PermissionType.APPROVE_PROJECT,
      PermissionType.SUBMIT_PROJECT_FOR_REVIEW,
      PermissionType.SUBMIT_PROJECT_FOR_APPROVAL,

      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
      PermissionType.REVIEW_BUSINESS_DEVELOPMENT,
      PermissionType.APPROVE_BUSINESS_DEVELOPMENT,
      PermissionType.SUBMIT_FOR_REVIEW,
      PermissionType.SUBMIT_FOR_APPROVAL,

      PermissionType.SYSTEM_ADMIN
    ]
  },
  [UserRole.ProjectManager]: {
    id: 'project_manager',
    name: 'Project Manager',
    permissions: [
      PermissionType.VIEW_PROJECT,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.SUBMIT_PROJECT_FOR_REVIEW,
    ]
  },
  [UserRole.SeniorProjectManager]: {
    id: 'senior_project_manager',
    name: 'Senior Project Manager',
    permissions: [
      PermissionType.VIEW_PROJECT,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.REVIEW_PROJECT,
      PermissionType.SUBMIT_FOR_APPROVAL,
    ]
  },
  [UserRole.RegionalManager]: {
    id: 'regional_manager',
    name: 'Regional Manager',
    permissions: [
      PermissionType.VIEW_PROJECT,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.APPROVE_PROJECT,

      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
      PermissionType.REVIEW_BUSINESS_DEVELOPMENT,
      PermissionType.SUBMIT_FOR_APPROVAL,
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
      PermissionType.SUBMIT_FOR_REVIEW
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
  [UserRole.RegionalDirector]: {
    id: 'regional_director',
    name: 'Regional Director',
    permissions: [
      PermissionType.VIEW_PROJECT,
      PermissionType.CREATE_PROJECT,
      PermissionType.EDIT_PROJECT,
      PermissionType.DELETE_PROJECT,
      PermissionType.APPROVE_PROJECT,

      PermissionType.CREATE_BUSINESS_DEVELOPMENT,
      PermissionType.EDIT_BUSINESS_DEVELOPMENT,
      PermissionType.DELETE_BUSINESS_DEVELOPMENT,
      PermissionType.VIEW_BUSINESS_DEVELOPMENT,
      PermissionType.APPROVE_BUSINESS_DEVELOPMENT
    ]
  },
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
