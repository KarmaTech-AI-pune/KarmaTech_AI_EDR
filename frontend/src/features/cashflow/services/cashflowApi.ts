import { axiosInstance } from '../../../services/axiosConfig';
import { CashFlowData } from '../types/cashflow';

export const CashFlowAPI = {
  /**
   * Get cashflow data for a project
   * @param projectId Project ID
   * @returns Promise with cashflow data
   */
  getProjectCashFlow: async (projectId: string): Promise<CashFlowData> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/cashflow`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching cashflow for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Update cashflow data for a project
   * @param projectId Project ID
   * @param data Cashflow data to update
   * @returns Promise
   */
  updateProjectCashFlow: async (projectId: string, data: CashFlowData): Promise<void> => {
    try {
      await axiosInstance.put(`/api/projects/${projectId}/cashflow`, data);
    } catch (error) {
      console.error(`Error updating cashflow for project ${projectId}:`, error);
      throw error;
    }
  }
};
