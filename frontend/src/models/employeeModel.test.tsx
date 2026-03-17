import { describe, it, expect } from 'vitest';
import { Employee } from './employeeModel';

describe('Employee Model', () => {
  describe('Type Definition', () => {
    it('should have all required properties', () => {
      const employee: Employee = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role_id: 'role_123',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.id).toBe('1');
      expect(employee.name).toBe('John Doe');
      expect(employee.email).toBe('john.doe@example.com');
      expect(employee.role_id).toBe('role_123');
      expect(employee.standard_rate).toBe(100);
      expect(employee.is_consultant).toBe(false);
      expect(employee.is_active).toBe(true);
    });
  });

  describe('Employee Types', () => {
    it('should handle regular employees', () => {
      const employee: Employee = {
        id: '1',
        name: 'Regular Employee',
        email: 'employee@example.com',
        role_id: 'role_1',
        standard_rate: 80,
        is_consultant: false,
        is_active: true
      };

      expect(employee.is_consultant).toBe(false);
      expect(employee.standard_rate).toBe(80);
    });

    it('should handle consultants', () => {
      const consultant: Employee = {
        id: '2',
        name: 'Consultant',
        email: 'consultant@example.com',
        role_id: 'role_2',
        standard_rate: 150,
        is_consultant: true,
        is_active: true
      };

      expect(consultant.is_consultant).toBe(true);
      expect(consultant.standard_rate).toBe(150);
    });

    it('should handle inactive employees', () => {
      const inactiveEmployee: Employee = {
        id: '3',
        name: 'Inactive Employee',
        email: 'inactive@example.com',
        role_id: 'role_3',
        standard_rate: 90,
        is_consultant: false,
        is_active: false
      };

      expect(inactiveEmployee.is_active).toBe(false);
    });
  });

  describe('Standard Rate', () => {
    it('should handle different rate values', () => {
      const rates = [50, 75, 100, 125, 150, 200, 500];

      rates.forEach(rate => {
        const employee: Employee = {
          id: '1',
          name: 'Employee',
          email: 'employee@example.com',
          role_id: 'role_1',
          standard_rate: rate,
          is_consultant: false,
          is_active: true
        };

        expect(employee.standard_rate).toBe(rate);
      });
    });

    it('should handle zero rate', () => {
      const employee: Employee = {
        id: '1',
        name: 'Intern',
        email: 'intern@example.com',
        role_id: 'role_intern',
        standard_rate: 0,
        is_consultant: false,
        is_active: true
      };

      expect(employee.standard_rate).toBe(0);
    });

    it('should handle decimal rates', () => {
      const employee: Employee = {
        id: '1',
        name: 'Employee',
        email: 'employee@example.com',
        role_id: 'role_1',
        standard_rate: 99.99,
        is_consultant: false,
        is_active: true
      };

      expect(employee.standard_rate).toBe(99.99);
    });

    it('should handle very high rates', () => {
      const employee: Employee = {
        id: '1',
        name: 'Senior Consultant',
        email: 'senior@example.com',
        role_id: 'role_senior',
        standard_rate: 999.99,
        is_consultant: true,
        is_active: true
      };

      expect(employee.standard_rate).toBe(999.99);
    });
  });

  describe('Email Validation', () => {
    it('should store valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@example.com',
        'user123@example.org'
      ];

      validEmails.forEach(email => {
        const employee: Employee = {
          id: '1',
          name: 'Employee',
          email: email,
          role_id: 'role_1',
          standard_rate: 100,
          is_consultant: false,
          is_active: true
        };

        expect(employee.email).toBe(email);
        expect(employee.email).toContain('@');
      });
    });
  });

  describe('Role Assignment', () => {
    it('should handle different role IDs', () => {
      const roleIds = ['admin', 'manager', 'developer', 'designer', 'analyst'];

      roleIds.forEach(roleId => {
        const employee: Employee = {
          id: '1',
          name: 'Employee',
          email: 'employee@example.com',
          role_id: roleId,
          standard_rate: 100,
          is_consultant: false,
          is_active: true
        };

        expect(employee.role_id).toBe(roleId);
      });
    });

    it('should handle UUID role IDs', () => {
      const employee: Employee = {
        id: '1',
        name: 'Employee',
        email: 'employee@example.com',
        role_id: '550e8400-e29b-41d4-a716-446655440000',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.role_id).toContain('-');
      expect(employee.role_id.length).toBe(36);
    });
  });

  describe('Employee Status', () => {
    it('should track active status', () => {
      const activeEmployee: Employee = {
        id: '1',
        name: 'Active Employee',
        email: 'active@example.com',
        role_id: 'role_1',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(activeEmployee.is_active).toBe(true);
    });

    it('should track inactive status', () => {
      const inactiveEmployee: Employee = {
        id: '2',
        name: 'Inactive Employee',
        email: 'inactive@example.com',
        role_id: 'role_1',
        standard_rate: 100,
        is_consultant: false,
        is_active: false
      };

      expect(inactiveEmployee.is_active).toBe(false);
    });
  });

  describe('Consultant Status', () => {
    it('should differentiate between employees and consultants', () => {
      const employee: Employee = {
        id: '1',
        name: 'Employee',
        email: 'employee@example.com',
        role_id: 'role_1',
        standard_rate: 80,
        is_consultant: false,
        is_active: true
      };

      const consultant: Employee = {
        id: '2',
        name: 'Consultant',
        email: 'consultant@example.com',
        role_id: 'role_2',
        standard_rate: 150,
        is_consultant: true,
        is_active: true
      };

      expect(employee.is_consultant).toBe(false);
      expect(consultant.is_consultant).toBe(true);
      expect(consultant.standard_rate).toBeGreaterThan(employee.standard_rate);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', () => {
      const employee: Employee = {
        id: '1',
        name: "O'Brien-Smith Jr.",
        email: 'obrien@example.com',
        role_id: 'role_1',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.name).toContain("'");
      expect(employee.name).toContain('-');
      expect(employee.name).toContain('.');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(255);
      const employee: Employee = {
        id: '1',
        name: longName,
        email: 'employee@example.com',
        role_id: 'role_1',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.name.length).toBe(255);
    });

    it('should handle numeric string IDs', () => {
      const employee: Employee = {
        id: '999999',
        name: 'Employee',
        email: 'employee@example.com',
        role_id: '123456',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.id).toBe('999999');
      expect(employee.role_id).toBe('123456');
    });

    it('should handle UUID IDs', () => {
      const employee: Employee = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Employee',
        email: 'employee@example.com',
        role_id: '660e8400-e29b-41d4-a716-446655440001',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.id).toContain('-');
      expect(employee.role_id).toContain('-');
    });

    it('should handle international characters in names', () => {
      const employee: Employee = {
        id: '1',
        name: 'José García-Müller',
        email: 'jose@example.com',
        role_id: 'role_1',
        standard_rate: 100,
        is_consultant: false,
        is_active: true
      };

      expect(employee.name).toContain('é');
      expect(employee.name).toContain('í');
      expect(employee.name).toContain('ü');
    });

    it('should handle all boolean combinations', () => {
      const combinations = [
        { is_consultant: true, is_active: true },
        { is_consultant: true, is_active: false },
        { is_consultant: false, is_active: true },
        { is_consultant: false, is_active: false }
      ];

      combinations.forEach(combo => {
        const employee: Employee = {
          id: '1',
          name: 'Employee',
          email: 'employee@example.com',
          role_id: 'role_1',
          standard_rate: 100,
          is_consultant: combo.is_consultant,
          is_active: combo.is_active
        };

        expect(employee.is_consultant).toBe(combo.is_consultant);
        expect(employee.is_active).toBe(combo.is_active);
      });
    });
  });
});
