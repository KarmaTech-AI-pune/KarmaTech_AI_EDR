import { useState, useCallback } from 'react';
import { workflowApi } from '../dummyapi/workflowApi';
import { WorkflowInstance, WorkflowVersion, WorkflowStatus } from '../models/workflowModel';

interface UseWorkflowReturn {
    workflowInstance: WorkflowInstance | null;
    loading: boolean;
    error: string | null;
    initiateGoNoGoWorkflow: (entityId: string, workflowType: string) => Promise<WorkflowInstance>;
    createDecisionVersion: (
        workflowId: string,
        data: string,
        createdBy: string,
        comments: string,
        status: string
    ) => Promise<WorkflowVersion>;
    advanceWorkflowStep: (workflowId: string) => Promise<WorkflowInstance>;
    updateWorkflowStatus: (workflowId: string, status: WorkflowStatus) => Promise<WorkflowInstance>;
}

export const useWorkflow = (): UseWorkflowReturn => {
    const [workflowInstance, setWorkflowInstance] = useState<WorkflowInstance | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize a new workflow instance
    const initiateGoNoGoWorkflow = useCallback(async (entityId: string, workflowType: string) => {
        setLoading(true);
        setError(null);
        try {
            const instance = await workflowApi.initiateWorkflow(entityId, workflowType);
            setWorkflowInstance(instance);
            return instance;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to initiate workflow';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new version of the workflow
    const createDecisionVersion = useCallback(async (
        workflowId: string,
        data: string,
        createdBy: string,
        comments: string,
        status: string
    ): Promise<WorkflowVersion> => {
        setLoading(true);
        setError(null);
        try {
            const version = await workflowApi.createVersion(
                workflowId,
                data,
                createdBy,
                comments,
                status
            );
            // Update the workflow instance to include the new version
            if (workflowInstance) {
                setWorkflowInstance({
                    ...workflowInstance,
                    versions: [...workflowInstance.versions, version]
                });
            }
            return version;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create version';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [workflowInstance]);

    // Advance the workflow to the next step
    const advanceWorkflowStep = useCallback(async (workflowId: string) => {
        setLoading(true);
        setError(null);
        try {
            const updatedInstance = await workflowApi.advanceWorkflow(workflowId);
            setWorkflowInstance(updatedInstance);
            return updatedInstance;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to advance workflow';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update workflow status
    const updateWorkflowStatus = useCallback(async (workflowId: string, status: WorkflowStatus) => {
        setLoading(true);
        setError(null);
        try {
            const updatedInstance = await workflowApi.updateStatus(workflowId, status);
            setWorkflowInstance(updatedInstance);
            return updatedInstance;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        workflowInstance,
        loading,
        error,
        initiateGoNoGoWorkflow,
        createDecisionVersion,
        advanceWorkflowStep,
        updateWorkflowStatus
    };
};
