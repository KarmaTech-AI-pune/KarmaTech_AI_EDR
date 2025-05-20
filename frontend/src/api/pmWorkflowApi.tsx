import { axiosInstance } from '../services/axiosConfig';
import { 
    PMWorkflowHistory, 
    PMWorkflowHistoryResponse, 
    SendToReviewRequest, 
    SendToApprovalRequest, 
    RequestChangesRequest, 
    ApproveRequest 
} from '../models/pmWorkflowModel';

export const pmWorkflowApi = {
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
    
    getWorkflowHistory: async (entityType: string, entityId: number): Promise<PMWorkflowHistoryResponse> => {
        const response = await axiosInstance.get(`/api/PMWorkflow/history/${entityType}/${entityId}`);
        return response.data;
    },
    
    canViewEntity: async (entityType: string, entityId: number): Promise<boolean> => {
        const response = await axiosInstance.get(`/api/PMWorkflow/canView/${entityType}/${entityId}`);
        return response.data;
    }
};
