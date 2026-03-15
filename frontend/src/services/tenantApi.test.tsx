import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import * as tenantApi from './tenantApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('tenantApi', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('getAllTenants', () => {
    it('fetches tenants', async () => {
      const mockTenants = [{ id: 1, name: 'T1' }];
      mockAxios.onGet(/api\/tenants$/).reply(200, mockTenants);
      
      const result = await tenantApi.getAllTenants();
      expect(result).toEqual(mockTenants);
    });
  });

  describe('getTenantById', () => {
    it('fetches single tenant', async () => {
      const mockTenant = { id: 1, name: 'T1' };
      mockAxios.onGet(/api\/tenants\/1/).reply(200, mockTenant);
      
      const result = await tenantApi.getTenantById(1);
      expect(result).toEqual(mockTenant);
    });
  });

  describe('createTenant', () => {
    it('posts new tenant', async () => {
      const payload: any = { name: 'New Tenant' };
      mockAxios.onPost(/api\/tenants$/).reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { id: 2, ...payload }];
      });
      
      const result = await tenantApi.createTenant(payload);
      expect(result.id).toBe(2);
      expect(result.name).toBe('New Tenant');
    });
  });

  describe('updateTenant', () => {
    it('puts tenant updates', async () => {
      const payload: any = { name: 'Updated' };
      mockAxios.onPut(/api\/tenants\/1/).reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { id: 1, ...payload }];
      });
      
      const result = await tenantApi.updateTenant(1, payload);
      expect(result.name).toBe('Updated');
    });
  });

  describe('deleteTenant', () => {
    it('calls delete', async () => {
      mockAxios.onDelete(/api\/tenants\/1/).reply(200);
      
      await expect(tenantApi.deleteTenant(1)).resolves.toBeUndefined();
    });
  });

  describe('validateSubdomain', () => {
    it('returns isValid true', async () => {
      mockAxios.onPost(/api\/tenants\/validate-subdomain/).reply((config) => {
        expect(JSON.parse(config.data).subdomain).toBe('test');
        return [200, { isValid: true }];
      });
      
      const result = await tenantApi.validateSubdomain('test');
      expect(result).toBe(true);
    });

    it('returns isValid false', async () => {
      mockAxios.onPost(/api\/tenants\/validate-subdomain/).reply(200, { isValid: false });
      
      const result = await tenantApi.validateSubdomain('test');
      expect(result).toBe(false);
    });
  });

  describe('suggestSubdomain', () => {
    it('returns suggestions array', async () => {
      mockAxios.onPost(/api\/tenants\/suggest-subdomain/).reply((config) => {
        expect(JSON.parse(config.data).companyName).toBe('My Company');
        return [200, { suggestions: ['mycompany', 'my-company'] }];
      });
      
      const result = await tenantApi.suggestSubdomain('My Company');
      expect(result).toEqual(['mycompany', 'my-company']);
    });
  });

  describe('getTenantStats', () => {
    it('returns stats', async () => {
      mockAxios.onGet(/api\/tenants\/stats/).reply(200, { usersCount: 5 });
      
      const result = await tenantApi.getTenantStats();
      expect(result).toEqual({ usersCount: 5 });
    });
  });

  describe('Tenant User Management', () => {
    it('getTenantUsers', async () => {
      mockAxios.onGet(/api\/tenants\/1\/users/).reply(200, [{ id: 'u1' }]);
      const result = await tenantApi.getTenantUsers(1);
      expect(result).toEqual([{ id: 'u1' }]);
    });

    it('addTenantUser', async () => {
      const payload = { tenantId: 1, userId: 'u1', role: 1, isActive: true };
      mockAxios.onPost(/api\/tenants\/1\/users/).reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { success: true }];
      });
      const result = await tenantApi.addTenantUser(payload);
      expect(result).toEqual({ success: true });
    });

    it('updateTenantUser', async () => {
      const payload = { role: 2 };
      mockAxios.onPut(/api\/tenants\/users\/1/).reply((config) => {
        expect(JSON.parse(config.data)).toEqual(payload);
        return [200, { success: true }];
      });
      const result = await tenantApi.updateTenantUser(1, payload);
      expect(result).toEqual({ success: true });
    });

    it('removeTenantUser', async () => {
      mockAxios.onDelete(/api\/tenants\/users\/1/).reply(200);
      await expect(tenantApi.removeTenantUser(1)).resolves.toBeUndefined();
    });
  });
});
