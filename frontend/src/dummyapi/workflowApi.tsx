import { WorkflowInstance, WorkflowVersion, WorkflowStatus, WorkflowStep } from '../models/workflowModel';
import { axiosInstance } from './axiosConfig';

// Mock data for initial workflow steps
const defaultWorkflowSteps: WorkflowStep[] = [
    {
        id: '1',
        name: 'Initiation',
        order: 1,
        roles: ['BDM'],
        actions: ['create', 'submit']
    },
    {
        id: '2',
        name: 'Review',
        order: 2,
        roles: ['Regional Manager'],
        actions: ['review', 'approve', 'reject']
    },
    {
        id: '3',
        name: 'Approval',
        order: 3,
        roles: ['Regional Director'],
        actions: ['approve', 'reject']
    }
];

export const workflowApi = {
    // Initialize a new workflow instance
    initiateWorkflow: async (entityId: string, workflowType: string): Promise<WorkflowInstance> => {
        try {
            const response = await axiosInstance.post('/api/workflow/initiate', {
                entityId,
                workflowType
            });

            // If API is not available, return mock data
            if (!response.data) {
                return {
                    id: `wf_${Date.now()}`,
                    workflowType,
                    status: WorkflowStatus.Initiated,
                    currentStepOrder: 1,
                    currentStep: defaultWorkflowSteps[0],
                    steps: defaultWorkflowSteps,
                    transitions: [],
                    versions: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    entityId
                };
            }

            return response.data;
        } catch (error) {
            console.error('Failed to initiate workflow:', error);
            // Return mock data in case of error
            return {
                id: `wf_${Date.now()}`,
                workflowType,
                status: WorkflowStatus.Initiated,
                currentStepOrder: 1,
                currentStep: defaultWorkflowSteps[0],
                steps: defaultWorkflowSteps,
                transitions: [],
                versions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                entityId
            };
        }
    },

    // Get workflow instance by ID
    getWorkflowInstance: async (workflowId: string): Promise<WorkflowInstance> => {
        try {
            const response = await axiosInstance.get(`/api/workflow/${workflowId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to get workflow instance:', error);
            throw error;
        }
    },

    // Create a new version of the workflow
    createVersion: async (
        workflowId: string,
        data: string,
        createdBy: string,
        comments: string,
        status: string
    ): Promise<WorkflowVersion> => {
        try {
            const response = await axiosInstance.post(`/api/workflow/${workflowId}/versions`, {
                data,
                createdBy,
                comments,
                status
            });

            // If API is not available, return mock data
            if (!response.data) {
                return {
                    id: `ver_${Date.now()}`,
                    workflowInstanceId: workflowId,
                    versionNumber: 1,
                    data,
                    createdBy,
                    createdAt: new Date(),
                    comments,
                    status
                };
            }

            return response.data;
        } catch (error) {
            console.error('Failed to create workflow version:', error);
            // Return mock data in case of error
            return {
                id: `ver_${Date.now()}`,
                workflowInstanceId: workflowId,
                versionNumber: 1,
                data,
                createdBy,
                createdAt: new Date(),
                comments,
                status
            };
        }
    },

    // Advance workflow to next step
    advanceWorkflow: async (workflowId: string): Promise<WorkflowInstance> => {
        try {
            const response = await axiosInstance.post(`/api/workflow/${workflowId}/advance`);
            return response.data;
        } catch (error) {
            console.error('Failed to advance workflow:', error);
            throw error;
        }
    },

    // Update workflow status
    updateStatus: async (workflowId: string, status: WorkflowStatus): Promise<WorkflowInstance> => {
        try {
            const response = await axiosInstance.patch(`/api/workflow/${workflowId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Failed to update workflow status:', error);
            throw error;
        }
    }
};
