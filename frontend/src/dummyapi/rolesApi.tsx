import { UserRole , PermissionType, RoleDefinition} from '../models';
import { ROLES, hasPermission, getRolePermissions, getRoleDefinition } from './database/dummyRoles';

export const rolesApi = {
  getAllRoles: (): RoleDefinition[] => {
    return Object.values(ROLES);
  },

  getRoleByName: (roleName: UserRole): RoleDefinition => {
    return ROLES[roleName];
  },

  checkPermission: (role: UserRole, permission: PermissionType): boolean => {
    return hasPermission(role, permission);
  },

  getRolePermissions: (role: UserRole): PermissionType[] => {
    return getRolePermissions(role);
  },

  getRoleDefinition: (role: UserRole): RoleDefinition => {
    return getRoleDefinition(role);
  }
};
