/**
 * Payment Schedule API Service
 * Handles all payment milestone related API calls
 */

import { axiosInstance } from '../../../services/axiosConfig';
import { PaymentScheduleData, PaymentMilestone } from '../types/cashflow';

export const PaymentScheduleAPI = {
  /**
   * Get payment milestones for a project
   */
  getPaymentMilestones: async (projectId: string): Promise<PaymentScheduleData> => {
    console.log('PaymentScheduleAPI: Fetching payment milestones for projectId:', projectId);
    
    try {
      const response = await axiosInstance.get<PaymentScheduleData>(
        `/api/projects/${projectId}/cashflows/payment-milestones`
      );
      
      console.log('PaymentScheduleAPI: Payment milestones fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentScheduleAPI: Error fetching payment milestones:', error);
      throw new Error('Failed to fetch payment milestones');
    }
  },

  /**
   * Add a new payment milestone
   */
  addPaymentMilestone: async (
    projectId: string,
    milestone: Omit<PaymentMilestone, 'id'>
  ): Promise<PaymentMilestone> => {
    console.log('PaymentScheduleAPI: Adding payment milestone for projectId:', projectId, milestone);
    
    try {
      const response = await axiosInstance.post<PaymentMilestone>(
        `/api/projects/${projectId}/cashflows/payment-milestones`,
        milestone
      );
      
      console.log('PaymentScheduleAPI: Payment milestone added successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentScheduleAPI: Error adding payment milestone:', error);
      throw new Error('Failed to add payment milestone');
    }
  },
};
