import { axiosInstance } from '../../../services/axiosConfig';
import { CashFlowData, MonthlyBudgetData, PaymentScheduleData, ReportGenerationData } from '../types/cashflow';

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
   * Get monthly budget data for dashboard
   * @param projectId Project ID
   * @returns Promise with monthly budget data
   */
  getMonthlyBudget: async (projectId: string): Promise<MonthlyBudgetData> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/cashflows/monthly-budget`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching monthly budget for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get payment schedule data
   * @param projectId Project ID
   * @returns Promise with payment schedule data
   */
  getPaymentSchedule: async (projectId: string): Promise<PaymentScheduleData> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/cashflows/payment-schedule`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment schedule for project ${projectId}:`, error);
      throw error;
    }
  },

  /**
   * Get report generation options
   * @param projectId Project ID
   * @returns Promise with report generation data
   */
  getReportOptions: async (projectId: string): Promise<ReportGenerationData> => {
    try {
      const response = await axiosInstance.get(`/api/projects/${projectId}/cashflows/report-options`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching report options for project ${projectId}:`, error);
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
