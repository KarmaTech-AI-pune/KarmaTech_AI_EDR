import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import * as rolesApi from './rolesApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';
import { PermissionType } from '../models/permissionTypeModel';

describe('rolesApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    // Suppress console.error in tests for intentional errors
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('API endpoints', () => {
    it('getAllRoles', async () => {
      mockAxios.onGet('/api/role').reply(200, [{ id: '1', name: 'Admin' }]);
      const result = await rolesApi.getAllRoles();
      expect(result).toEqual([{ id: '1', name: 'Admin' }]);
    });
    
    it('getAllRoles throws', async () => {
      mockAxios.onGet('/api/role').reply(500);
      await expect(rolesApi.getAllRoles()).rejects.toThrow();
    });

    it('getAllRolesWithPermissions', async () => {
      mockAxios.onGet('/api/role/getRolesWithPermissions').reply(200, [{ id: '1' }]);
      const result = await rolesApi.getAllRolesWithPermissions();
      expect(result).toEqual([{ id: '1' }]);
    });

    it('getAllRolesWithPermissions throws', async () => {
      mockAxios.onGet('/api/role/getRolesWithPermissions').reply(500);
      await expect(rolesApi.getAllRolesWithPermissions()).rejects.toThrow();
    });

    it('getRoleById', async () => {
      mockAxios.onGet('/api/role/123').reply(200, { id: '123' });
      const result = await rolesApi.getRoleById('123');
      expect(result).toEqual({ id: '123' });
    });

    it('getRoleById throws', async () => {
      mockAxios.onGet('/api/role/123').reply(500);
      await expect(rolesApi.getRoleById('123')).rejects.toThrow();
    });

    it('createRole', async () => {
      const payload: any = [{ id: 'new' }];
      mockAxios.onPost('/api/role').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { id: 'created' }];
      });
      const result = await rolesApi.createRole(payload);
      expect(result).toEqual({ id: 'created' });
    });

    it('createRole throws', async () => {
      mockAxios.onPost('/api/role').reply(500);
      await expect(rolesApi.createRole([] as any)).rejects.toThrow();
    });

    it('updateRole', async () => {
      const payload: any = { id: '123' };
      mockAxios.onPut('/api/role/123').reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { id: 'updated' }];
      });
      const result = await rolesApi.updateRole('123', payload);
      expect(result).toEqual({ id: 'updated' });
    });

    it('updateRole throws', async () => {
      mockAxios.onPut('/api/role/123').reply(500);
      await expect(rolesApi.updateRole('123', {} as any)).rejects.toThrow();
    });

    it('deleteRole', async () => {
      mockAxios.onDelete('/api/role/123').reply(200);
      const result = await rolesApi.deleteRole('123');
      expect(result).toBe(true);
    });

    it('deleteRole throws', async () => {
      mockAxios.onDelete('/api/role/123').reply(500);
      await expect(rolesApi.deleteRole('123')).rejects.toThrow();
    });

    it('getAllPermissions', async () => {
      mockAxios.onGet('/api/role/permissions').reply(200, [{ category: 'Admin' }]);
      const result = await rolesApi.getAllPermissions();
      expect(result).toEqual([{ category: 'Admin' }]);
    });

    it('getAllPermissions throws', async () => {
      mockAxios.onGet('/api/role/permissions').reply(500);
      await expect(rolesApi.getAllPermissions()).rejects.toThrow();
    });

    it('getPermissionsByGroupedByCategory', async () => {
      mockAxios.onGet('/api/role/getPermissionsByGroupedByCategory').reply(200, [{ category: 'Admin' }]);
      const result = await rolesApi.getPermissionsByGroupedByCategory();
      expect(result).toEqual([{ category: 'Admin' }]);
    });

    it('getPermissionsByGroupedByCategory throws', async () => {
      mockAxios.onGet('/api/role/getPermissionsByGroupedByCategory').reply(500);
      await expect(rolesApi.getPermissionsByGroupedByCategory()).rejects.toThrow();
    });

    it('getRolePermissions', async () => {
      mockAxios.onGet('/api/role/123/permissions').reply(200, [{ id: 1 }]);
      const result = await rolesApi.getRolePermissions('123');
      expect(result).toEqual([{ id: 1 }]);
    });

    it('getRolePermissions throws', async () => {
      mockAxios.onGet('/api/role/123/permissions').reply(500);
      await expect(rolesApi.getRolePermissions('123')).rejects.toThrow();
    });

    it('updateRolePermissions', async () => {
      const perms = [PermissionType.SYSTEM_ADMIN];
      mockAxios.onPut('/api/role/123/permissions').reply((config) => {
        expect(JSON.parse(config.data).permissions).toEqual([PermissionType.SYSTEM_ADMIN.toString()]);
        return [200];
      });
      const result = await rolesApi.updateRolePermissions('123', perms);
      expect(result).toBe(true);
    });

    it('updateRolePermissions throws', async () => {
      mockAxios.onPut('/api/role/123/permissions').reply(500);
      await expect(rolesApi.updateRolePermissions('123', [])).rejects.toThrow();
    });
  });

  describe('Helpers', () => {
    it('toRoleDefinition maps permissions back correctly', () => {
      const input: any = {
        id: '1',
        name: 'Role',
        isResourceRole: false,
        permissions: [
          {
            permissions: [{ name: 'SYSTEM_ADMIN' }, { name: 'InvalidPerm' }]
          }
        ]
      };
      
      const result = rolesApi.toRoleDefinition(input);
      expect(result.id).toBe('1');
      expect(result.permissions).toContain(PermissionType.SYSTEM_ADMIN);
      expect(result.permissions.length).toBe(1); // InvalidPerm should be filtered
    });

    it('fromRoleDefinition groups permissions', () => {
      const role: any = {
        id: '1',
        name: 'Role',
        isResourceRole: true,
        permissions: [PermissionType.SYSTEM_ADMIN]
      };
      
      const allPermissions: any[] = [
        { id: 1, name: 'SYSTEM_ADMIN', category: 'Admin' },
        { id: 2, name: 'VIEW_PROJECT', category: 'General' },
        { id: 3, name: 'SYSTEM_ADMIN', category: null } // Uncategorized
      ];
      
      const result = rolesApi.fromRoleDefinition(role, allPermissions);
      expect(result.id).toBe('1');
      expect(result.permissions.length).toBe(3);
      
      const adminGroup = result.permissions.find(g => g.category === 'Admin');
      expect(adminGroup?.permissions.length).toBe(1);
      
      const uncategorizedGroup = result.permissions.find(g => g.category === 'Uncategorized');
      expect(uncategorizedGroup?.permissions.length).toBe(1);

      const generalGroup = result.permissions.find(g => g.category === 'General');
      expect(generalGroup?.permissions.length).toBe(0);
    });
  });
});

