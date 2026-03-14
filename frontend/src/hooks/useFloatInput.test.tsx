import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFloatInput } from './useFloatInput';
import * as currencyFormatter from '../utils/currencyFormatter';

vi.mock('../utils/currencyFormatter', () => ({
  validateCurrencyInput: vi.fn(() => true)
}));

describe('useFloatInput hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty string when initialValue is undefined', () => {
    const { result } = renderHook(() => useFloatInput());
    expect(result.current.value).toBe('');
  });

  it('initializes with correct number', () => {
    const { result } = renderHook(() => useFloatInput(5.75));
    expect(result.current.value).toBe(5.75);
  });

  it('initializes with correct string', () => {
    const { result } = renderHook(() => useFloatInput('100.5'));
    expect(result.current.value).toBe('100.5');
  });

  it('updates value when initialValue changes', () => {
    const { result, rerender } = renderHook(({ init }) => useFloatInput(init), {
      initialProps: { init: 10 }
    });
    
    expect(result.current.value).toBe(10);
    
    rerender({ init: 20 });
    expect(result.current.value).toBe(20);
  });

  it('handles handleChange event', () => {
    const { result } = renderHook(() => useFloatInput());
    
    act(() => {
      const event = {
        target: { value: '15.5' }
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(currencyFormatter.validateCurrencyInput).toHaveBeenCalledWith('15.5');
    expect(result.current.value).toBe('15.5');
  });

  it('auto-clears leading zeros if value is currently 0', () => {
    const { result } = renderHook(() => useFloatInput(0));
    
    act(() => {
      const event = {
        target: { value: '05' }
      } as React.ChangeEvent<HTMLInputElement>;
      result.current.handleChange(event);
    });

    expect(result.current.value).toBe('5');
  });

  it('gets raw value returning 0 for empty or invalid', () => {
    const { result } = renderHook(() => useFloatInput());
    expect(result.current.getRawValue()).toBe(0);

    act(() => {
      result.current.setValue('invalid');
    });
    expect(result.current.getRawValue()).toBe(0);
  });

  it('gets raw value returning parsed float', () => {
    const { result } = renderHook(() => useFloatInput('42.5'));
    expect(result.current.getRawValue()).toBe(42.5);
  });

  it('sets value programmatically', () => {
    const { result } = renderHook(() => useFloatInput());
    
    act(() => {
      result.current.setValue(100);
    });
    expect(result.current.value).toBe(100);

    act(() => {
      result.current.setValue('');
    });
    expect(result.current.value).toBe('');
  });

  it('provides change handler that syncs raw value', async () => {
    const onValueChange = vi.fn();
    const { result } = renderHook(() => useFloatInput());
    
    const handler = result.current.getChangeHandler(onValueChange);
    
    act(() => {
      const event = {
        target: { value: '3.14' }
      } as React.ChangeEvent<HTMLInputElement>;
      handler(event);
    });

    expect(result.current.value).toBe('3.14');
    
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(onValueChange).toHaveBeenCalledWith(3.14);
  });
});
