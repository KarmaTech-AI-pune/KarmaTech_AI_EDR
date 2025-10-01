import { PermissionType } from './permissionTypeModel';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  category: string;
  roles: any[];
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

// Basic role definition with simple permission names hhh
export interface RoleDefinition {
  id: string;
  name: string;
  minRate: number,
  isResourceRole: boolean,
  permissions: PermissionType[]; // Array of permission types
}

// Extended role definition with grouped permissions
export interface RoleWithPermissions {
  id: string;
  name: string;
  minRate: number
  isResourceRole: boolean,
  permissions: PermissionGroup[];
}

// Helper function to convert between formats
export const convertToGroupedPermissions = (
  role: RoleDefinition,
  allPermissions: Permission[]
): RoleWithPermissions => {
  const groupedPermissions = allPermissions.reduce((groups: Record<string, Permission[]>, permission) => {
    if (role.permissions.includes(permission.name as unknown as PermissionType)) {
      if (!groups[permission.category]) {
        groups[permission.category] = [];
      }
      groups[permission.category].push(permission);
    }
    return groups;
  }, {});

  return {
    id: role.id,
    name: role.name,
    minRate: role.minRate,
    isResourceRole: role.isResourceRole,
    permissions: Object.entries(groupedPermissions).map(([category, permissions]) => ({
      category,
      permissions
    }))
  };
};

export const convertToSimplePermissions = (role: RoleWithPermissions): RoleDefinition => ({
  id: role.id,
  name: role.name,
  minRate: role.minRate,
  isResourceRole: role.isResourceRole,
  permissions: role.permissions.flatMap(group =>
    group.permissions.map(p => p.name as unknown as PermissionType)
  )
});
