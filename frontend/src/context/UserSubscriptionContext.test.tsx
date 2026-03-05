import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { UserSubscriptionProvider } from './UserSubscriptionContext';
import { useUserSubscription } from '../hooks/useUserSubscription';

describe('UserSubscriptionContext', () => {
  const mockLocalStorage = (() => {
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

  it('handles "No user found in localStorage" error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionProvider>{children}</UserSubscriptionProvider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('No user data found. Please login again.');
    expect(result.current.subscription).toBeNull();
    
    consoleSpy.mockRestore();
  });

  it('extracts subscription data from user object in localStorage', async () => {
    const mockUser = {
      features: ['FeatureA', 'FeatureB']
    };
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionProvider>{children}</UserSubscriptionProvider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.subscription).toEqual({
      features: [
        { name: 'FeatureA', enabled: true },
        { name: 'FeatureB', enabled: true }
      ]
    });
    expect(result.current.error).toBeNull();
  });

  it('handles "No features found" error', async () => {
    const mockUser = { features: null };
    window.localStorage.setItem('user', JSON.stringify(mockUser));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionProvider>{children}</UserSubscriptionProvider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('No subscription features found.');
    
    consoleSpy.mockRestore();
  });

  it('verifies hasFeature function works', async () => {
    const mockUser = { features: ['FeatureA'] };
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionProvider>{children}</UserSubscriptionProvider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasFeature('FeatureA')).toBe(true);
    expect(result.current.hasFeature('FeatureB')).toBe(false);
  });

  it('allows manual refresh of subscription', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionProvider>{children}</UserSubscriptionProvider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock new data in storage
    const mockUser = { features: ['NewFeature'] };
    window.localStorage.setItem('user', JSON.stringify(mockUser));

    await act(async () => {
      await result.current.refreshSubscription();
    });

    expect(result.current.subscription?.features[0].name).toBe('NewFeature');
  });
});
