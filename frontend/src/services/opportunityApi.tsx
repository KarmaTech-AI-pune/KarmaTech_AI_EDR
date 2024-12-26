import { OpportunityTracking } from '../models';
import { axiosInstance } from './axiosConfig';

// Mapping function to convert backend entity to frontend model
const mapToOpportunityTracking = (backendEntity: any): OpportunityTracking => {
  return {
    id: backendEntity.id,
    projectId: null, // Backend entity doesn't have a projectId, so setting to null
    stage: backendEntity.stage,
    strategicRanking: backendEntity.strategicRanking,
    bidFees: backendEntity.bidFees,
    emd: backendEntity.emd,
    formOfEMD: backendEntity.formOfEMD,
    bidManagerId: parseInt(backendEntity.bidManagerId || '0'),
    reviewManagerId: backendEntity.reviewManagerId ? parseInt(backendEntity.reviewManagerId) : undefined,
    approvalManagerId: backendEntity.approvalManagerId ? parseInt(backendEntity.approvalManagerId) : undefined,
    contactPersonAtClient: backendEntity.contactPersonAtClient,
    dateOfSubmission: backendEntity.dateOfSubmission ? new Date(backendEntity.dateOfSubmission).toISOString().split('T')[0] : undefined,
    percentageChanceOfProjectHappening: backendEntity.percentageChanceOfProjectHappening,
    percentageChanceOfNJSSuccess: backendEntity.percentageChanceOfNJSSuccess,
    likelyCompetition: backendEntity.likelyCompetition,
    grossRevenue: backendEntity.grossRevenue,
    netNJSRevenue: backendEntity.netNJSRevenue,
    followUpComments: backendEntity.followUpComments,
    notes: backendEntity.notes,
    probableQualifyingCriteria: backendEntity.probableQualifyingCriteria,
    operation: backendEntity.operation,
    workName: backendEntity.workName,
    client: backendEntity.client,
    clientSector: backendEntity.clientSector,
    likelyStartDate: new Date(backendEntity.likelyStartDate).toISOString().split('T')[0],
    status: backendEntity.status,
    currency: backendEntity.currency,
    capitalValue: backendEntity.capitalValue,
    durationOfProject: backendEntity.durationOfProject,
    fundingStream: backendEntity.fundingStream,
    contractType: backendEntity.contractType,
    workflowId: 1 // Default workflow ID since it's not in the backend entity
  };
};

export const opportunityApi = {
  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get('opportunitytracking');
      return response.data.map(mapToOpportunityTracking);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  getByUserId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunitytracking/user/${userId}`);
      return response.data.map(mapToOpportunityTracking);
    } catch (error) {
      console.error(`Error fetching opportunities for user ${userId}:`, error);
      throw error;
    }
  },

  getByReviewManagerId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunitytracking/reviewmanager/${userId}`);
      return response.data.map(mapToOpportunityTracking);
    } catch (error) {
      console.error(`Error fetching opportunities for review manager ${userId}:`, error);
      throw error;
    }
  },

  getByApprovalManagerId: async (userId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunitytracking/approvalmanager/${userId}`);
      return response.data.map(mapToOpportunityTracking);
    } catch (error) {
      console.error(`Error fetching opportunities for approval manager ${userId}:`, error);
      throw error;
    }
  },

  getById: async (id: number): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.get(`opportunitytracking/${id}`);
      return mapToOpportunityTracking(response.data);
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunitytracking/project/${projectId}`);
      return response.data.map(mapToOpportunityTracking);
    } catch (error) {
      console.error(`Error fetching opportunities for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (opportunityTracking: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post('opportunitytracking', opportunityTracking);
      return mapToOpportunityTracking(response.data);
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  update: async (opportunityTracking: OpportunityTracking): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.put(`opportunitytracking/${opportunityTracking.id}`, opportunityTracking);
      return mapToOpportunityTracking(response.data);
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`opportunitytracking/${id}`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  }
};
