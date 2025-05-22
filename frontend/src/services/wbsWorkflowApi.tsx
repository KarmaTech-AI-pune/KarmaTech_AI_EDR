import { axiosInstance } from './axiosConfig';
import { PMWorkflowHistory } from '../models';

export interface SendToReviewRequest {
  entityId: number;
  entityType: string;
  assignedToId: string;
  comments?: string;
  action: string;
}

export interface SendToApprovalRequest {
  entityId: number;
  entityType: string;
  assignedToId: string;
  comments?: string;
  action: string;
}

export interface RequestChangesRequest {
  entityId: number;
  entityType: string;
  assignedToId: string;
  comments: string;
  action: string;
  isApprovalChanges?: boolean;
}

export interface ApproveRequest {
  entityId: number;
  entityType: string;
  assignedToId?: string;
  comments?: string;
  action: string;
}

export const wbsWorkflowApi = {
  sendToReview: async (request: SendToReviewRequest): Promise<PMWorkflowHistory> => {
    const response = await axiosInstance.post('/api/PMWorkflow/sendToReview', request);
    return response.data;
  },
  
  sendToApproval: async (request: SendToApprovalRequest): Promise<PMWorkflowHistory> => {
    const response = await axiosInstance.post('/api/PMWorkflow/sendToApproval', request);
    return response.data;
  },
  
  requestChanges: async (request: RequestChangesRequest): Promise<PMWorkflowHistory> => {
    const response = await axiosInstance.post('/api/PMWorkflow/requestChanges', request);
    return response.data;
  },
  
  approve: async (request: ApproveRequest): Promise<PMWorkflowHistory> => {
    const response = await axiosInstance.post('/api/PMWorkflow/approve', request);
    return response.data;
  },
  
  getWorkflowHistory: async (entityType: string, entityId: number): Promise<PMWorkflowHistory[]> => {
    const response = await axiosInstance.get(`/api/PMWorkflow/history/${entityType}/${entityId}`);
    return response.data;
  },
  
  canView: async (entityType: string, entityId: number): Promise<boolean> => {
    const response = await axiosInstance.get(`/api/PMWorkflow/canView/${entityType}/${entityId}`);
    return response.data;
  }
};
