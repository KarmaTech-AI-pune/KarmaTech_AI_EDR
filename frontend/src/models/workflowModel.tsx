export enum GoNoGoVersionStatus {
    BDM_PENDING = 0,
    BDM_APPROVED = 1,
    RM_PENDING = 2,
    RM_APPROVED = 3,
    RD_PENDING = 4,
    RD_APPROVED = 5,
    COMPLETED = 6
}

export function getStatusesForRole(role: string): GoNoGoVersionStatus {
    switch (role) {
        case 'BDM':
            return GoNoGoVersionStatus.BDM_APPROVED;
        case 'RM': 
        return GoNoGoVersionStatus.RM_PENDING;           
        case 'RD': 
            return GoNoGoVersionStatus.RD_APPROVED; 
        default:
            return GoNoGoVersionStatus.COMPLETED; 
    }
}
export enum WorkflowStatus {
    Initiated = 'Initiated',
    InProgress = 'InProgress',
    UnderReview = 'UnderReview',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Completed = 'Completed'
}

export interface WorkflowStep {
    id: string;
    name: string;
    order: number;
    roles: string[];
    actions: string[];
}

export interface WorkflowTransition {
    id: string;
    fromStep: string;
    toStep: string;
    requiredRole: string;
    conditions?: string[];
}

export interface WorkflowVersion {
    id: string;
    workflowInstanceId: string;
    versionNumber: number;
    data: string;
    createdBy: string;
    createdAt: Date;
    comments: string;
    status: string;
}

export interface WorkflowInstance {
    id: string;
    workflowType: string;
    status: WorkflowStatus;
    currentStepOrder: number;
    currentStep: WorkflowStep;
    steps: WorkflowStep[];
    transitions: WorkflowTransition[];
    versions: WorkflowVersion[];
    createdAt: Date;
    updatedAt: Date;
    entityId: string;
}
