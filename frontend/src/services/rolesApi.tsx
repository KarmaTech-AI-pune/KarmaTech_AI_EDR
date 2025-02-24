import { RoleDefinition} from '../models/roleDefinitionModel';
import { PermissionType } from '../models/permissionTypeModel';
import { axiosInstance } from './axiosConfig';

export interface RolePermissionDto {
  id: string;
  name: string;
  description: string;
}

export interface PermissionDto {
  id: number;
  name: string;
  description: string;
  category: string;
  roles: RolePermissionDto[];
}

export interface PermissionCategoryGroup {
  category: string;
  permissions: PermissionDto[];
}

export interface RoleWithPermissionsDto {
  id: string;
  name: string;
  permissions: PermissionCategoryGroup[];
}

export const getAllRoles = async (): Promise<RoleDefinition[]> => {
  try {
    const response = await axiosInstance.get('/api/role');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getAllRolesWithPermissions = async (): Promise<RoleWithPermissionsDto[]> => {
  try {
    const response = await axiosInstance.get('/api/role/getRolesWithPermissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

export const getRoleById = async (id: string): Promise<RoleDefinition> => {
  try {
    const response = await axiosInstance.get(`/api/role/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
};

export const createRole = async (role: RoleWithPermissionsDto): Promise<RoleWithPermissionsDto> => {
  try {
    const response = await axiosInstance.post('/api/role', role);
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (id: string, role: RoleWithPermissionsDto): Promise<RoleWithPermissionsDto> => {
  try {
    const response = await axiosInstance.put(`/api/role/${id}`, role);
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const deleteRole = async (id: string): Promise<boolean> => {
  try {
    await axiosInstance.delete(`/api/role/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

export const getAllPermissions = async (): Promise<PermissionCategoryGroup[]> => {
  try {
    const response = await axiosInstance.get('/api/role/permissions');
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

export const getPermissionsByGroupedByCategory = async (): Promise<PermissionCategoryGroup[]> => {
  try {
    const response = await axiosInstance.get('/api/role/getPermissionsByGroupedByCategory');
    return response.data;
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

export const getRolePermissions = async (roleId: string): Promise<PermissionDto[]> => {
  try {
    const response = await axiosInstance.get(`/api/role/${roleId}/permissions`);
    return response.data;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

export const updateRolePermissions = async (roleId: string, permissions: PermissionType[]): Promise<boolean> => {
  try {
    // Convert enum values to strings for API
    const permissionStrings = permissions.map(p => p.toString());
    await axiosInstance.put(`/api/role/${roleId}/permissions`, { permissions: permissionStrings });
    return true;
  } catch (error) {
    console.error('Error updating role permissions:', error);
    throw error;
  }
};

// Helper functions for type conversion
export const toRoleDefinition = (role: RoleWithPermissionsDto): RoleDefinition => ({
  id: role.id,
  name: role.name,
  permissions: role.permissions.flatMap(group => 
    group.permissions.map(p => PermissionType[p.name as keyof typeof PermissionType])
  ).filter((p): p is PermissionType => p !== undefined)
});

export const fromRoleDefinition = (role: RoleDefinition, permissions: PermissionDto[]): RoleWithPermissionsDto => {
  // Group permissions by category and ensure type safety
  const groupedPermissions = permissions.reduce<Record<string, PermissionDto[]>>((groups, permission) => {
    const category = permission.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    // Check if the permission name exists in PermissionType enum
    const permissionType = PermissionType[permission.name as keyof typeof PermissionType];
    if (permissionType && role.permissions.includes(permissionType)) {
      groups[category].push(permission);
    }
    return groups;
  }, {});

  // Convert to PermissionCategoryGroup array with proper typing
  const permissionGroups: PermissionCategoryGroup[] = Object.entries(groupedPermissions).map(([category, perms]) => ({
    category,
    permissions: perms
  }));

  return {
    id: role.id,
    name: role.name,
    permissions: permissionGroups
  };
};
