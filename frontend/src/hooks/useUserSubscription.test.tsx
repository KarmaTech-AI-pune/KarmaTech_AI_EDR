import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useUserSubscription } from './useUserSubscription';
import UserSubscriptionContext from '../context/UserSubscriptionContext';

describe('useUserSubscription hook', () => {
  it('throws an error if used outside of UserSubscriptionProvider', () => {
    // Silence console error from React expecting the error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useUserSubscription());
    }).toThrow('useUserSubscription must be used within a UserSubscriptionProvider');

    spy.mockRestore();
  });

  it('returns context value when used within UserSubscriptionProvider', () => {
    const mockContextValue = {
      subscription: { features: [] },
      loading: false,
      error: null,
      hasFeature: vi.fn(),
      refreshSubscription: vi.fn(),
    } as any;

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <UserSubscriptionContext.Provider value={mockContextValue}>
        {children}
      </UserSubscriptionContext.Provider>
    );

    const { result } = renderHook(() => useUserSubscription(), { wrapper });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.subscription).toEqual({ features: [] });
  });
});
