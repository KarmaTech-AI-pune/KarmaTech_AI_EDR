import { GoNoGoDecision } from '../types';
import { axiosInstance } from './axiosConfig';

export const goNoGoApi = {
  getAll: async (): Promise<GoNoGoDecision[]> => {
    try {
      const response = await axiosInstance.get('GoNoGoDecision');
      return response.data;
    } catch (error) {
      console.error('Error fetching Go/No-Go decisions:', error);
      throw error;
    }
  },

  getById: async (id: number): Promise<GoNoGoDecision> => {
    try {
      const response = await axiosInstance.get(`GoNoGoDecision/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Go/No-Go decision ${id}:`, error);
      throw error;
    }
  },

  getByProjectId: async (projectId: number): Promise<GoNoGoDecision | null> => {
    try {
      const response = await axiosInstance.get(`GoNoGoDecision/project/${projectId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching Go/No-Go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  create: async (projectId: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      const response = await axiosInstance.post(`GoNoGoDecision`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error creating go/no-go decision for project ${projectId}:`, error);
      throw error;
    }
  },

  update: async (id: number, data: GoNoGoDecision): Promise<GoNoGoDecision> => {
    try {
      const response = await axiosInstance.put(`GoNoGoDecision/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const validationErrors = error.response.data.errors;
        console.error('Validation Errors:', validationErrors);
        throw new Error(validationErrors.join(', '));
      }
      console.error(`Error updating go/no-go decision ${id}:`, error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`GoNoGoDecision/${id}`);
    } catch (error) {
      console.error(`Error deleting Go/No-Go decision ${id}:`, error);
      throw error;
    }
  }
};
