import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorkflow } from './useWorkflow';
import { workflowApi } from '../dummyapi/workflowApi';
import { WorkflowStatus } from '../models/workflowModel';

vi.mock('../dummyapi/workflowApi', () => ({
  workflowApi: {
    initiateWorkflow: vi.fn(),
    createVersion: vi.fn(),
    advanceWorkflow: vi.fn(),
    updateStatus: vi.fn()
  }
}));

describe('useWorkflow hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWorkflow());
    
    expect(result.current.workflowInstance).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  describe('initiateGoNoGoWorkflow', () => {
    it('initiates workflow successfully', async () => {
      const mockInstance = { id: 'wf-1', status: WorkflowStatus.Initiated, versions: [] };
      vi.mocked(workflowApi.initiateWorkflow).mockResolvedValueOnce(mockInstance as any);

      const { result } = renderHook(() => useWorkflow());

      let returnVal;
      act(() => {
        returnVal = result.current.initiateGoNoGoWorkflow('entity-1', 'GO_NO_GO');
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBeNull();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workflowInstance).toEqual(mockInstance);
      expect(await returnVal).toEqual(mockInstance);
      expect(workflowApi.initiateWorkflow).toHaveBeenCalledWith('entity-1', 'GO_NO_GO');
    });

    it('handles errors during initiation', async () => {
      const error = new Error('Failed to initiate');
      vi.mocked(workflowApi.initiateWorkflow).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWorkflow());

      await act(async () => {
        await expect(result.current.initiateGoNoGoWorkflow('entity-1', 'GO_NO_GO')).rejects.toThrow('Failed to initiate');
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to initiate');
      expect(result.current.workflowInstance).toBeNull();
    });
  });

  describe('createDecisionVersion', () => {
    it('creates decision version successfully', async () => {
      // Setup Initial State
      const mockInstance = { id: 'wf-1', status: WorkflowStatus.Initiated, versions: [] };
      vi.mocked(workflowApi.initiateWorkflow).mockResolvedValueOnce(mockInstance as any);

      const { result } = renderHook(() => useWorkflow());

      await act(async () => {
        await result.current.initiateGoNoGoWorkflow('entity-1', 'GO_NO_GO');
      });

      const mockVersion = { id: 'v-1', data: 'test-data', status: 'DRAFT' };
      vi.mocked(workflowApi.createVersion).mockResolvedValueOnce(mockVersion as any);

      let returnVal;
      act(() => {
        returnVal = result.current.createDecisionVersion('wf-1', 'test-data', 'user1', 'comments', 'DRAFT');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workflowInstance?.versions).toContainEqual(mockVersion);
      expect(await returnVal).toEqual(mockVersion);
      expect(workflowApi.createVersion).toHaveBeenCalledWith('wf-1', 'test-data', 'user1', 'comments', 'DRAFT');
    });

    it('handles errors during version creation', async () => {
      const error = new Error('Failed to create version');
      vi.mocked(workflowApi.createVersion).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWorkflow());

      await act(async () => {
        await expect(result.current.createDecisionVersion('wf-1', 'data', 'user', 'comments', 'DRAFT')).rejects.toThrow('Failed to create version');
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to create version');
    });
  });

  describe('advanceWorkflowStep', () => {
    it('advances workflow step successfully', async () => {
      const mockUpdatedInstance = { id: 'wf-1', status: WorkflowStatus.UnderReview, versions: [] };
      vi.mocked(workflowApi.advanceWorkflow).mockResolvedValueOnce(mockUpdatedInstance as any);

      const { result } = renderHook(() => useWorkflow());

      let returnVal;
      act(() => {
        returnVal = result.current.advanceWorkflowStep('wf-1');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workflowInstance).toEqual(mockUpdatedInstance);
      expect(await returnVal).toEqual(mockUpdatedInstance);
      expect(workflowApi.advanceWorkflow).toHaveBeenCalledWith('wf-1');
    });

    it('handles errors during advancement', async () => {
      const error = new Error('Failed to advance');
      vi.mocked(workflowApi.advanceWorkflow).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWorkflow());

      await act(async () => {
        await expect(result.current.advanceWorkflowStep('wf-1')).rejects.toThrow('Failed to advance');
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to advance');
    });
  });

  describe('updateWorkflowStatus', () => {
    it('updates workflow status successfully', async () => {
      const mockUpdatedInstance = { id: 'wf-1', status: WorkflowStatus.Approved, versions: [] };
      vi.mocked(workflowApi.updateStatus).mockResolvedValueOnce(mockUpdatedInstance as any);

      const { result } = renderHook(() => useWorkflow());

      let returnVal;
      act(() => {
        returnVal = result.current.updateWorkflowStatus('wf-1', WorkflowStatus.Approved);
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.workflowInstance).toEqual(mockUpdatedInstance);
      expect(await returnVal).toEqual(mockUpdatedInstance);
      expect(workflowApi.updateStatus).toHaveBeenCalledWith('wf-1', WorkflowStatus.Approved);
    });

    it('handles errors during status update', async () => {
      const error = new Error('Failed to update status');
      vi.mocked(workflowApi.updateStatus).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useWorkflow());

      await act(async () => {
        await expect(result.current.updateWorkflowStatus('wf-1', WorkflowStatus.Rejected)).rejects.toThrow('Failed to update status');
      });
      
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Failed to update status');
    });
  });
});
