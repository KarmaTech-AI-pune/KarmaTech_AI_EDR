import { describe, it, expect } from 'vitest';
import { User, AuthUser } from './userModel';
import { Role } from './roleModel';

describe('User Model', () => {
  describe('User Type Definition', () => {
    it('should have required properties', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.id).toBe('1');
      expect(user.userName).toBe('testuser');
      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
    });

    it('should have optional avatar property', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar: 'https://example.com/avatar.jpg',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.avatar).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('AuthUser Type Definition', () => {
    it('should extend User with authentication properties', () => {
      const authUser: AuthUser = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(authUser.userName).toBe('testuser');
      expect(authUser.password).toBe('hashedPassword123');
    });

    it('should have roles array', () => {
      const role: Role = {
        id: '1',
        name: 'Admin',
        description: 'Administrator role'
      };

      const authUser: AuthUser = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword123',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: [role]
      };

      expect(authUser.roles.length).toBe(1);
      expect(authUser.roles[0].name).toBe('Admin');
    });
  });

  describe('User Properties', () => {
    it('should handle consultant flag', () => {
      const consultant: User = {
        id: '1',
        userName: 'consultant1',
        name: 'Consultant User',
        email: 'consultant@example.com',
        standardRate: 150,
        isConsultant: true,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(consultant.isConsultant).toBe(true);
      expect(consultant.standardRate).toBe(150);
    });

    it('should handle employee flag', () => {
      const employee: User = {
        id: '2',
        userName: 'employee1',
        name: 'Employee User',
        email: 'employee@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(employee.isConsultant).toBe(false);
      expect(employee.standardRate).toBe(100);
    });
  });

  describe('Email Validation', () => {
    it('should store valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com'
      ];

      validEmails.forEach(email => {
        const user: User = {
          id: '1',
          userName: 'testuser',
          name: 'Test User',
          email: email,
          standardRate: 100,
          isConsultant: false,
          createdAt: '2024-01-01',
          roles: []
        };

        expect(user.email).toBe(email);
      });
    });
  });

  describe('Roles Management', () => {
    it('should support multiple roles', () => {
      const roles: Role[] = [
        { id: '1', name: 'Admin', description: 'Administrator' },
        { id: '2', name: 'Manager', description: 'Manager' },
        { id: '3', name: 'User', description: 'Regular User' }
      ];

      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: roles
      };

      expect(user.roles.length).toBe(3);
      expect(user.roles[0].name).toBe('Admin');
    });

    it('should handle empty roles array', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.roles.length).toBe(0);
    });
  });

  describe('Standard Rate', () => {
    it('should handle different rate values', () => {
      const rates = [50, 100, 150, 200, 500];

      rates.forEach(rate => {
        const user: User = {
          id: '1',
          userName: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          standardRate: rate,
          isConsultant: false,
          createdAt: '2024-01-01',
          roles: []
        };

        expect(user.standardRate).toBe(rate);
      });
    });

    it('should handle zero rate', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 0,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.standardRate).toBe(0);
    });

    it('should handle decimal rates', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 99.99,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.standardRate).toBe(99.99);
    });
  });

  describe('Timestamps', () => {
    it('should track creation date', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01T10:00:00Z',
        roles: []
      };

      expect(user.createdAt).toBe('2024-01-01T10:00:00Z');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', () => {
      const user: User = {
        id: '1',
        userName: 'test_user-123',
        name: "O'Brien-Smith",
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.name).toContain("'");
      expect(user.userName).toContain('_');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(255);
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: longName,
        email: 'test@example.com',
        standardRate: 100,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.name.length).toBe(255);
    });

    it('should handle very large rate values', () => {
      const user: User = {
        id: '1',
        userName: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        standardRate: 999999.99,
        isConsultant: false,
        createdAt: '2024-01-01',
        roles: []
      };

      expect(user.standardRate).toBe(999999.99);
    });
  });
});
