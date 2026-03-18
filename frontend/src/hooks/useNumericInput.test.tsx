import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNumericInput } from './useNumericInput';

describe('useNumericInput', () => {
  it('initializes with the given value as string', () => {
    const { result } = renderHook(() => useNumericInput(42));
    expect(result.current.value).toBe('42');
  });

  it('initializes with empty string when no value provided', () => {
    const { result } = renderHook(() => useNumericInput());
    expect(result.current.value).toBe('');
  });

  it('initializes with string input', () => {
    const { result } = renderHook(() => useNumericInput('100'));
    expect(result.current.value).toBe('100');
  });

  it('strips leading zeros on handleChange', () => {
    const { result } = renderHook(() => useNumericInput());
    act(() => {
      result.current.handleChange({
        target: { value: '05' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe('5');
  });

  it('keeps single zero', () => {
    const { result } = renderHook(() => useNumericInput());
    act(() => {
      result.current.handleChange({
        target: { value: '0' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe('0');
  });

  it('allows setValue to update value', () => {
    const { result } = renderHook(() => useNumericInput(0));
    act(() => {
      result.current.setValue('999');
    });
    expect(result.current.value).toBe('999');
  });

  it('handles normal input without leading zeros', () => {
    const { result } = renderHook(() => useNumericInput());
    act(() => {
      result.current.handleChange({
        target: { value: '123' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.value).toBe('123');
  });
});
