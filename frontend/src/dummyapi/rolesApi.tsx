import { UserRole, PermissionType, RoleDefinition } from '../models';
import { ROLES as INITIAL_ROLES } from './database/dummyRoles';

// Create mutable copy of roles
let MUTABLE_ROLES: Record<UserRole, RoleDefinition> = { ...INITIAL_ROLES };

export const rolesApi = {
  getAllRoles: (): RoleDefinition[] => {
    return Object.values(MUTABLE_ROLES);
  },

  getRoleByName: (roleName: UserRole): RoleDefinition => {
    return MUTABLE_ROLES[roleName];
  },

  checkPermission: (role: UserRole, permission: PermissionType): boolean => {
    const roleDefinition = MUTABLE_ROLES[role];
    return roleDefinition.permissions.includes(permission);
  },

  getRolePermissions: (role: UserRole): PermissionType[] => {
    return MUTABLE_ROLES[role].permissions;
  },

  getRoleDefinition: (role: UserRole): RoleDefinition => {
    return MUTABLE_ROLES[role];
  },

  updateRole: (role: UserRole, updatedRole: RoleDefinition): RoleDefinition => {
    if (!(role in MUTABLE_ROLES)) {
      throw new Error(`Role ${role} not found`);
    }
    MUTABLE_ROLES[role] = {
      ...MUTABLE_ROLES[role],
      ...updatedRole,
      id: MUTABLE_ROLES[role].id // Preserve the original ID
    };
    return MUTABLE_ROLES[role];
  },

  deleteRole: (role: UserRole): boolean => {
    if (!(role in MUTABLE_ROLES)) {
      return false;
    }
    delete MUTABLE_ROLES[role];
    return true;
  },

  createRole: (role: UserRole, roleDefinition: RoleDefinition): RoleDefinition => {
    if (role in MUTABLE_ROLES) {
      throw new Error(`Role ${role} already exists`);
    }
    MUTABLE_ROLES[role] = roleDefinition;
    return roleDefinition;
  }
};
