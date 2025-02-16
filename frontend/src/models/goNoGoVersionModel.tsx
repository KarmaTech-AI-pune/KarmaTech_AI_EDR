import { GoNoGoVersionStatus } from './workflowModel';

export interface GoNoGoVersionDto {
    id: number;
    goNoGoDecisionHeaderId: number;
    versionNumber: number;
    formData: any;
    status: GoNoGoVersionStatus;
    createdBy: string;
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
    comments?: string;   
}

export interface CreateGoNoGoVersionDto {
    goNoGoDecisionHeaderId: number;
    versionNumber: number;
    formData: any;
    status: GoNoGoVersionStatus;
    createdBy: string;
    createdAt: string;
    approvedBy?: string;
    approvedAt?: string;
    comments?: string;
    
}

export interface ApproveGoNoGoVersionDto {
    approvedBy: string;
    comments?: string;
}

export interface RejectGoNoGoVersionDto {
    rejectedBy: string;
    rejectionComments: string;
}
