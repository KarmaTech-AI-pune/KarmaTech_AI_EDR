import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { ProjectProvider, useProject } from './ProjectContext';

describe('ProjectContext', () => {
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

  it('throws error when useProject is used outside provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useProject());
    }).toThrow('useProject must be used within a ProjectProvider');
    spy.mockRestore();
  });

  it('initializes with values from sessionStorage', () => {
    window.sessionStorage.setItem('projectId', '123');
    window.sessionStorage.setItem('programId', '456');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProjectProvider>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useProject(), { wrapper });

    expect(result.current.projectId).toBe('123');
    expect(result.current.programId).toBe('456');
  });

  it('updates projectId and persists to sessionStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProjectProvider>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useProject(), { wrapper });

    act(() => {
      result.current.setProjectId('789');
    });

    expect(result.current.projectId).toBe('789');
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('projectId', '789');

    act(() => {
      result.current.setProjectId(null);
    });

    expect(result.current.projectId).toBeNull();
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('projectId');
  });

  it('updates programId and persists to sessionStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProjectProvider>{children}</ProjectProvider>
    );

    const { result } = renderHook(() => useProject(), { wrapper });

    act(() => {
      result.current.setProgramId('abc');
    });

    expect(result.current.programId).toBe('abc');
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith('programId', 'abc');

    act(() => {
      result.current.setProgramId(null);
    });

    expect(result.current.programId).toBeNull();
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith('programId');
  });
});
