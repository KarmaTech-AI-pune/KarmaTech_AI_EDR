/**
 * Unit Tests for Auth Types
 * 
 * Tests type definitions, interfaces, and type safety for authentication-related types.
 * Ensures proper TypeScript compilation and type constraints.
 */

import { describe, it, expect } from 'vitest';
import type { 
  Credentials,
  Role,
  UserRole,
  User,
  UserWithRole,
  projectManagementAppContextType,
  LoginResponse,
  ApiError
} from './auth';
import { mapStringToPermissionType } from './auth';
import { PermissionType } from '../models/permissionTypeModel';

describe('Auth Types', () => {
  describe('Credentials Interface', () => {
    it('should accept valid credentials object', () => {
      // Arrange
      const credentials: Credentials = {
        email: 'test@example.com',
        password: 'securePassword123'
      };

      // Assert
      expect(credentials.email).toBe('test@example.com');
      expect(credentials.password).toBe('securePassword123');
    });

    it('should enforce required properties', () => {
      // Arrange
      const credentials: Credentials = {
        email: 'user@domain.com',
        password: 'myPassword'
      };

      // Assert
      expect(credentials).toHaveProperty('email');
      expect(credentials).toHaveProperty('password');
      expect(typeof credentials.email).toBe('string');
      expect(typeof credentials.password).toBe('string');
    });

    it('should handle empty credentials', () => {
      // Arrange
      const emptyCredentials: Credentials = {
        email: '',
        password: ''
      };

      // Assert
      expect(emptyCredentials.email).toBe('');
      expect(emptyCredentials.password).toBe('');
    });

    it('should handle special characters in email and password', () => {
      // Arrange
      const specialCredentials: Credentials = {
        email: 'user+test@sub-domain.co.uk',
        password: 'P@ssw0rd!#$%'
      };

      // Assert
      expect(specialCredentials.email).toContain('+');
      expect(specialCredentials.email).toContain('-');
      expect(specialCredentials.password).toContain('@');
      expect(specialCredentials.password).toContain('#');
    });
  });

  describe('Role Interface', () => {
    it('should accept valid role object', () => {
      // Arrange
      const role: Role = {
        id: 'role-123',
        name: 'Administrator',
        permissions: [PermissionType.CREATE_PROJECT, PermissionType.EDIT_PROJECT]
      };

      // Assert
      expect(role.id).toBe('role-123');
      expect(role.name).toBe('Administrator');
      expect(role.permissions).toHaveLength(2);
      expect(role.permissions).toContain(PermissionType.CREATE_PROJECT);
    });

    it('should handle empty permissions array', () => {
      // Arrange
      const roleWithoutPermissions: Role = {
        id: 'guest-role',
        name: 'Guest',
        permissions: []
      };

      // Assert
      expect(roleWithoutPermissions.permissions).toHaveLength(0);
      expect(Array.isArray(roleWithoutPermissions.permissions)).toBe(true);
    });

    it('should handle multiple permissions', () => {
      // Arrange
      const adminRole: Role = {
        id: 'admin',
        name: 'Super Admin',
        permissions: [
          PermissionType.CREATE_PROJECT,
          PermissionType.EDIT_PROJECT,
          PermissionType.DELETE_PROJECT,
          PermissionType.VIEW_PROJECT
        ]
      };

      // Assert
      expect(adminRole.permissions).toHaveLength(4);
      adminRole.permissions.forEach(permission => {
        expect(Object.values(PermissionType)).toContain(permission);
      });
    });

    it('should enforce string types for id and name', () => {
      // Arrange
      const role: Role = {
        id: '12345',
        name: 'Numeric ID Role',
        permissions: []
      };

      // Assert
      expect(typeof role.id).toBe('string');
      expect(typeof role.name).toBe('string');
    });
  });

  describe('UserRole Interface', () => {
    it('should accept valid user role object', () => {
      // Arrange
      const userRole: UserRole = {
        name: 'Project Manager'
      };

      // Assert
      expect(userRole.name).toBe('Project Manager');
      expect(typeof userRole.name).toBe('string');
    });

    it('should handle empty role name', () => {
      // Arrange
      const emptyUserRole: UserRole = {
        name: ''
      };

      // Assert
      expect(emptyUserRole.name).toBe('');
    });

    it('should handle special characters in role name', () => {
      // Arrange
      const specialRole: UserRole = {
        name: 'Senior PM & Team Lead'
      };

      // Assert
      expect(specialRole.name).toContain('&');
      expect(specialRole.name).toContain(' ');
    });
  });

  describe('User Interface', () => {
    it('should accept valid user object', () => {
      // Arrange
      const user: User = {
        id: 'user-123',
        userName: 'johndoe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://example.com/avatar.jpg',
        roles: [
          {
            id: 'role-1',
            name: 'Manager',
            permissions: [PermissionType.VIEW_PROJECT]
          }
        ]
      };

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.userName).toBe('johndoe');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.avatar).toBe('https://example.com/avatar.jpg');
      expect(user.roles).toHaveLength(1);
    });

    it('should handle optional avatar property', () => {
      // Arrange
      const userWithoutAvatar: User = {
        id: 'user-456',
        userName: 'janedoe',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        roles: []
      };

      // Assert
      expect(userWithoutAvatar.avatar).toBeUndefined();
      expect(userWithoutAvatar).not.toHaveProperty('avatar');
    });

    it('should handle multiple roles', () => {
      // Arrange
      const multiRoleUser: User = {
        id: 'user-789',
        userName: 'adminuser',
        name: 'Admin User',
        email: 'admin@example.com',
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            permissions: [PermissionType.CREATE_PROJECT]
          },
          {
            id: 'role-2',
            name: 'Manager',
            permissions: [PermissionType.EDIT_PROJECT]
          }
        ]
      };

      // Assert
      expect(multiRoleUser.roles).toHaveLength(2);
      expect(multiRoleUser.roles[0].name).toBe('Admin');
      expect(multiRoleUser.roles[1].name).toBe('Manager');
    });

    it('should handle empty roles array', () => {
      // Arrange
      const userWithoutRoles: User = {
        id: 'user-000',
        userName: 'guestuser',
        name: 'Guest User',
        email: 'guest@example.com',
        roles: []
      };

      // Assert
      expect(userWithoutRoles.roles).toHaveLength(0);
      expect(Array.isArray(userWithoutRoles.roles)).toBe(true);
    });
  });

  describe('UserWithRole Interface', () => {
    it('should extend User interface with roleDetails', () => {
      // Arrange
      const userWithRole: UserWithRole = {
        id: 'user-123',
        userName: 'johndoe',
        name: 'John Doe',
        email: 'john.doe@example.com',
        roles: [],
        roleDetails: {
          id: 'role-detail-1',
          name: 'Project Manager',
          permissions: [PermissionType.CREATE_PROJECT, PermissionType.EDIT_PROJECT]
        }
      };

      // Assert
      expect(userWithRole).toHaveProperty('roleDetails');
      expect(userWithRole.roleDetails.id).toBe('role-detail-1');
      expect(userWithRole.roleDetails.name).toBe('Project Manager');
      expect(userWithRole.roleDetails.permissions).toHaveLength(2);
    });

    it('should be compatible with User interface', () => {
      // Arrange
      const baseUser: User = {
        id: 'user-456',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        roles: []
      };

      const userWithRole: UserWithRole = {
        ...baseUser,
        roleDetails: {
          id: 'role-1',
          name: 'Tester',
          permissions: []
        }
      };

      // Assert
      expect(userWithRole.id).toBe(baseUser.id);
      expect(userWithRole.userName).toBe(baseUser.userName);
      expect(userWithRole.name).toBe(baseUser.name);
      expect(userWithRole.email).toBe(baseUser.email);
    });
  });

  describe('LoginResponse Interface', () => {
    it('should accept successful login response', () => {
      // Arrange
      const successResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'jwt-token-123',
        user: {
          id: 'user-1',
          userName: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          roles: [],
          roleDetails: {
            id: 'role-1',
            name: 'User',
            permissions: []
          }
        }
      };

      // Assert
      expect(successResponse.success).toBe(true);
      expect(successResponse.message).toBe('Login successful');
      expect(successResponse.token).toBe('jwt-token-123');
      expect(successResponse.user).toBeDefined();
    });

    it('should accept failed login response', () => {
      // Arrange
      const failureResponse: LoginResponse = {
        success: false,
        message: 'Invalid credentials'
      };

      // Assert
      expect(failureResponse.success).toBe(false);
      expect(failureResponse.message).toBe('Invalid credentials');
      expect(failureResponse.token).toBeUndefined();
      expect(failureResponse.user).toBeUndefined();
    });

    it('should handle optional properties correctly', () => {
      // Arrange
      const minimalResponse: LoginResponse = {
        success: false,
        message: 'Authentication failed'
      };

      // Assert
      expect(minimalResponse).toHaveProperty('success');
      expect(minimalResponse).toHaveProperty('message');
      expect(minimalResponse).not.toHaveProperty('token');
      expect(minimalResponse).not.toHaveProperty('user');
    });
  });

  describe('ApiError Interface', () => {
    it('should accept valid API error object', () => {
      // Arrange
      const apiError: ApiError = {
        message: 'Internal server error',
        statusCode: 500
      };

      // Assert
      expect(apiError.message).toBe('Internal server error');
      expect(apiError.statusCode).toBe(500);
    });

    it('should handle optional statusCode', () => {
      // Arrange
      const errorWithoutCode: ApiError = {
        message: 'Something went wrong'
      };

      // Assert
      expect(errorWithoutCode.message).toBe('Something went wrong');
      expect(errorWithoutCode.statusCode).toBeUndefined();
    });

    it('should handle different HTTP status codes', () => {
      // Arrange
      const errors: ApiError[] = [
        { message: 'Bad Request', statusCode: 400 },
        { message: 'Unauthorized', statusCode: 401 },
        { message: 'Forbidden', statusCode: 403 },
        { message: 'Not Found', statusCode: 404 }
      ];

      // Assert
      errors.forEach(error => {
        expect(typeof error.message).toBe('string');
        expect(typeof error.statusCode).toBe('number');
        expect(error.statusCode).toBeGreaterThan(0);
      });
    });
  });

  describe('projectManagementAppContextType', () => {
    it('should define complete context type structure', () => {
      // Arrange - Create a mock context object
      const mockContext: projectManagementAppContextType = {
        screenState: 'dashboard',
        setScreenState: () => {},
        isAuthenticated: true,
        setIsAuthenticated: () => {},
        user: null,
        setUser: () => {},
        handleLogout: () => {},
        currentUser: null,
        setCurrentUser: () => {},
        canEditOpportunity: false,
        setCanEditOpportunity: () => {},
        canDeleteOpportunity: false,
        setCanDeleteOpportunity: () => {},
        canSubmitForReview: false,
        setCanSubmitForReview: () => {},
        canReviewBD: false,
        setCanReviewBD: () => {},
        canApproveBD: false,
        setCanApproveBD: () => {},
        canSubmitForApproval: false,
        setCanSubmitForApproval: () => {},
        selectedProject: null,
        setSelectedProject: () => {},
        currentGoNoGoDecision: null,
        setCurrentGoNoGoDecision: () => {}
      };

      // Assert
      expect(mockContext).toHaveProperty('screenState');
      expect(mockContext).toHaveProperty('isAuthenticated');
      expect(mockContext).toHaveProperty('user');
      expect(mockContext).toHaveProperty('currentUser');
      expect(mockContext).toHaveProperty('selectedProject');
      expect(mockContext).toHaveProperty('currentGoNoGoDecision');
    });

    it('should handle boolean permission flags', () => {
      // Arrange
      const contextWithPermissions: Partial<projectManagementAppContextType> = {
        canEditOpportunity: true,
        canDeleteOpportunity: false,
        canSubmitForReview: true,
        canReviewBD: false,
        canApproveBD: true,
        canSubmitForApproval: false
      };

      // Assert
      expect(typeof contextWithPermissions.canEditOpportunity).toBe('boolean');
      expect(typeof contextWithPermissions.canDeleteOpportunity).toBe('boolean');
      expect(typeof contextWithPermissions.canSubmitForReview).toBe('boolean');
      expect(typeof contextWithPermissions.canReviewBD).toBe('boolean');
      expect(typeof contextWithPermissions.canApproveBD).toBe('boolean');
      expect(typeof contextWithPermissions.canSubmitForApproval).toBe('boolean');
    });
  });

  describe('mapStringToPermissionType Helper Function', () => {
    it('should map valid permission string to PermissionType', () => {
      // Arrange
      const permissionString = PermissionType.CREATE_PROJECT;

      // Act
      const result = mapStringToPermissionType(permissionString);

      // Assert
      expect(result).toBe(PermissionType.CREATE_PROJECT);
    });

    it('should return null for invalid permission string', () => {
      // Arrange
      const invalidPermission = 'InvalidPermission';

      // Act
      const result = mapStringToPermissionType(invalidPermission);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle empty string', () => {
      // Arrange
      const emptyString = '';

      // Act
      const result = mapStringToPermissionType(emptyString);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle case sensitivity', () => {
      // Arrange
      const lowerCasePermission = PermissionType.CREATE_PROJECT.toLowerCase();

      // Act
      const result = mapStringToPermissionType(lowerCasePermission);

      // Assert
      expect(result).toBeNull(); // Should be case sensitive
    });

    it('should map all valid PermissionType values', () => {
      // Arrange
      const allPermissions = Object.values(PermissionType);

      // Act & Assert
      allPermissions.forEach(permission => {
        const result = mapStringToPermissionType(permission);
        expect(result).toBe(permission);
      });
    });
  });

  describe('Type Relationships and Compatibility', () => {
    it('should demonstrate proper inheritance hierarchy', () => {
      // Arrange
      const baseUser: User = {
        id: 'user-1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        roles: []
      };

      // Act - Extend to UserWithRole
      const userWithRole: UserWithRole = {
        ...baseUser,
        roleDetails: {
          id: 'role-1',
          name: 'Test Role',
          permissions: []
        }
      };

      // Assert
      expect(userWithRole.id).toBe(baseUser.id);
      expect(userWithRole.userName).toBe(baseUser.userName);
      expect(userWithRole).toHaveProperty('roleDetails');
    });

    it('should support array operations with users', () => {
      // Arrange
      const users: User[] = [
        {
          id: 'user-1',
          userName: 'user1',
          name: 'User One',
          email: 'user1@example.com',
          roles: []
        },
        {
          id: 'user-2',
          userName: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          roles: []
        }
      ];

      // Act
      const userNames = users.map(user => user.name);
      const userEmails = users.filter(user => user.email.includes('example.com'));

      // Assert
      expect(userNames).toEqual(['User One', 'User Two']);
      expect(userEmails).toHaveLength(2);
    });

    it('should handle nested role permissions correctly', () => {
      // Arrange
      const userWithComplexRoles: User = {
        id: 'complex-user',
        userName: 'complexuser',
        name: 'Complex User',
        email: 'complex@example.com',
        roles: [
          {
            id: 'role-1',
            name: 'Admin',
            permissions: [
              PermissionType.CREATE_PROJECT,
              PermissionType.EDIT_PROJECT,
              PermissionType.DELETE_PROJECT
            ]
          },
          {
            id: 'role-2',
            name: 'Viewer',
            permissions: [PermissionType.VIEW_PROJECT]
          }
        ]
      };

      // Act
      const allPermissions = userWithComplexRoles.roles.flatMap(role => role.permissions);
      const uniquePermissions = [...new Set(allPermissions)];

      // Assert
      expect(allPermissions).toHaveLength(4);
      expect(uniquePermissions).toHaveLength(4); // All permissions are unique
    });
  });

  describe('JSON Serialization Compatibility', () => {
    it('should serialize and deserialize User correctly', () => {
      // Arrange
      const originalUser: User = {
        id: 'serialize-test',
        userName: 'serializeuser',
        name: 'Serialize User',
        email: 'serialize@example.com',
        avatar: 'https://example.com/avatar.jpg',
        roles: [
          {
            id: 'role-1',
            name: 'Test Role',
            permissions: [PermissionType.VIEW_PROJECT]
          }
        ]
      };

      // Act
      const serialized = JSON.stringify(originalUser);
      const deserialized: User = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(originalUser);
      expect(deserialized.roles[0].permissions[0]).toBe(PermissionType.VIEW_PROJECT);
    });

    it('should serialize LoginResponse correctly', () => {
      // Arrange
      const loginResponse: LoginResponse = {
        success: true,
        message: 'Login successful',
        token: 'jwt-token-123'
      };

      // Act
      const serialized = JSON.stringify(loginResponse);
      const deserialized: LoginResponse = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(loginResponse);
      expect(typeof deserialized.success).toBe('boolean');
      expect(typeof deserialized.message).toBe('string');
    });

    it('should handle undefined optional properties in serialization', () => {
      // Arrange
      const userWithoutOptionals: User = {
        id: 'minimal-user',
        userName: 'minimaluser',
        name: 'Minimal User',
        email: 'minimal@example.com',
        roles: []
      };

      // Act
      const serialized = JSON.stringify(userWithoutOptionals);
      const deserialized: User = JSON.parse(serialized);

      // Assert
      expect(deserialized).toEqual(userWithoutOptionals);
      expect(deserialized.avatar).toBeUndefined();
    });
  });
});