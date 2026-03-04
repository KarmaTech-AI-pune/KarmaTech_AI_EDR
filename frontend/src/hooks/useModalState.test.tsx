import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useModalState } from './useModalState';

describe('useModalState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useModalState());
    expect(result.current.showCreateModal).toBe(false);
    expect(result.current.showIssueDetail).toBeNull();
    expect(result.current.editingIssue).toBeNull();
  });

  it('toggles showCreateModal', () => {
    const { result } = renderHook(() => useModalState());
    act(() => {
      result.current.setShowCreateModal(true);
    });
    expect(result.current.showCreateModal).toBe(true);

    act(() => {
      result.current.setShowCreateModal(false);
    });
    expect(result.current.showCreateModal).toBe(false);
  });

  it('sets showIssueDetail to an issue', () => {
    const { result } = renderHook(() => useModalState());
    const mockIssue = { id: 1, title: 'Test Issue' } as any;
    act(() => {
      result.current.setShowIssueDetail(mockIssue);
    });
    expect(result.current.showIssueDetail).toEqual(mockIssue);
  });

  it('clears showIssueDetail back to null', () => {
    const { result } = renderHook(() => useModalState());
    act(() => {
      result.current.setShowIssueDetail({ id: 1 } as any);
    });
    act(() => {
      result.current.setShowIssueDetail(null);
    });
    expect(result.current.showIssueDetail).toBeNull();
  });

  it('sets editingIssue', () => {
    const { result } = renderHook(() => useModalState());
    const mockIssue = { id: 2, title: 'Edit Issue' } as any;
    act(() => {
      result.current.setEditingIssue(mockIssue);
    });
    expect(result.current.editingIssue).toEqual(mockIssue);
  });

  it('clears editingIssue back to null', () => {
    const { result } = renderHook(() => useModalState());
    act(() => {
      result.current.setEditingIssue({ id: 2 } as any);
    });
    act(() => {
      result.current.setEditingIssue(null);
    });
    expect(result.current.editingIssue).toBeNull();
  });
});
