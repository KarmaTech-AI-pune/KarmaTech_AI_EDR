import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { twoFactorApi } from './twoFactorApi';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

const createFakeToken = (payload: any) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa('fake-signature');
  return `${header}.${body}.${signature}`;
};

describe('twoFactorApi', () => {
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

  describe('sendOtp', () => {
    it('returns success when API resolves', async () => {
      mockAxios.onPost(/api\/twofactor\/send-otp/).reply(200, { success: true, message: 'OTP sent' });
      
      const result = await twoFactorApi.sendOtp('test@example.com');
      expect(result.success).toBe(true);
      expect(result.message).toBe('OTP sent');
    });

    it('returns structured error on failure', async () => {
      mockAxios.onPost(/api\/twofactor\/send-otp/).reply(400, { message: 'User not found' });
      
      const result = await twoFactorApi.sendOtp('test@example.com');
      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('verifyOtp', () => {
    it('successfully verifies and logs user in', async () => {
      const now = Math.floor(Date.now() / 1000);
      const fakeToken = createFakeToken({
        sub: 'user-123',
        email: 'test@example.com',
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'Test User',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'User',
        Permissions: ['DashboardView', 'ProjectView'],
        exp: now + 3600,
        iss: 'test-issuer',
        aud: 'test-aud',
        jti: 'test-jti'
      });

      mockAxios.onPost(/api\/twofactor\/verify-otp/).reply(200, {
        success: true,
        token: fakeToken,
        user: {
          avatar: 'avatar.png',
          standardRate: 150,
          isConsultant: true,
          createdAt: '2023-01-01',
          tenantId: 'tenant-123',
          tenantDomain: 'test',
          twoFactorEnabled: true,
        }
      });

      const result = await twoFactorApi.verifyOtp('test@example.com', '123456');

      expect(result.success).toBe(true);
      expect(result.token).toBe(fakeToken);
      expect(result.user?.id).toBe('user-123');
      expect(result.user?.name).toBe('Test User');
      
      // Verify localStorage is updated
      expect(localStorage.getItem('token')).toBe(fakeToken);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(storedUser.id).toBe('user-123');
      expect(storedUser.roles[0].name).toBe('User');
    });

    it('handles failure in verification', async () => {
      mockAxios.onPost(/api\/twofactor\/verify-otp/).reply(401, { message: 'Invalid OTP' });

      const result = await twoFactorApi.verifyOtp('test@example.com', 'wrong');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid OTP');
    });
  });

  describe('enableTwoFactor', () => {
    it('returns success when API resolves', async () => {
      mockAxios.onPost(/api\/twofactor\/enable/).reply(200, { success: true, message: '2FA enabled' });
      
      const result = await twoFactorApi.enableTwoFactor('user-123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('2FA enabled');
      expect(JSON.parse(mockAxios.history.post[0].data)).toBe('user-123');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/twofactor\/enable/).reply(400, { message: 'Unable to enable' });
      
      const result = await twoFactorApi.enableTwoFactor('user-123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to enable');
    });
  });

  describe('disableTwoFactor', () => {
    it('returns success when API resolves', async () => {
      mockAxios.onPost(/api\/twofactor\/disable/).reply(200, { success: true, message: '2FA disabled' });
      
      const result = await twoFactorApi.disableTwoFactor('user-123');
      expect(result.success).toBe(true);
      expect(result.message).toBe('2FA disabled');
      expect(JSON.parse(mockAxios.history.post[0].data)).toBe('user-123');
    });

    it('handles failure', async () => {
      mockAxios.onPost(/api\/twofactor\/disable/).reply(400, { message: 'Unable to disable' });
      
      const result = await twoFactorApi.disableTwoFactor('user-123');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unable to disable');
    });
  });

  describe('getTwoFactorStatus', () => {
    it('fetches status for specific user', async () => {
      mockAxios.onGet(/api\/twofactor\/status\/user-123/).reply(200, { isTwoFactorEnabled: true });
      
      const result = await twoFactorApi.getTwoFactorStatus('user-123');
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(true);
    });

    it('fetches status for current user (no param)', async () => {
      mockAxios.onGet(/api\/twofactor\/status/).reply(200, { isTwoFactorEnabled: false });
      
      const result = await twoFactorApi.getTwoFactorStatus();
      expect(result.success).toBe(true);
      expect(result.enabled).toBe(false);
    });

    it('handles API failure', async () => {
      mockAxios.onGet(/api\/twofactor\/status/).reply(500, { message: 'Server error' });
      
      const result = await twoFactorApi.getTwoFactorStatus();
      expect(result.success).toBe(false);
      expect(result.enabled).toBe(false);
      expect(result.message).toBe('Server error');
    });
  });
});
