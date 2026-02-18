import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'; // Import vi directly
import { usePMWorkflow } from './usePMWorkflow';
import { pmWorkflowApi } from '../api/pmWorkflowApi';
import { PMWorkflowHistoryResponse } from '../models/pmWorkflowModel';

// Mock the pmWorkflowApi
vi.mock('../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    getWorkflowHistory: vi.fn(),
    canViewEntity: vi.fn(),
  },
}));

describe('usePMWorkflow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockEntityId = 123;
  const mockEntityType = 'Project';

  const mockWorkflowHistory: PMWorkflowHistoryResponse = {
    entityId: mockEntityId,
    entityType: mockEntityType,
    currentStatusId: 2,
    currentStatus: 'In Progress',
    history: [
      {
        id: 1,
        entityId: mockEntityId,
        entityType: mockEntityType,
        statusId: 1,
        status: 'Initial',
        actionBy: 'user1',
        actionByName: 'User One',
        assignedToId: 'user1',
        assignedToName: 'User One', // Added missing property
        action: 'Initial',
        actionDate: '2023-01-01T10:00:00Z',
        comments: 'Initial creation',
      },
      {
        id: 2,
        entityId: mockEntityId,
        entityType: mockEntityType,
        statusId: 2,
        status: 'In Progress',
        actionBy: 'user2',
        actionByName: 'User Two',
        assignedToId: 'user2',
        assignedToName: 'User Two', // Added missing property
        action: 'Sent for Review',
        actionDate: '2023-01-02T11:00:00Z',
        comments: 'Started work',
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful mock responses
    (pmWorkflowApi.getWorkflowHistory as vi.Mock).mockResolvedValue(mockWorkflowHistory);
    (pmWorkflowApi.canViewEntity as vi.Mock).mockResolvedValue(true);
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => usePMWorkflow({ entityId: mockEntityId, entityType: mockEntityType }));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.workflowHistory).toBeNull();
    expect(result.current.currentStatusId).toBe(1); // Default initial status
    expect(result.current.currentStatus).toBe('Initial'); // Default initial status
    expect(result.current.canView).toBe(false);
  });

  it('should fetch workflow history and canView status successfully', async () => {
    const { result } = renderHook(() => usePMWorkflow({ entityId: mockEntityId, entityType: mockEntityType }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.workflowHistory).toEqual(mockWorkflowHistory);
      expect(result.current.currentStatusId).toBe(mockWorkflowHistory.currentStatusId);
      expect(result.current.currentStatus).toBe(mockWorkflowHistory.currentStatus);
      expect(result.current.canView).toBe(true);
    });

    expect(pmWorkflowApi.getWorkflowHistory).toHaveBeenCalledWith(mockEntityType, mockEntityId);
    expect(pmWorkflowApi.canViewEntity).toHaveBeenCalledWith(mockEntityType, mockEntityId);
  });

  it('should handle error during data fetch', async () => {
    const errorMessage = 'Failed to fetch data';
    (pmWorkflowApi.getWorkflowHistory as vi.Mock).mockRejectedValue(new Error(errorMessage));
    (pmWorkflowApi.canViewEntity as vi.Mock).mockResolvedValue(false); // Still mock canViewEntity

    const { result } = renderHook(() => usePMWorkflow({ entityId: mockEntityId, entityType: mockEntityType }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to load workflow data');
      expect(result.current.workflowHistory).toBeNull();
      expect(result.current.currentStatusId).toBe(1);
      expect(result.current.currentStatus).toBe('Initial');
      expect(result.current.canView).toBe(false); // Should be false if there's an error or canView fails
    });
  });

  it('should refresh workflow data when refreshWorkflow is called', async () => {
    const { result } = renderHook(() => usePMWorkflow({ entityId: mockEntityId, entityType: mockEntityType }));

    // Wait for initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Clear mocks to check for re-fetch
    vi.clearAllMocks();
    (pmWorkflowApi.getWorkflowHistory as vi.Mock).mockResolvedValue({
      ...mockWorkflowHistory,
      currentStatus: 'Approved',
    });
    (pmWorkflowApi.canViewEntity as vi.Mock).mockResolvedValue(false);

    await result.current.refreshWorkflow();

    await waitFor(() => {
      expect(pmWorkflowApi.getWorkflowHistory).toHaveBeenCalledTimes(1);
      expect(pmWorkflowApi.canViewEntity).toHaveBeenCalledTimes(1);
      expect(result.current.workflowHistory?.currentStatus).toBe('Approved');
      expect(result.current.canView).toBe(false);
      expect(result.current.loading).toBe(false);
    });
  });

  it('should not fetch data if entityId is not provided', async () => {
    const { result } = renderHook(() => usePMWorkflow({ entityId: 0, entityType: mockEntityType })); // entityId is 0

    await waitFor(() => {
      expect(result.current.loading).toBe(false); // Should quickly resolve to not loading
      expect(result.current.workflowHistory).toBeNull();
      expect(result.current.currentStatusId).toBe(1);
      expect(result.current.currentStatus).toBe('Initial');
      expect(result.current.canView).toBe(false);
    });

    expect(pmWorkflowApi.getWorkflowHistory).not.toHaveBeenCalled();
    expect(pmWorkflowApi.canViewEntity).not.toHaveBeenCalled();
  });

  it('should handle canViewEntity returning false', async () => {
    (pmWorkflowApi.canViewEntity as vi.Mock).mockResolvedValue(false);

    const { result } = renderHook(() => usePMWorkflow({ entityId: mockEntityId, entityType: mockEntityType }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.canView).toBe(false);
    });
  });
});

