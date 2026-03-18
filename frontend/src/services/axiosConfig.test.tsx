import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// Stop the global axios mock from setup.ts from breaking the interceptors
vi.unmock('axios');

import { axiosInstance, getTenantContext, ensureHeaders } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('axiosConfig', () => {
  const originalLocation = window.location;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, hostname: 'localhost' } as any;

    // Set up a bulletproof localStorage mock AFTER window.location is changed
    mockStorage = {};
    const localStorageMock = {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, val) => { mockStorage[key] = val.toString(); }),
      removeItem: vi.fn((key) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; })
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
  });

  afterEach(() => {
    window.location = originalLocation as any;
  });

  describe('getTenantContext', () => {
    it('returns localhost for plain localhost', () => {
      window.location.hostname = 'localhost';
      expect(getTenantContext()).toBe('localhost');
    });

    it('returns subdomain for localhost subdomains', () => {
      window.location.hostname = 'companya.localhost';
      expect(getTenantContext()).toBe('companya');
    });

    it('returns subdomain for normal domains', () => {
      window.location.hostname = 'tenant1.example.com';
      expect(getTenantContext()).toBe('tenant1');
    });

    it('returns null if no subdomain', () => {
      window.location.hostname = 'example';
      expect(getTenantContext()).toBeNull();
    });
  });

  describe('ensureHeaders', () => {
    it('adds both token and tenant context when present', () => {
      localStorage.setItem('token', 'fake-token');
      window.location.hostname = 'tenant1.localhost';

      const config = ensureHeaders();
      
      expect(config.headers).toBeDefined();
      expect((config.headers as any).Authorization).toBe('Bearer fake-token');
      expect((config.headers as any)['X-Tenant-Context']).toBe('tenant1');
    });

    it('returns default headers if nothing is present', () => {
      window.location.hostname = 'example';
      
      const config = ensureHeaders();
      expect(config.headers).toEqual({});
      expect((config.headers as any).Authorization).toBeUndefined();
      expect((config.headers as any)['X-Tenant-Context']).toBeUndefined();
    });

    it('preserves existing headers and appends others', () => {
      localStorage.setItem('token', 'fake-token');
      window.location.hostname = 'example';
      const baseConfig = { headers: { 'Custom-Header': 'value' } as any };
      
      const config = ensureHeaders(baseConfig);
      
      expect((config.headers as any)['Custom-Header']).toBe('value');
      expect((config.headers as any).Authorization).toBe('Bearer fake-token');
    });
  });

  describe('axiosInstance interceptors', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
      mockAxios = new MockAdapter(axiosInstance);
    });

    afterEach(() => {
      mockAxios.restore();
    });

    it('request interceptor adds authorization and tenant headers', async () => {
      localStorage.setItem('token', 'test-jwt-token');
      window.location.hostname = 'mytenant.localhost';

      mockAxios.onGet('/test-success').reply(function(config) {
        return [200, {
          authHeader: config.headers?.Authorization,
          tenantHeader: config.headers?.['X-Tenant-Context']
        }];
      });

      const response = await axiosInstance.get('/test-success');

      expect(response.data.authHeader).toBe('Bearer test-jwt-token');
      expect(response.data.tenantHeader).toBe('mytenant');
    });

    it('response interceptor removes token on 401', async () => {
      localStorage.setItem('token', 'expired-token');
      
      mockAxios.onGet('/test-401').reply(401, 'Unauthorized');

      try {
        await axiosInstance.get('/test-401');
      } catch (e) {
        // Expected to throw
      }

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('response interceptor does not clear token on 403', async () => {
      localStorage.setItem('token', 'valid-token');
      
      mockAxios.onGet('/test-403').reply(403, 'Forbidden');

      try {
        await axiosInstance.get('/test-403');
      } catch (e) {
        // Expected to throw
      }

      expect(localStorage.getItem('token')).toBe('valid-token');
    });
  });
});
