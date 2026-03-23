import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePrograms } from './usePrograms';
import { programApi } from '../services/programApi';

vi.mock('../services/programApi', () => ({
  programApi: {
    getAll: vi.fn()
  }
}));

describe('usePrograms hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches programs successfully on mount', async () => {
    const mockPrograms = [
      { id: '1', name: 'Program 1' },
      { id: '2', name: 'Program 2' }
    ];
    
    vi.mocked(programApi.getAll).mockResolvedValueOnce(mockPrograms as any);

    const { result } = renderHook(() => usePrograms());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.programs).toEqual([]);
    expect(result.current.error).toBeNull();

    // After fetch
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.programs).toEqual(mockPrograms);
    expect(result.current.error).toBeNull();
    expect(programApi.getAll).toHaveBeenCalledTimes(1);
  });

  it('handles error fetching programs', async () => {
    vi.mocked(programApi.getAll).mockRejectedValueOnce(new Error('Network error'));
    
    // Silence console error from the hook locally for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => usePrograms());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.programs).toEqual([]);
    expect(result.current.error).toBe('Failed to load programs');
    
    consoleSpy.mockRestore();
  });

  it('can refetch programs', async () => {
    const mockPrograms1 = [{ id: '1', name: 'Program 1' }];
    const mockPrograms2 = [{ id: '1', name: 'Program 1' }, { id: '2', name: 'Program 2' }];
    
    vi.mocked(programApi.getAll)
      .mockResolvedValueOnce(mockPrograms1 as any)
      .mockResolvedValueOnce(mockPrograms2 as any);

    const { result } = renderHook(() => usePrograms());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.programs).toEqual(mockPrograms1);

    // Trigger refetch
    import('react').then(({ act }) => {
      act(() => {
        result.current.refetch();
      });
    });

    // It should go back to loading state during refetch (handled synchronous by act usually, but since async we wait)
    // Wait for the second fetch to resolve
    await waitFor(() => {
      expect(result.current.programs).toEqual(mockPrograms2);
    });
    
    expect(programApi.getAll).toHaveBeenCalledTimes(2);
  });
});
