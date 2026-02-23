import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'; // Import vi directly
import { useRoles } from './useRoles';
import * as rolesApi from '../services/rolesApi';
import { RoleDefinition } from '../models';

// Mock the rolesApi
vi.mock('../services/rolesApi', () => ({
  getAllRoles: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useRoles', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockRoles: RoleDefinition[] = [
    { id: '1', name: 'Admin', permissions: [] },
    { id: '2', name: 'User', permissions: [] },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    // Default successful mock response for API
    (rolesApi.getAllRoles as import('vitest').Mock).mockResolvedValue(mockRoles);
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useRoles());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.roles).toEqual([]);
    expect(result.current.currentUserRole).toBeNull();
  });

  it('should fetch roles successfully', async () => {
    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.roles).toEqual(mockRoles);
    });

    expect(rolesApi.getAllRoles).toHaveBeenCalledTimes(1);
  });

  it('should handle error during roles fetch', async () => {
    const errorMessage = 'Network error';
    (rolesApi.getAllRoles as import('vitest').Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.roles).toEqual([]);
    });
  });

  it('should refetch roles when refetch is called', async () => {
    const { result } = renderHook(() => useRoles());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Clear mocks and set a new response for refetch
    vi.clearAllMocks();
    const newRoles: RoleDefinition[] = [{ id: '3', name: 'Editor', permissions: [] }];
    (rolesApi.getAllRoles as import('vitest').Mock).mockResolvedValue(newRoles);

    await result.current.refetch();

    await waitFor(() => {
      expect(rolesApi.getAllRoles).toHaveBeenCalledTimes(1);
      expect(result.current.roles).toEqual(newRoles);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should return currentUserRole from localStorage if available', () => {
    localStorageMock.setItem('user', JSON.stringify({ roles: [{ name: 'Admin' }] }));
    const { result } = renderHook(() => useRoles());

    expect(result.current.currentUserRole).toBe('Admin');
  });

  it('should return null for currentUserRole if user in localStorage has no roles', () => {
    localStorageMock.setItem('user', JSON.stringify({ name: 'Test User' })); // No roles property
    const { result } = renderHook(() => useRoles());

    expect(result.current.currentUserRole).toBeNull();
  });

  it('should return null for currentUserRole if no user in localStorage', () => {
    localStorageMock.clear();
    const { result } = renderHook(() => useRoles());

    expect(result.current.currentUserRole).toBeNull();
  });

  it('should return null for currentUserRole if user in localStorage has empty roles array', () => {
    localStorageMock.setItem('user', JSON.stringify({ roles: [] }));
    const { result } = renderHook(() => useRoles());

    expect(result.current.currentUserRole).toBeNull();
  });
});

