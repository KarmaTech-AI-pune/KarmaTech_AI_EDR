export interface WorkflowEntry {
    id: number;
    opportunityId: number;
    formStage: 'opportunityTracking' | 'goNoGo' | 'bidPreparation' | 'bidSubmitted' | 'bidAccepted' | 'bidRejected';
    workflowId: number; // Changed from workflowStatus to workflowId
    createdAt: string;
    updatedAt: string;
}
