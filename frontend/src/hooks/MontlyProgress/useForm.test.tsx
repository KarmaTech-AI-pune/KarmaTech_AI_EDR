import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { FormControlsProvider, useFormControls } from './useForm';

describe('useForm hook (FormControls)', () => {
  const dummyTabs = [
    { label: 'Tab 1', id: '1' },
    { label: 'Tab 2', id: '2' },
    { label: 'Tab 3', id: '3' }
  ] as any;

  it('throws an error if used outside of FormControlsProvider', () => {
    // Silence React warning
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useFormControls());
    }).toThrow('useFormControls must be used within a FormControlsProvider');

    spy.mockRestore();
  });

  it('initializes with default values inside provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormControlsProvider tabs={dummyTabs}>
        {children}
      </FormControlsProvider>
    );

    const { result } = renderHook(() => useFormControls(), { wrapper });

    expect(result.current.currentPageIndex).toBe(0);
    expect(result.current.previousPageIndex).toBe(0);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.isFinalPage).toBe(false);
  });

  it('handles next correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormControlsProvider tabs={dummyTabs}>
        {children}
      </FormControlsProvider>
    );

    const { result } = renderHook(() => useFormControls(), { wrapper });

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentPageIndex).toBe(1);
    expect(result.current.previousPageIndex).toBe(0);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.isFinalPage).toBe(false);

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentPageIndex).toBe(2);
    expect(result.current.previousPageIndex).toBe(1);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.isFinalPage).toBe(true);

    // Call next when already at the end
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentPageIndex).toBe(2); // Should cap at length - 1
  });

  it('handles back correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormControlsProvider tabs={dummyTabs}>
        {children}
      </FormControlsProvider>
    );

    const { result } = renderHook(() => useFormControls(), { wrapper });

    // Go to end first
    act(() => {
      result.current.setCurrentPageIndex(2);
    });

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentPageIndex).toBe(1);
    expect(result.current.previousPageIndex).toBe(2);

    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentPageIndex).toBe(0);

    // Call back when already at the beginning
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.currentPageIndex).toBe(0); // Should cap at 0
  });

  it('allows manual set page', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <FormControlsProvider tabs={dummyTabs}>
        {children}
      </FormControlsProvider>
    );

    const { result } = renderHook(() => useFormControls(), { wrapper });

    act(() => {
      result.current.setpage(1);
    });

    expect(result.current.currentPageIndex).toBe(1);
  });
});
