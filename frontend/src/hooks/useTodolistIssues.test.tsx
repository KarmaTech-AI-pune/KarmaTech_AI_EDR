import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTodolistIssues } from './useTodolistIssues';
import * as todolistData from '../data/todolistData';
import { useProject } from '../context/ProjectContext';

vi.mock('../data/todolistData', () => ({
  fetchActiveSprintIdAPI: vi.fn(),
  fetchIssuesForSprintAPI: vi.fn(),
  createIssueAPI: vi.fn(),
  deleteIssueAPI: vi.fn(),
  updateIssueAPI: vi.fn(),
  createSubtaskAPI: vi.fn(),
  deleteSubtaskAPI: vi.fn(),
  updateSubtaskAPI: vi.fn(),
  updateSprintPlanAPI: vi.fn(),
  fetchNextSprintAPI: vi.fn(),
  teamMembers: [
    { id: '1', name: 'John Doe', avatar: 'JD' },
    { id: '2', name: 'Jane Smith', avatar: 'JS' }
  ]
}));

vi.mock('../context/ProjectContext', () => ({
  useProject: vi.fn()
}));

vi.mock('../services/commentService', () => ({
  commentService: {
    getTaskComments: vi.fn(),
    getCommentsBySubtaskId: vi.fn(),
    addTaskComment: vi.fn(),
    addSubtaskComment: vi.fn(),
    updateTaskComment: vi.fn(),
    deleteTaskComment: vi.fn(),
    updateSubtaskComment: vi.fn(),
    deleteSubtaskComment: vi.fn(),
  }
}));

describe('useTodolistIssues hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes empty state when no projectId is provided', async () => {
    vi.mocked(useProject).mockReturnValue({ projectId: null } as any);

    const { result } = renderHook(() => useTodolistIssues());

    expect(result.current.loading).toBe(false);
    expect(result.current.sprintId).toBeNull();
    expect(result.current.issues).toEqual([]);
    
    // fetchActiveSprintIdAPI should not be called
    expect(todolistData.fetchActiveSprintIdAPI).not.toHaveBeenCalled();
  });

  it('fetches active sprint id when projectId is provided', async () => {
    vi.mocked(useProject).mockReturnValue({ projectId: '10' } as any);
    vi.mocked(todolistData.fetchActiveSprintIdAPI).mockResolvedValueOnce(5);
    vi.mocked(todolistData.fetchIssuesForSprintAPI).mockResolvedValueOnce({
      issues: [],
      sprintPlan: { sprintId: 5, status: 0 } as any,
      sprintEmployees: []
    });

    const { result } = renderHook(() => useTodolistIssues());

    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.sprintId).toBe(5);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(todolistData.fetchActiveSprintIdAPI).toHaveBeenCalledWith(10);
    expect(todolistData.fetchIssuesForSprintAPI).toHaveBeenCalledWith(5, 10);
  });

  it('loads issues successfully', async () => {
    vi.mocked(useProject).mockReturnValue({ projectId: '10' } as any);
    vi.mocked(todolistData.fetchActiveSprintIdAPI).mockResolvedValueOnce(5);
    
    const mockIssue = {
      id: '100',
      key: 'PROJ-001',
      summary: 'Test Issue',
      subtasks: []
    };
    
    vi.mocked(todolistData.fetchIssuesForSprintAPI).mockResolvedValueOnce({
      issues: [mockIssue as any],
      sprintPlan: { sprintId: 5, status: 0 } as any,
      sprintEmployees: []
    });

    const { result } = renderHook(() => useTodolistIssues());

    await waitFor(() => {
      expect(result.current.issues.length).toBe(1);
    });

    expect(result.current.issues[0]).toEqual(mockIssue);
    expect(result.current.error).toBeNull();
  });

  it('handles error fetching issues', async () => {
    vi.mocked(useProject).mockReturnValue({ projectId: '10' } as any);
    vi.mocked(todolistData.fetchActiveSprintIdAPI).mockResolvedValueOnce(5);
    vi.mocked(todolistData.fetchIssuesForSprintAPI).mockRejectedValueOnce(new Error('Network Error'));
    
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTodolistIssues());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.issues).toEqual([]);
    expect(result.current.error).toBe('Failed to load issues from server');
    
    spy.mockRestore();
  });

  it('creates an issue optimistically', async () => {
    vi.mocked(useProject).mockReturnValue({ projectId: '10' } as any);
    vi.mocked(todolistData.fetchActiveSprintIdAPI).mockResolvedValueOnce(5);
    vi.mocked(todolistData.fetchIssuesForSprintAPI).mockResolvedValueOnce({
      issues: [],
      sprintPlan: { sprintId: 5 } as any,
      sprintEmployees: []
    });
    vi.mocked(todolistData.createIssueAPI).mockResolvedValueOnce(12345);

    const { result } = renderHook(() => useTodolistIssues());

    await waitFor(() => {
      expect(result.current.sprintId).toBe(5);
    });

    const newIssueData = {
      summary: 'New Task',
      description: 'Desc',
      issueType: 'Task' as const,
      priority: 'High' as const,
      assignee: 'John Doe',
      storyPoints: '5',
      estimatedHours: '10',
      remainingHours: '10',
      fixVersion: 'v1',
      components: 'Frontend',
      labels: ''
    };

    act(() => {
      result.current.createIssue(newIssueData);
    });

    // Optimistic update
    expect(result.current.issues.length).toBe(1);
    expect(result.current.issues[0].summary).toBe('New Task');
    expect(result.current.issues[0].id).not.toBe('12345'); // Still temporary ID

    await waitFor(() => {
      // Replaced by real ID
      expect(result.current.issues[0].id).toBe('12345');
    });
    
    expect(todolistData.createIssueAPI).toHaveBeenCalled();
  });
});
