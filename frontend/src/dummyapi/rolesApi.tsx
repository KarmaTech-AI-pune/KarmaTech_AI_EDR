import { Role, PermissionType, RoleDefinition } from '../models';
import { ROLES as INITIAL_ROLES } from './database/dummyRoles';

// Create mutable copy of roles
const MUTABLE_ROLES: Record<string, RoleDefinition> = { ...INITIAL_ROLES };

export const rolesApi = {
  getAllRoles: (): RoleDefinition[] => {
    return Object.values(MUTABLE_ROLES);
  },

  getRoleByName: (roleName: Role): RoleDefinition => {
    return MUTABLE_ROLES[roleName.name];
  },

  checkPermission: (role: Role, permission: PermissionType): boolean => {
    const roleDefinition = MUTABLE_ROLES[role.name];
    return roleDefinition.permissions.includes(permission);
  },

  getRolePermissions: (role: Role): PermissionType[] => {
    return MUTABLE_ROLES[role.name].permissions;
  },

  getRoleDefinition: (role: Role): RoleDefinition => {
    return MUTABLE_ROLES[role.name];
  },

  updateRole: (role: Role, updatedRole: RoleDefinition): RoleDefinition => {
    if (!(role.name in MUTABLE_ROLES)) {
      throw new Error(`Role ${role} not found`);
    }
    MUTABLE_ROLES[role.name] = {
      ...MUTABLE_ROLES[role.name],
      ...updatedRole,
      id: MUTABLE_ROLES[role.name].id // Preserve the original ID
    };
    return MUTABLE_ROLES[role.name];
  },

  deleteRole: (role: Role): boolean => {
    if (!(role.name in MUTABLE_ROLES)) {
      return false;
    }
    delete MUTABLE_ROLES[role.name];
    return true;
  },

  createRole: (role: Role, roleDefinition: RoleDefinition): RoleDefinition => {
    if (role.name in MUTABLE_ROLES) {
      throw new Error(`Role ${role} already exists`);
    }
    MUTABLE_ROLES[role.name] = roleDefinition;
    return roleDefinition;
  }
};
