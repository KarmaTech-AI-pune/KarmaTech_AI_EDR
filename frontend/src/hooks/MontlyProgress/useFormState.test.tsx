import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormState } from './useFormState';
import * as monthlyProgressUtils from '../../utils/MonthlyProgress/monthlyProgressUtils';

vi.mock('../../utils/MonthlyProgress/monthlyProgressUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof monthlyProgressUtils>();
  return {
    ...actual,
    calculateTotals: vi.fn((data: any) => ({ ...data, _calculated: true }))
  };
});

describe('useFormState hook', () => {
  it('initializes with default state', () => {
    const { result } = renderHook(() => useFormState());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.showSuccess).toBe(false);
    expect(result.current.data).toBeDefined();
    expect(result.current.data.changeOrders).toEqual({
      proposed: [],
      submitted: [],
      approved: []
    });
  });

  it('updates form data recursively using setNestedValue and calculates totals', () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.updateFormData('fees.net', 1000);
    });

    // Nested value should be set
    expect(result.current.data.fees.net).toBe(1000);
    
    // Check if calculateTotals was called (via our mock setting _calculated flag)
    expect((result.current.data as any)._calculated).toBe(true);
    expect(monthlyProgressUtils.calculateTotals).toHaveBeenCalled();
  });

  it('sets loading state correctly', () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('sets success state correctly', () => {
    const { result } = renderHook(() => useFormState());

    act(() => {
      result.current.setShowSuccess(true);
    });

    expect(result.current.showSuccess).toBe(true);
  });
});
