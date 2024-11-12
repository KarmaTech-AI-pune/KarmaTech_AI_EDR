import { OpportunityTracking } from '../types';
import { axiosInstance } from './axiosConfig';

export const opportunityApi = {
  getByProjectId: async (projectId: number): Promise<OpportunityTracking[]> => {
    try {
      const response = await axiosInstance.get(`opportunity-tracking/project/${projectId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching opportunity tracking for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (data: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.post('opportunity-tracking', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error('Error creating opportunity tracking:', error);
      throw error;
    }
  },

  update: async (id: number, data: Partial<OpportunityTracking>): Promise<OpportunityTracking> => {
    try {
      const response = await axiosInstance.put(`opportunity-tracking/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error updating opportunity tracking ${id}:`, error);
      throw error;
    }
  }
};
