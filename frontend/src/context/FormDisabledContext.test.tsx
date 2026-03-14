import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { FormDisabledProvider, useFormDisabled } from './FormDisabledContext';

describe('FormDisabledContext', () => {
  it('initializes with default values when used outside provider', () => {
    const { result } = renderHook(() => useFormDisabled());
    expect(result.current.isFormDisabled).toBe(false);
  });

  it('reflects the disabled prop from the provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormDisabledProvider disabled={true}>{children}</FormDisabledProvider>
    );

    const { result } = renderHook(() => useFormDisabled(), { wrapper });
    expect(result.current.isFormDisabled).toBe(true);
  });

  it('reflects false when disabled prop is false', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormDisabledProvider disabled={false}>{children}</FormDisabledProvider>
    );

    const { result } = renderHook(() => useFormDisabled(), { wrapper });
    expect(result.current.isFormDisabled).toBe(false);
  });
});
