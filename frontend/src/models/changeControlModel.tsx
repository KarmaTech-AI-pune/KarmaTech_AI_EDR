export interface ChangeControl {
    id: number;
    projectId: number;
    srNo: number;
    dateLogged: string;
    originator: string;
    description: string;
    costImpact: string;
    timeImpact: string;
    resourcesImpact: string;
    qualityImpact: string;
    changeOrderStatus: string;
    clientApprovalStatus: string;
    claimSituation: string;
    workflowStatusId?: number;
    reviewManagerId?: string;
    approvalManagerId?: string;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
    workflowHistory?: WorkflowHistory;
}

export interface WorkflowHistory {
    id: number;
    changeControlId: number;
    actionDate: Date;
    comments: string;
    statusId: number;
    action: string;
    actionBy: string;
    assignedToId: string;
}
