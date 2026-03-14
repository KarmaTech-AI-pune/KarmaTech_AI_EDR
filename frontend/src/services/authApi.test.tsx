import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { authApi } from './authApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

// Utility to create a fake JWT token
const createFakeToken = (payload: any) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('fake-signature');
  return `${header}.${body}.${signature}`;
};

// Mock getTenantContext
vi.mock('./axiosConfig', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    getTenantContext: vi.fn(() => 'testtenant'),
  };
});

describe('authApi', () => {
  let mockAxios: MockAdapter;
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
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
  });

  afterEach(() => {
    mockAxios.restore();
  });

  describe('login', () => {
    it('returns error if no tenant context', async () => {
      // Temporarily mock getTenantContext to return null
      const { getTenantContext } = await import('./axiosConfig');
      (getTenantContext as any).mockReturnValueOnce(null);

      const result = await authApi.login({ email: 'test@example.com', password: 'password' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid tenant configuration');
    });

    it('successfully logs in, stores token and decodes user', async () => {
      const now = Math.floor(Date.now() / 1000);
      const fakeToken = createFakeToken({
        sub: 'user-id-123',
        email: 'test@example.com',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Test User',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin',
        Permissions: ['DashboardView', 'ProjectView'], // Matches enum keys
        exp: now + 3600,
        iss: 'test-issuer',
        aud: 'test-aud',
        jti: 'test-jti'
      });

      mockAxios.onPost('api/user/login').reply(200, {
        success: true,
        token: fakeToken,
        user: {
          avatar: 'avatar.png',
          standardRate: 100,
          isConsultant: false,
          createdAt: '2023-01-01',
          tenantId: 'tenant-123',
          tenantDomain: 'testtenant',
          twoFactorEnabled: false,
          features: ['feature1']
        }
      });

      const credentials = { email: 'test@example.com', password: 'password' };
      const result = await authApi.login(credentials);

      expect(result.success).toBe(true);
      expect(result.token).toBe(fakeToken);
      expect(result.user?.id).toBe('user-id-123');
      expect(result.user?.name).toBe('Test User');
      
      // Verify localStorage
      expect(localStorage.getItem('token')).toBe(fakeToken);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.id).toBe('user-id-123');
    });

    it('handles login failure from API', async () => {
      mockAxios.onPost('api/user/login').reply(401, {
        message: 'Invalid credentials'
      });

      const result = await authApi.login({ email: 'test@example.com', password: 'wrong' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('calls logout endpoint and clears storage', async () => {
      localStorage.setItem('token', 'fake-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      axiosInstance.defaults.headers.common['Authorization'] = 'Bearer fake-token';

      mockAxios.onPost('api/user/logout').reply(200);

      await authApi.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(axiosInstance.defaults.headers.common['Authorization']).toBeUndefined();
    });

    it('clears storage even if API call fails', async () => {
      localStorage.setItem('token', 'fake-token');
      
      mockAxios.onPost('api/user/logout').reply(500);

      await authApi.logout();

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('checkAuth', () => {
    it('returns false if no token', async () => {
      const result = await authApi.checkAuth();
      expect(result).toBe(false);
    });

    it('returns true if token is valid', async () => {
      const fakeToken = createFakeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', fakeToken);

      const result = await authApi.checkAuth();
      expect(result).toBe(true);
    });

    it('returns false and logs out if token is expired', async () => {
      const fakeToken = createFakeToken({ exp: Math.floor(Date.now() / 1000) - 3600 }); // expired
      localStorage.setItem('token', fakeToken);
      
      mockAxios.onPost('api/user/logout').reply(200);

      const result = await authApi.checkAuth();
      expect(result).toBe(false);
      expect(localStorage.getItem('token')).toBeNull(); // Verifies logout was called
    });

    it('returns false if token is invalid format', async () => {
      localStorage.setItem('token', 'invalid-token-string');
      const result = await authApi.checkAuth();
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('returns user if present in localStorage', async () => {
      const fakeUser = { id: 'test-id', name: 'Test' };
      localStorage.setItem('user', JSON.stringify(fakeUser));

      const user = await authApi.getCurrentUser();
      expect(user).toEqual(fakeUser);
    });

    it('returns null if not in localStorage', async () => {
      const user = await authApi.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('returns true if no token', () => {
      expect(authApi.isTokenExpired()).toBe(true);
    });

    it('returns true if token is expired', () => {
      const fakeToken = createFakeToken({ exp: Math.floor(Date.now() / 1000) - 3600 });
      localStorage.setItem('token', fakeToken);
      expect(authApi.isTokenExpired()).toBe(true);
    });

    it('returns false if token is not expired', () => {
      const fakeToken = createFakeToken({ exp: Math.floor(Date.now() / 1000) + 3600 });
      localStorage.setItem('token', fakeToken);
      expect(authApi.isTokenExpired()).toBe(false);
    });
  });

  describe('signup', () => {
    it('returns success when API returns 201', async () => {
      mockAxios.onPost('/api/CreateAccount').reply(201);
      
      const result = await authApi.signup({ email: 'new@example.com' });
      expect(result.success).toBe(true);
      expect(result.message).toBe('Account created successfully!');
    });

    it('returns failure when API returns other success code', async () => {
      mockAxios.onPost('/api/CreateAccount').reply(200, { message: 'Something went wrong' });
      
      const result = await authApi.signup({ email: 'new@example.com' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Something went wrong');
    });

    it('catches and returns API error message', async () => {
      mockAxios.onPost('/api/CreateAccount').reply(400, { message: 'Email already exists' });
      
      const result = await authApi.signup({ email: 'new@example.com' });
      expect(result.success).toBe(false);
      expect(result.message).toBe('Email already exists');
    });
  });
});
