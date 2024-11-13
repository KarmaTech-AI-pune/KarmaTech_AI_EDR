import { OpportunityTracking } from '../types';
import { axiosInstance } from './axiosConfig';

export const opportunityApi = {
  getAll: async (): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get('/api/opportunitytracking');
      return response.data;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.get(`/api/opportunitytracking/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`OpportunityTracking/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunities for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (opportunityTracking: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post('/api/opportunitytracking', opportunityTracking);
      return response.data;
    } catch (error) {
      console.error('Error creating opportunity:', error);
      throw error;
    }
  },

  update: async (opportunityTracking: OpportunityTracking): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.put(`/api/opportunitytracking/${opportunityTracking.id}`, opportunityTracking);
      return response.data;
    } catch (error) {
      console.error('Error updating opportunity:', error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/opportunitytracking/${id}`);
    } catch (error) {
      console.error(`Error deleting opportunity ${id}:`, error);
      throw error;
    }
  }
};
