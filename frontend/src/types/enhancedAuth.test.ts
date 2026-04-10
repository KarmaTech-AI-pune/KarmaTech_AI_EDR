/**
 * Unit Tests for Enhanced Auth Types
 * 
 * Tests type definitions, interfaces, and type safety for enhanced authentication types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import { 
  TenantUserRole,
  TenantStatus
} from './enhancedAuth';
import type { 
  EnhancedUserWithRole,
  TenantContext,
  SubscriptionPlan
} from './enhancedAuth';

describe('Enhanced Auth Types', () => {
  describe('EnhancedUserWithRole Interface', () => {
    it('should accept valid enhanced user object', () => {
      // Arrange
      const enhancedUser: EnhancedUserWithRole = {
        id: 'user-123',
        userName: 'johndoe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://example.com/avatar.jpg',
        roles: [],
        roleDetails: {
          id: 'role-1',
          name: 'Manager',
          permissions: []
        },
        standardRate: 75.50,
        isConsultant: false,
        createdAt: '2024-01-15T10:30:00Z'
      };

      // Assert
      expect(enhancedUser.id).toBe('user-123');
      expect(enhancedUser.standardRate).toBe(75.50);
      expect(enhancedUser.isConsultant).toBe(false);
      expect(enhancedUser.createdAt).toBe('2024-01-15T10:30:00Z');
    });

    it('should handle optional enhanced properties', () => {
      // Arrange
      const userWithEnhancements: EnhancedUserWithRole = {
        id: 'user-456',
        userName: 'superadmin',
        name: 'Super Admin',
        email: 'admin@example.com',
        roles: [],
        roleDetails: { id: 'role-1', name: 'Admin', permissions: [] },
        standardRate: 100.00,
        isConsultant: true,
        createdAt: '2024-01-01T00:00:00Z',
        isSuperAdmin: true,
        userType: 'SuperAdmin',
        tenantRole: 'Owner',
        tenantContext: 'global',
        tenantId: 1
      };

      // Assert
      expect(userWithEnhancements.isSuperAdmin).toBe(true);
      expect(userWithEnhancements.userType).toBe('SuperAdmin');
      expect(userWithEnhancements.tenantRole).toBe('Owner');
      expect(userWithEnhancements.tenantContext).toBe('global');
      expect(userWithEnhancements.tenantId).toBe(1);
    });

    it('should handle consultant vs employee rates', () => {
      // Arrange
      const consultant: EnhancedUserWithRole = {
        id: 'consultant-1',
        userName: 'consultant',
        name: 'Consultant User',
        email: 'consultant@example.com',
        roles: [],
        roleDetails: { id: 'role-1', name: 'Consultant', permissions: [] },
        standardRate: 150.00,
        isConsultant: true,
        createdAt: '2024-01-01T00:00:00Z'
      };

      const employee: EnhancedUserWithRole = {
        id: 'employee-1',
        userName: 'employee',
        name: 'Employee User',
        email: 'employee@example.com',
        roles: [],
        roleDetails: { id: 'role-2', name: 'Employee', permissions: [] },
        standardRate: 75.00,
        isConsultant: false,
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Assert
      expect(consultant.isConsultant).toBe(true);
      expect(consultant.standardRate).toBeGreaterThan(employee.standardRate);
      expect(employee.isConsultant).toBe(false);
    });
  });

  describe('TenantUserRole Enum', () => {
    it('should have correct enum values', () => {
      // Assert
      expect(TenantUserRole.Owner).toBe(0);
      expect(TenantUserRole.Admin).toBe(1);
      expect(TenantUserRole.Manager).toBe(2);
      expect(TenantUserRole.User).toBe(3);
    });

    it('should support enum operations', () => {
      // Arrange
      const roles = [TenantUserRole.Owner, TenantUserRole.Admin, TenantUserRole.Manager, TenantUserRole.User];

      // Act
      const roleNames = roles.map(role => TenantUserRole[role]);
      const hasOwner = roles.includes(TenantUserRole.Owner);

      // Assert
      expect(roleNames).toEqual(['Owner', 'Admin', 'Manager', 'User']);
      expect(hasOwner).toBe(true);
    });
  });

  describe('TenantStatus Enum', () => {
    it('should have correct enum values', () => {
      // Assert
      expect(TenantStatus.Active).toBe(0);
      expect(TenantStatus.Suspended).toBe(1);
      expect(TenantStatus.Cancelled).toBe(2);
      expect(TenantStatus.Trial).toBe(3);
      expect(TenantStatus.Expired).toBe(4);
    });

    it('should support status filtering', () => {
      // Arrange
      const activeStatuses = [TenantStatus.Active, TenantStatus.Trial];
      const inactiveStatuses = [TenantStatus.Suspended, TenantStatus.Cancelled, TenantStatus.Expired];

      // Act
      const isActive = (status: TenantStatus) => activeStatuses.includes(status);
      const isInactive = (status: TenantStatus) => inactiveStatuses.includes(status);

      // Assert
      expect(isActive(TenantStatus.Active)).toBe(true);
      expect(isActive(TenantStatus.Trial)).toBe(true);
      expect(isInactive(TenantStatus.Suspended)).toBe(true);
      expect(isInactive(TenantStatus.Active)).toBe(false);
    });
  });

  describe('TenantContext Interface', () => {
    it('should accept valid tenant context', () => {
      // Arrange
      const tenantContext: TenantContext = {
        tenantId: 123,
        tenantName: 'Acme Corp',
        tenantDomain: 'acme.example.com',
        tenantRole: 'Admin',
        isActive: true
      };

      // Assert
      expect(tenantContext.tenantId).toBe(123);
      expect(tenantContext.tenantName).toBe('Acme Corp');
      expect(tenantContext.tenantDomain).toBe('acme.example.com');
      expect(tenantContext.tenantRole).toBe('Admin');
      expect(tenantContext.isActive).toBe(true);
    });
  });

  describe('SubscriptionPlan Interface', () => {
    it('should accept valid subscription plan', () => {
      // Arrange
      const plan: SubscriptionPlan = {
        id: 1,
        name: 'Professional',
        description: 'Professional plan with advanced features',
        price: 99.99,
        billingCycle: 30,
        maxUsers: 50,
        maxProjects: 100,
        features: ['Advanced Analytics', 'Priority Support', 'Custom Integrations']
      };

      // Assert
      expect(plan.id).toBe(1);
      expect(plan.name).toBe('Professional');
      expect(plan.price).toBe(99.99);
      expect(plan.features).toHaveLength(3);
      expect(plan.features).toContain('Advanced Analytics');
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize enhanced user correctly', () => {
      // Arrange
      const user: EnhancedUserWithRole = {
        id: 'serialize-test',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        roles: [],
        roleDetails: { id: 'role-1', name: 'Test', permissions: [] },
        standardRate: 80.00,
        isConsultant: false,
        createdAt: '2024-01-01T00:00:00Z'
      };

      // Act
      const serialized = JSON.stringify(user);
      const deserialized: EnhancedUserWithRole = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(user);
      expect(typeof deserialized.standardRate).toBe('number');
      expect(typeof deserialized.isConsultant).toBe('boolean');
    });
  });
});