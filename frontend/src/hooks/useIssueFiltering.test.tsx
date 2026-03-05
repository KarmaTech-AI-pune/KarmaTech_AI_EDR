import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIssueFiltering } from './useIssueFiltering';
import { Issue } from '../types/todolist';

const mockIssues: Issue[] = [
  {
    id: '1',
    key: 'PROJ-1',
    summary: 'First issue',
    status: 'To Do',
    assignee: { id: 'alice', name: 'Alice' },
    reporter: { id: 'bob', name: 'Bob' },
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    description: '',
    comments: [],
    issueType: 'Story',
    priority: 'High',
    project: '1',
    labels: []
  },
  {
    id: '2',
    key: 'PROJ-2',
    summary: 'Second issue done',
    status: 'Done',
    assignee: { id: 'john', name: 'John Smith' },
    reporter: { id: 'alice', name: 'Alice' },
    createdDate: new Date('2023-01-01').toISOString(),
    updatedDate: new Date('2023-01-01').toISOString(), // Not recently updated
    description: '',
    comments: [],
    issueType: 'Bug',
    priority: 'Medium',
    project: '1',
    labels: []
  },
  {
    id: '3',
    key: 'TEST-1',
    summary: 'Third issue',
    status: 'In Progress',
    assignee: { id: 'bob', name: 'Bob' },
    reporter: { id: 'john', name: 'John Smith' },
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(), // Recently updated
    description: '',
    comments: [],
    issueType: 'Task',
    priority: 'Low',
    project: '1',
    labels: []
  }
];

describe('useIssueFiltering hook', () => {
  it('returns all issues initially', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    expect(result.current.filteredIssues.length).toBe(3);
  });

  it('filters by search term in summary', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setSearchTerm('Second');
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('2');
  });

  it('filters by search term in key', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setSearchTerm('TEST-1');
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('3');
  });

  it('filters by "Only My Issues"', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setQuickFilters(prev => ({ ...prev, 'Only My Issues': true }));
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('2'); // Assignee is 'john'
  });

  it('filters by "Recently Updated"', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setQuickFilters(prev => ({ ...prev, 'Recently Updated': true }));
    });

    expect(result.current.filteredIssues.length).toBe(2);
    expect(result.current.filteredIssues.map(i => i.id)).toEqual(expect.arrayContaining(['1', '3']));
  });

  it('filters by "Done Issues"', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setQuickFilters(prev => ({ ...prev, 'Done Issues': true }));
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('2');
  });

  it('handles multiple quick filters combined', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setQuickFilters({
        'Only My Issues': true,
        'Recently Updated': false,
        'Done Issues': true
      });
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('2');
  });

  it('handles search and quick filters combined', () => {
    const { result } = renderHook(() => useIssueFiltering(mockIssues));
    
    act(() => {
      result.current.setSearchTerm('First');
      result.current.setQuickFilters(prev => ({ ...prev, 'Recently Updated': true }));
    });

    expect(result.current.filteredIssues.length).toBe(1);
    expect(result.current.filteredIssues[0].id).toBe('1');
  });
});
