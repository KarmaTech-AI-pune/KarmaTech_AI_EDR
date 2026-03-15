import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurrencyInput } from './useCurrencyInput';
import * as currencyFormatter from '../utils/currencyFormatter';

// Mock the currencyFormatter module
vi.mock('../utils/currencyFormatter', () => ({
  formatIndianCurrencyLive: vi.fn((val: string) => `formatted-${val}`),
  cleanCurrencyInput: vi.fn((val: string) => val.replace(/[^\d.]/g, '')),
  validateCurrencyInput: vi.fn(() => true),
  parseCurrencyToNumber: vi.fn((val: string) => parseFloat(val.replace(/[^\d.]/g, '')) || 0)
}));

describe('useCurrencyInput hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty string when initialValue is undefined', () => {
    const { result } = renderHook(() => useCurrencyInput());
    expect(result.current.value).toBe('');
  });

  it('initializes and formats string number correctly', () => {
    const { result } = renderHook(() => useCurrencyInput('1000'));
    expect(currencyFormatter.formatIndianCurrencyLive).toHaveBeenCalledWith('1000');
    expect(result.current.value).toBe('formatted-1000');
  });

  it('initializes and formats integer correctly', () => {
    const { result } = renderHook(() => useCurrencyInput(2000));
    expect(currencyFormatter.formatIndianCurrencyLive).toHaveBeenCalledWith('2000');
    expect(result.current.value).toBe('formatted-2000');
  });

  it('updates value when initialValue changes', () => {
    const { result, rerender } = renderHook(({ init }) => useCurrencyInput(init), {
      initialProps: { init: 100 }
    });
    
    expect(result.current.value).toBe('formatted-100');
    
    rerender({ init: 200 });
    expect(result.current.value).toBe('formatted-200');
  });

  it('handles handleChange event', async () => {
    const { result } = renderHook(() => useCurrencyInput());
    
    // Simulate input change
    act(() => {
      const event = {
        target: { value: '1000', selectionStart: 4, setSelectionRange: vi.fn() }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(currencyFormatter.cleanCurrencyInput).toHaveBeenCalledWith('1000');
    expect(currencyFormatter.validateCurrencyInput).toHaveBeenCalledWith('1000');
    expect(currencyFormatter.formatIndianCurrencyLive).toHaveBeenCalledWith('1000');
    
    expect(result.current.value).toBe('formatted-1000');
    
    // Wait for setSelectionRange inside setTimeout
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  it('ignores handleChange event when input is invalid', () => {
    // Override mock to return false for validation
    vi.mocked(currencyFormatter.validateCurrencyInput).mockReturnValueOnce(false);
    
    const { result } = renderHook(() => useCurrencyInput('100'));
    
    act(() => {
      const event = {
        target: { value: '100.5.5', selectionStart: 0, setSelectionRange: vi.fn() }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    // Value should remain the same as initial state
    expect(result.current.value).toBe('formatted-100');
  });

  it('gets raw value', () => {
    const { result } = renderHook(() => useCurrencyInput('1000'));
    
    const rawVal = result.current.getRawValue();
    expect(currencyFormatter.parseCurrencyToNumber).toHaveBeenCalledWith('formatted-1000');
    expect(rawVal).toBe(1000);
  });

  it('sets value programmatically from number', () => {
    const { result } = renderHook(() => useCurrencyInput());
    
    act(() => {
      result.current.setValue(500);
    });
    
    expect(currencyFormatter.formatIndianCurrencyLive).toHaveBeenCalledWith('500');
    expect(result.current.value).toBe('formatted-500');
  });

  it('sets value programmatically from string', () => {
    const { result } = renderHook(() => useCurrencyInput());
    
    act(() => {
      result.current.setValue('500,00.00');
    });
    
    expect(currencyFormatter.cleanCurrencyInput).toHaveBeenCalledWith('500,00.00');
    expect(currencyFormatter.formatIndianCurrencyLive).toHaveBeenCalledWith('50000.00');
    expect(result.current.value).toBe('formatted-50000.00');
  });

  it('provides change handler that syncs raw value', async () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useCurrencyInput());
    
    const handler = result.current.getChangeHandler(onValueChange);
    
    act(() => {
      const event = {
        target: { value: '300', selectionStart: 3, setSelectionRange: vi.fn() }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handler(event);
    });

    expect(result.current.value).toBe('formatted-300');
    
    // Wait for the sync setTimeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(onValueChange).toHaveBeenCalledWith(300);
  });
});
