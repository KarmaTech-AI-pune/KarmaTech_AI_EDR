/**
 * Unit Tests for Permission Type Model
 * 
 * Tests enum values, type safety, and permission categorization.
 * Ensures proper TypeScript compilation and enum constraints.
 */

import { describe, it, expect } from 'vitest';
import { PermissionType } from './permissionTypeModel';

describe('PermissionType Model', () => {
  describe('Project Permissions', () => {
    it('should have correct project permission values', () => {
      // Assert
      expect(PermissionType.VIEW_PROJECT).toBe('VIEW_PROJECT');
      expect(PermissionType.CREATE_PROJECT).toBe('CREATE_PROJECT');
      expect(PermissionType.EDIT_PROJECT).toBe('EDIT_PROJECT');
      expect(PermissionType.DELETE_PROJECT).toBe('DELETE_PROJECT');
      expect(PermissionType.REVIEW_PROJECT).toBe('REVIEW_PROJECT');
      expect(PermissionType.APPROVE_PROJECT).toBe('APPROVE_PROJECT');
      expect(PermissionType.SUBMIT_PROJECT_FOR_REVIEW).toBe('SUBMIT_PROJECT_FOR_REVIEW');
      expect(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL).toBe('SUBMIT_PROJECT_FOR_APPROVAL');
    });

    it('should support project permission filtering', () => {
      // Arrange
      const projectPermissions = [
        PermissionType.VIEW_PROJECT,
        PermissionType.CREATE_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.DELETE_PROJECT,
        PermissionType.REVIEW_PROJECT,
        PermissionType.APPROVE_PROJECT,
        PermissionType.SUBMIT_PROJECT_FOR_REVIEW,
        PermissionType.SUBMIT_PROJECT_FOR_APPROVAL
      ];

      // Act
      const isProjectPermission = (permission: PermissionType) => 
        permission.includes('PROJECT');

      const filteredPermissions = projectPermissions.filter(isProjectPermission);

      // Assert
      expect(filteredPermissions).toHaveLength(8);
      filteredPermissions.forEach(permission => {
        expect(permission).toContain('PROJECT');
      });
    });
  });

  describe('Business Development Permissions', () => {
    it('should have correct business development permission values', () => {
      // Assert
      expect(PermissionType.VIEW_BUSINESS_DEVELOPMENT).toBe('VIEW_BUSINESS_DEVELOPMENT');
      expect(PermissionType.CREATE_BUSINESS_DEVELOPMENT).toBe('CREATE_BUSINESS_DEVELOPMENT');
      expect(PermissionType.EDIT_BUSINESS_DEVELOPMENT).toBe('EDIT_BUSINESS_DEVELOPMENT');
      expect(PermissionType.DELETE_BUSINESS_DEVELOPMENT).toBe('DELETE_BUSINESS_DEVELOPMENT');
      expect(PermissionType.REVIEW_BUSINESS_DEVELOPMENT).toBe('REVIEW_BUSINESS_DEVELOPMENT');
      expect(PermissionType.APPROVE_BUSINESS_DEVELOPMENT).toBe('APPROVE_BUSINESS_DEVELOPMENT');
      expect(PermissionType.SUBMIT_FOR_APPROVAL).toBe('SUBMIT_FOR_APPROVAL');
    });

    it('should support business development permission filtering', () => {
      // Arrange
      const businessPermissions = [
        PermissionType.VIEW_BUSINESS_DEVELOPMENT,
        PermissionType.CREATE_BUSINESS_DEVELOPMENT,
        PermissionType.EDIT_BUSINESS_DEVELOPMENT,
        PermissionType.DELETE_BUSINESS_DEVELOPMENT,
        PermissionType.REVIEW_BUSINESS_DEVELOPMENT,
        PermissionType.APPROVE_BUSINESS_DEVELOPMENT
      ];

      // Act
      const isBusinessPermission = (permission: PermissionType) => 
        permission.includes('BUSINESS_DEVELOPMENT');

      const filteredPermissions = businessPermissions.filter(isBusinessPermission);

      // Assert
      expect(filteredPermissions).toHaveLength(6);
      filteredPermissions.forEach(permission => {
        expect(permission).toContain('BUSINESS_DEVELOPMENT');
      });
    });
  });

  describe('System Permissions', () => {
    it('should have correct system permission values', () => {
      // Assert
      expect(PermissionType.SYSTEM_ADMIN).toBe('SYSTEM_ADMIN');
      expect(PermissionType.TENANT_ADMIN).toBe('Tenant_ADMIN');
    });

    it('should support admin permission identification', () => {
      // Arrange
      const adminPermissions = [
        PermissionType.SYSTEM_ADMIN,
        PermissionType.TENANT_ADMIN
      ];

      // Act
      const isAdminPermission = (permission: PermissionType) => 
        permission.includes('ADMIN');

      const filteredPermissions = adminPermissions.filter(isAdminPermission);

      // Assert
      expect(filteredPermissions).toHaveLength(2);
      expect(filteredPermissions).toContain(PermissionType.SYSTEM_ADMIN);
      expect(filteredPermissions).toContain(PermissionType.TENANT_ADMIN);
    });
  });

  describe('Permission Operations', () => {
    it('should support permission comparison', () => {
      // Arrange
      const permission1 = PermissionType.VIEW_PROJECT;
      const permission2 = PermissionType.VIEW_PROJECT;
      const permission3 = PermissionType.CREATE_PROJECT;

      // Assert
      expect(permission1).toBe(permission2);
      expect(permission1).not.toBe(permission3);
    });

    it('should support permission arrays', () => {
      // Arrange
      const userPermissions: PermissionType[] = [
        PermissionType.VIEW_PROJECT,
        PermissionType.CREATE_PROJECT,
        PermissionType.VIEW_BUSINESS_DEVELOPMENT
      ];

      // Act
      const hasViewProject = userPermissions.includes(PermissionType.VIEW_PROJECT);
      const hasDeleteProject = userPermissions.includes(PermissionType.DELETE_PROJECT);

      // Assert
      expect(hasViewProject).toBe(true);
      expect(hasDeleteProject).toBe(false);
      expect(userPermissions).toHaveLength(3);
    });

    it('should support permission level checking', () => {
      // Arrange
      const readPermissions = [
        PermissionType.VIEW_PROJECT,
        PermissionType.VIEW_BUSINESS_DEVELOPMENT
      ];

      const writePermissions = [
        PermissionType.CREATE_PROJECT,
        PermissionType.EDIT_PROJECT,
        PermissionType.DELETE_PROJECT,
        PermissionType.CREATE_BUSINESS_DEVELOPMENT,
        PermissionType.EDIT_BUSINESS_DEVELOPMENT,
        PermissionType.DELETE_BUSINESS_DEVELOPMENT
      ];

      // Act
      const isReadPermission = (permission: PermissionType) => 
        readPermissions.includes(permission);

      const isWritePermission = (permission: PermissionType) => 
        writePermissions.includes(permission);

      // Assert
      expect(isReadPermission(PermissionType.VIEW_PROJECT)).toBe(true);
      expect(isWritePermission(PermissionType.CREATE_PROJECT)).toBe(true);
      expect(isReadPermission(PermissionType.CREATE_PROJECT)).toBe(false);
      expect(isWritePermission(PermissionType.VIEW_PROJECT)).toBe(false);
    });
  });

  describe('Enum Completeness', () => {
    it('should have all expected permission types', () => {
      // Arrange
      const allPermissions = Object.values(PermissionType);

      // Assert
      expect(allPermissions).toHaveLength(17); // Total count of permissions
      
      // Project permissions (8)
      expect(allPermissions).toContain(PermissionType.VIEW_PROJECT);
      expect(allPermissions).toContain(PermissionType.CREATE_PROJECT);
      expect(allPermissions).toContain(PermissionType.EDIT_PROJECT);
      expect(allPermissions).toContain(PermissionType.DELETE_PROJECT);
      expect(allPermissions).toContain(PermissionType.REVIEW_PROJECT);
      expect(allPermissions).toContain(PermissionType.APPROVE_PROJECT);
      expect(allPermissions).toContain(PermissionType.SUBMIT_PROJECT_FOR_REVIEW);
      expect(allPermissions).toContain(PermissionType.SUBMIT_PROJECT_FOR_APPROVAL);
      
      // Business Development permissions (7)
      expect(allPermissions).toContain(PermissionType.VIEW_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.CREATE_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.EDIT_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.DELETE_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.REVIEW_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.APPROVE_BUSINESS_DEVELOPMENT);
      expect(allPermissions).toContain(PermissionType.SUBMIT_FOR_APPROVAL);
      
      // System permissions (2)
      expect(allPermissions).toContain(PermissionType.SYSTEM_ADMIN);
      expect(allPermissions).toContain(PermissionType.TENANT_ADMIN);
    });

    it('should have unique permission values', () => {
      // Arrange
      const allPermissions = Object.values(PermissionType);
      const uniquePermissions = [...new Set(allPermissions)];

      // Assert
      expect(uniquePermissions).toHaveLength(allPermissions.length);
    });
  });
});