
export interface Permission {
  id: number;
  name: string;
  description: string | null;
  category: string;
  roles: any[];
}

export interface PermissionGroup {
  category: string;
  permissions: Permission[];
}

// Basic role definition with simple permission names
export interface RoleDefinition {
  id: string;
  name: string;
  permissions: string[]; // Just permission names for backward compatibility
}

// Extended role definition with grouped permissions
export interface RoleWithPermissions {
  id: string;
  name: string;
  permissions: PermissionGroup[];
}

// Helper function to convert between formats
export const convertToGroupedPermissions = (
  role: RoleDefinition,
  allPermissions: Permission[]
): RoleWithPermissions => {
  const groupedPermissions = allPermissions.reduce((groups: Record<string, Permission[]>, permission) => {
    if (role.permissions.includes(permission.name)) {
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
    permissions: Object.entries(groupedPermissions).map(([category, permissions]) => ({
      category,
      permissions
    }))
  };
};

export const convertToSimplePermissions = (role: RoleWithPermissions): RoleDefinition => ({
  id: role.id,
  name: role.name,
  permissions: role.permissions.flatMap(group => group.permissions.map(p => p.name))
});
