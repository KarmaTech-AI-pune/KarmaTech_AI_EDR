import { describe, it, expect } from 'vitest';
import { 
  Permission, 
  PermissionGroup, 
  RoleDefinition, 
  RoleWithPermissions,
  convertToGroupedPermissions,
  convertToSimplePermissions
} from './roleDefinitionModel';
import { PermissionType } from './permissionTypeModel';

describe('RoleDefinitionModel', () => {
  describe('Permission Interface', () => {
    it('should create a valid Permission object', () => {
      const permission: Permission = {
        id: 'perm-1',
        name: 'CREATE_PROJECT',
        description: 'Allows creating new projects',
        category: 'Project Management',
        roles: []
      };

      expect(permission.id).toBe('perm-1');
      expect(permission.name).toBe('CREATE_PROJECT');
      expect(permission.description).toBe('Allows creating new projects');
      expect(permission.category).toBe('Project Management');
      expect(permission.roles).toEqual([]);
    });

    it('should handle permission with null description', () => {
      const permission: Permission = {
        id: 'perm-2',
        name: 'VIEW_REPORTS',
        description: null,
        category: 'Reporting',
        roles: ['admin', 'manager']
      };

      expect(permission.description).toBeNull();
      expect(permission.roles).toEqual(['admin', 'manager']);
    });
  });

  describe('PermissionGroup Interface', () => {
    it('should create a valid PermissionGroup object', () => {
      const permissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'CREATE_PROJECT',
          description: 'Create projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-2',
          name: 'EDIT_PROJECT',
          description: 'Edit projects',
          category: 'Project Management',
          roles: []
        }
      ];

      const permissionGroup: PermissionGroup = {
        category: 'Project Management',
        permissions: permissions
      };

      expect(permissionGroup.category).toBe('Project Management');
      expect(permissionGroup.permissions).toHaveLength(2);
      expect(permissionGroup.permissions[0].name).toBe('CREATE_PROJECT');
      expect(permissionGroup.permissions[1].name).toBe('EDIT_PROJECT');
    });
  });

  describe('RoleDefinition Interface', () => {
    it('should create a valid RoleDefinition object', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-1',
        name: 'Project Manager',
        minRate: 75.50,
        isResourceRole: true,
        permissions: [PermissionType.CREATE_PROJECT, PermissionType.EDIT_PROJECT, PermissionType.VIEW_PROJECT]
      };

      expect(roleDefinition.id).toBe('role-1');
      expect(roleDefinition.name).toBe('Project Manager');
      expect(roleDefinition.minRate).toBe(75.50);
      expect(roleDefinition.isResourceRole).toBe(true);
      expect(roleDefinition.permissions).toHaveLength(3);
      expect(roleDefinition.permissions).toContain(PermissionType.CREATE_PROJECT);
      expect(roleDefinition.permissions).toContain(PermissionType.EDIT_PROJECT);
      expect(roleDefinition.permissions).toContain(PermissionType.VIEW_PROJECT);
    });

    it('should handle role with no permissions', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-2',
        name: 'Viewer',
        minRate: 25.00,
        isResourceRole: false,
        permissions: []
      };

      expect(roleDefinition.permissions).toEqual([]);
      expect(roleDefinition.isResourceRole).toBe(false);
      expect(roleDefinition.minRate).toBe(25.00);
    });

    it('should handle role with multiple permission types', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-3',
        name: 'Administrator',
        minRate: 100.00,
        isResourceRole: true,
        permissions: [
          PermissionType.CREATE_PROJECT,
          PermissionType.EDIT_PROJECT,
          PermissionType.DELETE_PROJECT,
          PermissionType.VIEW_PROJECT,
          PermissionType.SYSTEM_ADMIN,
          PermissionType.TENANT_ADMIN,
          PermissionType.APPROVE_PROJECT
        ]
      };

      expect(roleDefinition.permissions).toHaveLength(7);
      expect(roleDefinition.permissions).toContain(PermissionType.SYSTEM_ADMIN);
      expect(roleDefinition.permissions).toContain(PermissionType.TENANT_ADMIN);
    });
  });

  describe('RoleWithPermissions Interface', () => {
    it('should create a valid RoleWithPermissions object', () => {
      const permissionGroups: PermissionGroup[] = [
        {
          category: 'Project Management',
          permissions: [
            {
              id: 'perm-1',
              name: 'CREATE_PROJECT',
              description: 'Create projects',
              category: 'Project Management',
              roles: []
            }
          ]
        },
        {
          category: 'System Management',
          permissions: [
            {
              id: 'perm-2',
              name: 'SYSTEM_ADMIN',
              description: 'System administration',
              category: 'System Management',
              roles: []
            }
          ]
        }
      ];

      const roleWithPermissions: RoleWithPermissions = {
        id: 'role-4',
        name: 'Senior Manager',
        minRate: 125.75,
        isResourceRole: true,
        permissions: permissionGroups
      };

      expect(roleWithPermissions.id).toBe('role-4');
      expect(roleWithPermissions.name).toBe('Senior Manager');
      expect(roleWithPermissions.minRate).toBe(125.75);
      expect(roleWithPermissions.isResourceRole).toBe(true);
      expect(roleWithPermissions.permissions).toHaveLength(2);
      expect(roleWithPermissions.permissions[0].category).toBe('Project Management');
      expect(roleWithPermissions.permissions[1].category).toBe('System Management');
    });
  });

  describe('convertToGroupedPermissions Function', () => {
    it('should convert RoleDefinition to RoleWithPermissions', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-5',
        name: 'Test Role',
        minRate: 50.00,
        isResourceRole: false,
        permissions: [PermissionType.CREATE_PROJECT, PermissionType.SYSTEM_ADMIN]
      };

      const allPermissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'CREATE_PROJECT',
          description: 'Create projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-2',
          name: 'SYSTEM_ADMIN',
          description: 'System administration',
          category: 'System Management',
          roles: []
        },
        {
          id: 'perm-3',
          name: 'VIEW_PROJECT',
          description: 'View projects',
          category: 'Project Management',
          roles: []
        }
      ];

      const result = convertToGroupedPermissions(roleDefinition, allPermissions);

      expect(result.id).toBe('role-5');
      expect(result.name).toBe('Test Role');
      expect(result.minRate).toBe(50.00);
      expect(result.isResourceRole).toBe(false);
      expect(result.permissions).toHaveLength(2);
      
      const projectGroup = result.permissions.find(g => g.category === 'Project Management');
      const systemGroup = result.permissions.find(g => g.category === 'System Management');
      
      expect(projectGroup).toBeDefined();
      expect(systemGroup).toBeDefined();
      expect(projectGroup?.permissions).toHaveLength(1);
      expect(systemGroup?.permissions).toHaveLength(1);
      expect(projectGroup?.permissions[0].name).toBe('CREATE_PROJECT');
      expect(systemGroup?.permissions[0].name).toBe('SYSTEM_ADMIN');
    });

    it('should handle role with no matching permissions', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-6',
        name: 'Empty Role',
        minRate: 30.00,
        isResourceRole: false,
        permissions: [PermissionType.DELETE_PROJECT] // Not in allPermissions
      };

      const allPermissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'CREATE_PROJECT',
          description: 'Create projects',
          category: 'Project Management',
          roles: []
        }
      ];

      const result = convertToGroupedPermissions(roleDefinition, allPermissions);

      expect(result.permissions).toHaveLength(0);
    });

    it('should group multiple permissions by category', () => {
      const roleDefinition: RoleDefinition = {
        id: 'role-7',
        name: 'Multi Permission Role',
        minRate: 80.00,
        isResourceRole: true,
        permissions: [PermissionType.CREATE_PROJECT, PermissionType.EDIT_PROJECT, PermissionType.SYSTEM_ADMIN]
      };

      const allPermissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'CREATE_PROJECT',
          description: 'Create projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-2',
          name: 'EDIT_PROJECT',
          description: 'Edit projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-3',
          name: 'SYSTEM_ADMIN',
          description: 'System administration',
          category: 'System Management',
          roles: []
        }
      ];

      const result = convertToGroupedPermissions(roleDefinition, allPermissions);

      expect(result.permissions).toHaveLength(2);
      
      const projectGroup = result.permissions.find(g => g.category === 'Project Management');
      const systemGroup = result.permissions.find(g => g.category === 'System Management');
      
      expect(projectGroup?.permissions).toHaveLength(2);
      expect(systemGroup?.permissions).toHaveLength(1);
    });
  });

  describe('convertToSimplePermissions Function', () => {
    it('should convert RoleWithPermissions to RoleDefinition', () => {
      const roleWithPermissions: RoleWithPermissions = {
        id: 'role-8',
        name: 'Complex Role',
        minRate: 90.00,
        isResourceRole: true,
        permissions: [
          {
            category: 'Project Management',
            permissions: [
              {
                id: 'perm-1',
                name: 'CREATE_PROJECT',
                description: 'Create projects',
                category: 'Project Management',
                roles: []
              },
              {
                id: 'perm-2',
                name: 'EDIT_PROJECT',
                description: 'Edit projects',
                category: 'Project Management',
                roles: []
              }
            ]
          },
          {
            category: 'System Management',
            permissions: [
              {
                id: 'perm-3',
                name: 'SYSTEM_ADMIN',
                description: 'System administration',
                category: 'System Management',
                roles: []
              }
            ]
          }
        ]
      };

      const result = convertToSimplePermissions(roleWithPermissions);

      expect(result.id).toBe('role-8');
      expect(result.name).toBe('Complex Role');
      expect(result.minRate).toBe(90.00);
      expect(result.isResourceRole).toBe(true);
      expect(result.permissions).toHaveLength(3);
      expect(result.permissions).toContain('CREATE_PROJECT' as PermissionType);
      expect(result.permissions).toContain('EDIT_PROJECT' as PermissionType);
      expect(result.permissions).toContain('SYSTEM_ADMIN' as PermissionType);
    });

    it('should handle role with empty permission groups', () => {
      const roleWithPermissions: RoleWithPermissions = {
        id: 'role-9',
        name: 'Empty Groups Role',
        minRate: 40.00,
        isResourceRole: false,
        permissions: []
      };

      const result = convertToSimplePermissions(roleWithPermissions);

      expect(result.permissions).toEqual([]);
    });

    it('should flatten nested permission structure', () => {
      const roleWithPermissions: RoleWithPermissions = {
        id: 'role-10',
        name: 'Nested Role',
        minRate: 70.00,
        isResourceRole: true,
        permissions: [
          {
            category: 'Category A',
            permissions: [
              {
                id: 'perm-1',
                name: 'PERMISSION_A1',
                description: 'Permission A1',
                category: 'Category A',
                roles: []
              },
              {
                id: 'perm-2',
                name: 'PERMISSION_A2',
                description: 'Permission A2',
                category: 'Category A',
                roles: []
              }
            ]
          },
          {
            category: 'Category B',
            permissions: [
              {
                id: 'perm-3',
                name: 'PERMISSION_B1',
                description: 'Permission B1',
                category: 'Category B',
                roles: []
              }
            ]
          }
        ]
      };

      const result = convertToSimplePermissions(roleWithPermissions);

      expect(result.permissions).toHaveLength(3);
      expect(result.permissions).toContain('PERMISSION_A1' as PermissionType);
      expect(result.permissions).toContain('PERMISSION_A2' as PermissionType);
      expect(result.permissions).toContain('PERMISSION_B1' as PermissionType);
    });
  });

  describe('Conversion Round Trip', () => {
    it('should maintain data integrity through conversion round trip', () => {
      const originalRole: RoleDefinition = {
        id: 'role-roundtrip',
        name: 'Round Trip Role',
        minRate: 85.25,
        isResourceRole: true,
        permissions: [PermissionType.CREATE_PROJECT, PermissionType.EDIT_PROJECT, PermissionType.VIEW_PROJECT]
      };

      const allPermissions: Permission[] = [
        {
          id: 'perm-1',
          name: 'CREATE_PROJECT',
          description: 'Create projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-2',
          name: 'EDIT_PROJECT',
          description: 'Edit projects',
          category: 'Project Management',
          roles: []
        },
        {
          id: 'perm-3',
          name: 'VIEW_PROJECT',
          description: 'View projects',
          category: 'Project Management',
          roles: []
        }
      ];

      // Convert to grouped format
      const grouped = convertToGroupedPermissions(originalRole, allPermissions);
      
      // Convert back to simple format
      const backToSimple = convertToSimplePermissions(grouped);

      expect(backToSimple.id).toBe(originalRole.id);
      expect(backToSimple.name).toBe(originalRole.name);
      expect(backToSimple.minRate).toBe(originalRole.minRate);
      expect(backToSimple.isResourceRole).toBe(originalRole.isResourceRole);
      expect(backToSimple.permissions).toHaveLength(originalRole.permissions.length);
      
      // Check that all original permissions are preserved (order might differ)
      originalRole.permissions.forEach(permission => {
        expect(backToSimple.permissions).toContain(permission);
      });
    });
  });
});