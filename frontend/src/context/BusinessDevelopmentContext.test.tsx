import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import React from 'react';
import { BusinessDevelopmentProvider, useBusinessDevelopment } from './BusinessDevelopmentContext';
import { opportunityApi } from '../dummyapi/opportunityApi';
import { getOpportunityHistoriesByOpportunityId } from '../dummyapi/dummyOpportunityHistoryApi';

vi.mock('../dummyapi/opportunityApi', () => ({
  opportunityApi: {
    getById: vi.fn()
  }
}));

vi.mock('../dummyapi/dummyOpportunityHistoryApi', () => ({
  getOpportunityHistoriesByOpportunityId: vi.fn()
}));

describe('BusinessDevelopmentContext', () => {
  const mockSessionStorage = (() => {
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
    Object.defineProperty(window, 'sessionStorage', {
      value: mockSessionStorage,
      configurable: true,
    });
    window.sessionStorage.clear();
  });

  it('throws error when useBusinessDevelopment is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useBusinessDevelopment());
    }).toThrow('useBusinessDevelopment must be used within a BusinessDevelopmentProvider');
    spy.mockRestore();
  });

  it('initializes with null opportunity when no ID in sessionStorage', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BusinessDevelopmentProvider>{children}</BusinessDevelopmentProvider>
    );

    const { result } = renderHook(() => useBusinessDevelopment(), { wrapper });

    expect(result.current.opportunityId).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.opportunity).toBeNull();
  });

  it('fetches opportunity and history data when opportunityId is set', async () => {
    const mockOpp = { id: 1, name: 'Test Opportunity' };
    const mockHistory = [{ id: 'h1', opportunityId: 1, action: 'Created' }];
    
    vi.mocked(opportunityApi.getById).mockResolvedValue(mockOpp as any);
    vi.mocked(getOpportunityHistoriesByOpportunityId).mockResolvedValue(mockHistory as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BusinessDevelopmentProvider>{children}</BusinessDevelopmentProvider>
    );

    const { result } = renderHook(() => useBusinessDevelopment(), { wrapper });

    act(() => {
      result.current.setOpportunityId('1');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.opportunity).toEqual(mockOpp);
    expect(result.current.histories).toEqual(mockHistory);
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('opportunityId', '1');
  });

  it('handles "Opportunity not found" error', async () => {
    vi.mocked(opportunityApi.getById).mockResolvedValue(null as any);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BusinessDevelopmentProvider>{children}</BusinessDevelopmentProvider>
    );

    const { result } = renderHook(() => useBusinessDevelopment(), { wrapper });

    act(() => {
      result.current.setOpportunityId('999');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Opportunity not found');
    expect(result.current.opportunity).toBeNull();
  });

  it('handles API fetch errors', async () => {
    const errorMsg = 'Network Error';
    vi.mocked(opportunityApi.getById).mockRejectedValue(new Error(errorMsg));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BusinessDevelopmentProvider>{children}</BusinessDevelopmentProvider>
    );

    const { result } = renderHook(() => useBusinessDevelopment(), { wrapper });

    act(() => {
      result.current.setOpportunityId('1');
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMsg);
    
    consoleSpy.mockRestore();
  });

  it('updates state for Go/No-Go status and version', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <BusinessDevelopmentProvider>{children}</BusinessDevelopmentProvider>
    );

    const { result } = renderHook(() => useBusinessDevelopment(), { wrapper });

    act(() => {
      result.current.setGoNoGoDecisionStatus('Approved');
      result.current.setGoNoGoVersionNumber(2);
    });

    expect(result.current.goNoGoDecisionStatus).toBe('Approved');
    expect(result.current.goNoGoVersionNumber).toBe(2);
  });
});
