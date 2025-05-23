export enum PMWorkflowStatus {
    Initial = 1,
    SentForReview = 2,
    ReviewChanges = 3,
    SentForApproval = 4,
    ApprovalChanges = 5,
    Approved = 6
}

export interface PMWorkflowHistory {
    id: number;
    entityId: number;
    entityType: string;
    statusId: number;
    status: string;
    action: string;
    comments: string;
    actionBy: string;
    actionByName: string;
    assignedToId: string;
    assignedToName: string;
    actionDate: string;
}

export interface PMWorkflowHistoryResponse {
    entityId: number;
    entityType: string;
    currentStatusId: number;
    currentStatus: string;
    history: PMWorkflowHistory[];
}

export interface SendToReviewRequest {
    entityId: number;
    entityType: string;
    assignedToId: string;
    action: string;
    comments: string;
}

export interface SendToApprovalRequest {
    entityId: number;
    entityType: string;
    assignedToId: string;
    comments: string;
}

export interface RequestChangesRequest {
    entityId: number;
    entityType: string;
    comments: string;
    isApprovalChanges: boolean;
    assignedToId?: string; // Optional assignedToId for specifying who to assign to
}

export interface ApproveRequest {
    entityId: number;
    entityType: string;
    comments: string;
}
