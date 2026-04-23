import { describe, it, expect } from 'vitest';
import { Tenant } from './tenantModel';

describe('Tenant Model', () => {
  describe('Type Definition', () => {
    it('should have required properties', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01'
      };

      expect(tenant.id).toBe('1');
      expect(tenant.name).toBe('Test Tenant');
      expect(tenant.email).toBe('tenant@example.com');
    });

    it('should have optional properties', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01',
        website: 'https://example.com',
        industry: 'Technology',
        employees: 100
      };

      expect(tenant.website).toBe('https://example.com');
      expect(tenant.industry).toBe('Technology');
      expect(tenant.employees).toBe(100);
    });
  });

  describe('Contact Information', () => {
    it('should store email addresses', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'contact@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01'
      };

      expect(tenant.email).toContain('@');
    });

    it('should store phone numbers', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01'
      };

      expect(tenant.phone).toContain('+1');
    });
  });

  describe('Address Information', () => {
    it('should store complete address', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St, Suite 100',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01'
      };

      expect(tenant.address).toContain('Suite');
      expect(tenant.city).toBe('New York');
      expect(tenant.state).toBe('NY');
      expect(tenant.country).toBe('USA');
      expect(tenant.zipCode).toBe('10001');
    });
  });

  describe('Tenant Information', () => {
    it('should store website URL', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01',
        website: 'https://www.example.com'
      };

      expect(tenant.website).toContain('https');
    });

    it('should store industry information', () => {
      const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing'];

      industries.forEach(industry => {
        const tenant: Tenant = {
          id: '1',
          name: 'Test Tenant',
          email: 'tenant@example.com',
          phone: '+1-555-0123',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
          createdAt: '2024-01-01',
          industry: industry
        };

        expect(tenant.industry).toBe(industry);
      });
    });

    it('should store employee count', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01',
        employees: 500
      };

      expect(tenant.employees).toBe(500);
    });
  });

  describe('Timestamps', () => {
    it('should track creation date', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Test Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01T10:00:00Z'
      };

      expect(tenant.createdAt).toContain('2024-01-01');
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in names', () => {
      const tenant: Tenant = {
        id: '1',
        name: "O'Brien & Associates",
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01'
      };

      expect(tenant.name).toContain('&');
    });

    it('should handle international addresses', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'International Tenant',
        email: 'tenant@example.com',
        phone: '+44-20-7946-0958',
        address: '10 Downing Street',
        city: 'London',
        state: 'England',
        country: 'United Kingdom',
        zipCode: 'SW1A 2AA',
        createdAt: '2024-01-01'
      };

      expect(tenant.country).toBe('United Kingdom');
      expect(tenant.phone).toContain('+44');
    });

    it('should handle large employee counts', () => {
      const tenant: Tenant = {
        id: '1',
        name: 'Large Tenant',
        email: 'tenant@example.com',
        phone: '+1-555-0123',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        zipCode: '10001',
        createdAt: '2024-01-01',
        employees: 100000
      };

      expect(tenant.employees).toBe(100000);
    });
  });
});
