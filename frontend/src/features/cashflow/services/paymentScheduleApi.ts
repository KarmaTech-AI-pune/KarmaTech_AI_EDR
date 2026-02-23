/**
 * Payment Schedule API Service
 * Handles all payment milestone related API calls
 */

import axios from 'axios';
import { PaymentScheduleData, PaymentMilestone } from '../types/cashflow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5245/api';

export const PaymentScheduleAPI = {
  /**
   * Get payment milestones for a project
   */
  getPaymentMilestones: async (projectId: string): Promise<PaymentScheduleData> => {
    console.log('PaymentScheduleAPI: Fetching payment milestones for projectId:', projectId);
    
    try {
      const response = await axios.get<PaymentScheduleData>(
        `${API_BASE_URL}/projects/${projectId}/cashflows/payment-milestones`
      );
      
      console.log('PaymentScheduleAPI: Payment milestones fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('PaymentScheduleAPI: Error fetching payment milestones:', error);
      throw new Error('Failed to fetch payment milestones');
    }
  },

  /**
   * Add a new payment milestone (Future implementation)
   */
  addPaymentMilestone: async (
    projectId: string,
    milestone: Omit<PaymentMilestone, 'id'>
  ): Promise<PaymentMilestone> => {
    console.log('PaymentScheduleAPI: Adding payment milestone for projectId:', projectId, milestone);
    
    try {
      const response = await axios.post<PaymentMilestone>(
        `${API_BASE_URL}/projects/${projectId}/cashflows/payment-milestones`,
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
