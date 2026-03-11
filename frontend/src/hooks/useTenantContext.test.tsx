import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TenantProvider, useTenantContext, validateTenantAccess, getCurrentTenantInfo } from './useTenantContext';
import { jwtDecode } from 'jwt-decode';

vi.mock('jwt-decode');

describe('useTenantContext & related utils', () => {
  const mockLocalStorage = (function () {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      configurable: true,
    });
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('TenantProvider & useTenantContext', () => {
    it('throws error when useTenantContext is used outside provider', () => {
      // Suppress React error logging for this expected failure
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        renderHook(() => useTenantContext());
      }).toThrow('useTenantContext must be used within a TenantProvider');
      spy.mockRestore();
    });

    it('initializes with default values when no token exists', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TenantProvider>{children}</TenantProvider>
      );

      const { result } = renderHook(() => useTenantContext(), { wrapper });

      expect(result.current.tenantId).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSuperAdmin).toBe(false);
    });

    it('extracts tenant info from token correctly', () => {
      window.localStorage.setItem('token', 'fake-token');
      
      vi.mocked(jwtDecode).mockReturnValueOnce({
        TenantId: '123',
        TenantDomain: 'example.com',
        TenantRole: 'Admin',
        UserType: 'Employee',
        IsSuperAdmin: 'false'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TenantProvider>{children}</TenantProvider>
      );

      const { result } = renderHook(() => useTenantContext(), { wrapper });

      expect(result.current.tenantId).toBe(123);
      expect(result.current.tenantDomain).toBe('example.com');
      expect(result.current.tenantRole).toBe('Admin');
      expect(result.current.userType).toBe('Employee');
      expect(result.current.isSuperAdmin).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('handles super admin token correctly', () => {
      window.localStorage.setItem('token', 'fake-token');
      
      vi.mocked(jwtDecode).mockReturnValueOnce({
        IsSuperAdmin: 'true'
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TenantProvider>{children}</TenantProvider>
      );

      const { result } = renderHook(() => useTenantContext(), { wrapper });

      expect(result.current.isSuperAdmin).toBe(true);
      expect(result.current.tenantId).toBeNull();
    });

    it('handles error during token decode safely', () => {
      window.localStorage.setItem('token', 'fake-token');
      
      vi.mocked(jwtDecode).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TenantProvider>{children}</TenantProvider>
      );

      const { result } = renderHook(() => useTenantContext(), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.tenantId).toBeNull();
      
      consoleSpy.mockRestore();
    });

    it('can refresh tenant context manually', () => {
      window.localStorage.setItem('token', 'fake-token');
      
      // First call (mount)
      vi.mocked(jwtDecode).mockReturnValueOnce({ TenantId: '1' });
      
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <TenantProvider>{children}</TenantProvider>
      );

      const { result } = renderHook(() => useTenantContext(), { wrapper });
      expect(result.current.tenantId).toBe(1);

      // Setup for manual refresh
      vi.mocked(jwtDecode).mockReturnValueOnce({ TenantId: '2' });
      
      act(() => {
        result.current.refreshTenantContext();
      });

      expect(result.current.tenantId).toBe(2);
    });
  });

  describe('validateTenantAccess', () => {
    it('returns false if no token is present', () => {
      expect(validateTenantAccess(1)).toBe(false);
    });

    it('returns true for super admin regardless of required tenant', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockReturnValueOnce({ IsSuperAdmin: 'true' });
      
      expect(validateTenantAccess(999)).toBe(true);
    });

    it('returns true if no specific tenant is required and user is authenticated', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockReturnValueOnce({ TenantId: '1' });
      
      expect(validateTenantAccess(undefined)).toBe(true);
    });

    it('returns true if user belongs to the required tenant', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockReturnValueOnce({ TenantId: '5' });
      
      expect(validateTenantAccess(5)).toBe(true);
    });

    it('returns false if user belongs to a different tenant', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockReturnValueOnce({ TenantId: '5' });
      
      expect(validateTenantAccess(10)).toBe(false);
    });

    it('handles decode errors gracefully', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockImplementationOnce(() => {
        throw new Error('Bad token');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(validateTenantAccess(1)).toBe(false);
      
      consoleSpy.mockRestore();
    });
  });

  describe('getCurrentTenantInfo', () => {
    it('returns null if no token is present', () => {
      expect(getCurrentTenantInfo()).toBeNull();
    });

    it('returns extracted info from token', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockReturnValueOnce({
        TenantId: '42',
        TenantDomain: 'test.com',
        TenantRole: 'User',
        UserType: 'Member',
        IsSuperAdmin: 'false'
      });

      const info = getCurrentTenantInfo();
      
      expect(info).toEqual({
        tenantId: 42,
        tenantDomain: 'test.com',
        tenantRole: 'User',
        userType: 'Member',
        isSuperAdmin: false
      });
    });

    it('handles decode errors gracefully', () => {
      window.localStorage.setItem('token', 'fake-token');
      vi.mocked(jwtDecode).mockImplementationOnce(() => {
        throw new Error('Bad token');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(getCurrentTenantInfo()).toBeNull();
      
      consoleSpy.mockRestore();
    });
  });
});
