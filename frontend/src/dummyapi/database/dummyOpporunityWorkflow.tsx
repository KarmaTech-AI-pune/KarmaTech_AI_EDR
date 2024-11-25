export interface WorkflowStatus {
    id: number;
    status: string;
}

export const workflowStatuses: WorkflowStatus[] = [
    {
        id: 1,
        status: "Initial"
    },
    {
        id: 2,
        status: "Sent for Review"
    },
    {
        id: 3,
        status: "Review Changes"
    },
    {
        id: 4,
        status: "Sent for Approval"
    },
    {
        id: 5,
        status: "Approval Changes"
    },
    {
        id: 6,
        status: "Approved"
    }
];

export interface WorkflowEntry {
    id: number;
    opportunityId: number;
    formStage: 'opportunityTracking' | 'goNoGo' | 'bidPreparation' | 'bidSubmitted' | 'bidAccepted' | 'bidRejected';
    workflowId: number; // Changed from workflowStatus to workflowId
    createdAt: string;
    updatedAt: string;
}

// Initial dummy data
export const workflowData: WorkflowEntry[] = [
    {
        id: 1,
        opportunityId: 1,
        formStage: 'opportunityTracking',
        workflowId: 1, // Maps to "Initial" status
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        opportunityId: 2,
        formStage: 'opportunityTracking',
        workflowId: 1, // Maps to "Initial" status
        createdAt: '2024-01-16T10:00:00Z',
        updatedAt: '2024-01-16T10:00:00Z'
    },
    {
        id: 3,
        opportunityId: 3,
        formStage: 'opportunityTracking',
        workflowId: 1, // Maps to "Initial" status
        createdAt: '2024-01-17T10:00:00Z',
        updatedAt: '2024-01-17T10:00:00Z'
    },
    {
        id: 4,
        opportunityId: 4,
        formStage: 'opportunityTracking',
        workflowId: 1, // Maps to "Initial" status
        createdAt: '2024-01-18T10:00:00Z',
        updatedAt: '2024-01-18T10:00:00Z'
    }
];

// Utility functions
export const getWorkflowStatusById = (id: number): WorkflowStatus | undefined => {
    return workflowStatuses.find(status => status.id === id);
};

export const getWorkflowStatusByName = (status: string): WorkflowStatus | undefined => {
    return workflowStatuses.find(s => s.status === status);
};

export default workflowData;
