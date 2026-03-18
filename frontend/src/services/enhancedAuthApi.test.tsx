import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import axios from 'axios';
import { enhancedAuthApi } from './enhancedAuthApi';
import MockAdapter from 'axios-mock-adapter';

const createFakeToken = (payload: any) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('fake-signature');
  return `${header}.${body}.${signature}`;
};

describe('enhancedAuthApi', () => {
  let mockAxios: MockAdapter;
  let mockStorage: Record<string, string> = {};
  let originalLocation: Location;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    vi.clearAllMocks();

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

    originalLocation = window.location;
    // @ts-ignore
    delete window.location;
    window.location = { ...originalLocation, hostname: 'localhost', href: 'http://localhost' } as any;
  });

  afterEach(() => {
    mockAxios.restore();
    window.location = originalLocation as any;
  });

  describe('login', () => {
    it('sends tenantContext in headers if provided', async () => {
      const fakeToken = createFakeToken({
        sub: 'id',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
        Permissions: 'read,write'
      });

      mockAxios.onPost(/api\/user\/login/).reply(config => {
        expect(config.headers?.['X-Tenant-Context']).toBe('mytenant');
        return [200, { success: true, token: fakeToken, user: {} }];
      });

      const result = await enhancedAuthApi.login({ email: 'a', password: 'b' }, 'mytenant');
      expect(result.success).toBe(true);
    });

    it('successfully extracts enhanced token claims', async () => {
      const fakeToken = createFakeToken({
        sub: 'user-id',
        email: 'test@example.com',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Enhanced User',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Manager',
        Permissions: 'VIEW_PROJECT, EDIT_PROJECT',
        Features: 'featureA, featureB',
        IsSuperAdmin: 'true',
        UserType: 'SuperAdmin',
        TenantRole: 'Admin',
        TenantId: '42',
        TenantDomain: 'admin.localhost',
        exp: Math.floor(Date.now() / 1000) + 3600
      });

      mockAxios.onPost(/api\/user\/login/).reply(200, {
        success: true,
        token: fakeToken,
        user: { avatar: 'avatar.png' }
      });

      const result = await enhancedAuthApi.login({ email: 'test@example.com', password: 'password' }, 'admin');

      expect(result.success).toBe(true);
      const user = result.user;
      expect(user?.isSuperAdmin).toBe(true);
      expect(user?.userType).toBe('SuperAdmin');
      expect(user?.tenantRole).toBe('Admin');
      expect(user?.tenantId).toBe(42);
      expect(user?.tenantDomain).toBe('admin.localhost');
      expect(user?.features).toEqual(['featureA', 'featureB']);
      expect(user?.tenantContext).toBe('admin');
      expect(user?.roleDetails?.permissions).toContain('VIEW_PROJECT');
    });

    it('handles failures from server', async () => {
      mockAxios.onPost(/api\/user\/login/).reply(401, { message: 'Bad credentials' });
      const result = await enhancedAuthApi.login({ email: 'a', password: 'b' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Bad credentials');
    });
  });

  describe('getAvailableTenants', () => {
    it('fetches tenants', async () => {
      const mockTenants = [{ id: 1, name: 'Tenant 1' }];
      mockAxios.onGet(/api\/tenants/).reply(200, mockTenants);

      const result = await enhancedAuthApi.getAvailableTenants();
      expect(result).toEqual(mockTenants);
    });

    it('throws error on failure', async () => {
      mockAxios.onGet(/api\/tenants/).reply(500);
      await expect(enhancedAuthApi.getAvailableTenants()).rejects.toThrow('Failed to fetch available tenants');
    });
  });

  describe('logout', () => {
    it('handles super admin logout', async () => {
      const fakeToken = createFakeToken({ IsSuperAdmin: 'true' });
      localStorage.setItem('token', fakeToken);
      
      mockAxios.onPost(/user\/logout/).reply((config) => {
        expect(config.url).toBe('http://localhost:5000/api/user/logout');
        return [200, {}];
      });

      await enhancedAuthApi.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles tenant user logout', async () => {
      const fakeToken = createFakeToken({ UserType: 'TenantUser' });
      localStorage.setItem('token', fakeToken);
      
      mockAxios.onPost(/user\/logout/).reply((config) => {
        expect(config.url).toBe('http://tenant1.localhost:5000/api/user/logout');
        return [200, {}];
      });

      await enhancedAuthApi.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('returns false if token is expired', async () => {
      const fakeToken = createFakeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
      localStorage.setItem('token', fakeToken);
      mockAxios.onPost(/logout/).reply(200);

      expect(await enhancedAuthApi.checkAuth()).toBe(false);
    });

    it('returns false for tenant user on wrong domain', async () => {
      window.location.hostname = 'wrongtenant.localhost';
      const fakeToken = createFakeToken({ 
        UserType: 'TenantUser', 
        TenantDomain: 'mytenant.localhost',
        exp: Math.floor(Date.now() / 1000) + 3600 
      });
      localStorage.setItem('token', fakeToken);
      
      expect(await enhancedAuthApi.checkAuth()).toBe(false);
    });

    it('returns true for super admin on localhost', async () => {
      window.location.hostname = 'any.localhost';
      const fakeToken = createFakeToken({ 
        UserType: 'SuperAdmin',
        exp: Math.floor(Date.now() / 1000) + 3600 
      });
      localStorage.setItem('token', fakeToken);
      
      expect(await enhancedAuthApi.checkAuth()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('redirects tenant user if context mismatches', async () => {
      window.location.hostname = 'wrong.localhost:5000';
      localStorage.setItem('user', JSON.stringify({ tenantContext: 'mytenant' }));
      const fakeToken = createFakeToken({ UserType: 'TenantUser' });
      localStorage.setItem('token', fakeToken);

      const result = await enhancedAuthApi.getCurrentUser();
      expect(result).toBeNull();
      expect(window.location.href).toBe('http://mytenant.localhost:5000');
    });

    it('returns user if context matches', async () => {
      window.location.hostname = 'mytenant.localhost:5173';
      const fakeUser = { tenantContext: 'mytenant', name: 'Valid User' };
      localStorage.setItem('user', JSON.stringify(fakeUser));
      const fakeToken = createFakeToken({ UserType: 'TenantUser' });
      localStorage.setItem('token', fakeToken);

      const result = await enhancedAuthApi.getCurrentUser();
      expect(result).toEqual(fakeUser);
    });
  });

  describe('utils', () => {
    it('isSuperAdmin returns correctly', () => {
      localStorage.setItem('user', JSON.stringify({ isSuperAdmin: true }));
      expect(enhancedAuthApi.isSuperAdmin()).toBe(true);

      localStorage.setItem('user', JSON.stringify({ isSuperAdmin: false }));
      expect(enhancedAuthApi.isSuperAdmin()).toBe(false);
    });

    it('getCurrentTenantContext returns correctly', () => {
      localStorage.setItem('user', JSON.stringify({ tenantContext: 'mytenant' }));
      expect(enhancedAuthApi.getCurrentTenantContext()).toBe('mytenant');

      localStorage.clear();
      expect(enhancedAuthApi.getCurrentTenantContext()).toBeNull();
    });
    
    it('superAdminLogin calls login', async () => {
      const loginSpy = vi.spyOn(enhancedAuthApi, 'login').mockResolvedValue({ success: true } as any);
      await enhancedAuthApi.superAdminLogin({ email: 'a', password: 'b' });
      expect(loginSpy).toHaveBeenCalledWith({ email: 'a', password: 'b' });
    });

    it('tenantLogin calls login with context', async () => {
      const loginSpy = vi.spyOn(enhancedAuthApi, 'login').mockResolvedValue({ success: true } as any);
      await enhancedAuthApi.tenantLogin({ email: 'a', password: 'b' }, 'tenantX');
      expect(loginSpy).toHaveBeenCalledWith({ email: 'a', password: 'b' }, 'tenantX');
    });
  });
});
