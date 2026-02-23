/**
 * Custom hook for cash flow data fetching and management
 * Encapsulates API calls and data state management
 */

import { useState, useCallback } from 'react';
import { CashFlowData } from '../types';
import { CashFlowAPI } from '../services/cashflowApi';
import { PaymentScheduleAPI } from '../services/paymentScheduleApi';

interface UseCashFlowDataProps {
  projectId: string;
}

export const useCashFlowData = ({ projectId }: UseCashFlowDataProps) => {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Transform API rows to MonthlyBudgetData format
  const transformToMonthlyBudget = (apiData: any) => {
    if (!apiData.rows || apiData.rows.length === 0) {
      return {
        projectId: apiData.projectId || '',
        rows: [],
        monthlyBudget: {
          projectName: apiData.projectName || 'Unknown Project',
          months: [],
          summary: apiData.summary || undefined,
        },
      };
    }

    // Transform rows to monthly budget format
    const months = apiData.rows.map((row: any) => ({
      month: row.period, // e.g., "Feb-26"
      totalHours: row.hours || 0,
      purePersonnel: row.personnel || 0,
      totalODCs: row.odc || 0,
      totalProjectCost: row.totalCosts || 0,
      cumulativeMonthlyCosts: row.cumulativeCost || 0,
      revenue: row.revenue || 0,
      cumulativeRevenue: row.cumulativeRevenue || 0,
      cashFlow: row.netCashFlow || 0, // NEW: Cash Flow from API
    }));

    // Add monthlyBudget structure to the data
    return {
      projectId: apiData.projectId || '',
      rows: apiData.rows,
      monthlyBudget: {
        projectName: apiData.projectName || 'Unknown Project',
        months: months,
        summary: apiData.summary ? {
          pureManpowerCost: apiData.summary.pureManpowerCost || 0,
          otherODC: apiData.summary.otherODC || 0,
          total: apiData.summary.total || 0,
          manpowerContingencies: {
            percentage: apiData.summary.manpowerContingencies?.percentage || 0,
            amount: apiData.summary.manpowerContingencies?.amount || 0,
          },
          odcContingencies: {
            percentage: apiData.summary.odcContingencies?.percentage || 0,
            amount: apiData.summary.odcContingencies?.amount || 0,
          },
          subTotal: apiData.summary.subTotal || 0,
          profit: {
            percentage: apiData.summary.profit?.percentage || 0,
            amount: apiData.summary.profit?.amount || 0,
          },
          totalProjectCost: apiData.summary.totalProjectCost || 0,
          gst: {
            percentage: apiData.summary.gst?.percentage || 0,
            amount: apiData.summary.gst?.amount || 0,
          },
          quotedPrice: apiData.summary.quotedPrice || 0,
        } : undefined,
      },
    };
  };

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!projectId) {
      console.warn('useCashFlowData: Cannot fetch - projectId is empty');
      return;
    }

    console.log('useCashFlowData: Starting fetch for projectId:', projectId);
    setLoading(true);
    setError(null);

    try {
      // Fetch cash flow data
      const cashflowResult = await CashFlowAPI.getProjectCashFlow(projectId);
      console.log('useCashFlowData: Raw cashflow API data:', cashflowResult);
      
      // Transform the data to include monthlyBudget structure
      const transformedData = transformToMonthlyBudget(cashflowResult);
      console.log('useCashFlowData: Transformed cashflow data:', transformedData);
      
      // Fetch payment schedule data
      try {
        const paymentScheduleResult = await PaymentScheduleAPI.getPaymentMilestones(projectId);
        console.log('useCashFlowData: Payment schedule data:', paymentScheduleResult);
        
        // Add payment schedule to the data
        transformedData.paymentSchedule = paymentScheduleResult;
      } catch (paymentError) {
        console.error('useCashFlowData: Error fetching payment schedule (non-critical):', paymentError);
        // Don't fail the entire fetch if payment schedule fails
        transformedData.paymentSchedule = {
          milestones: [],
          totalPercentage: 0,
          totalAmountINR: 0,
        };
      }
      
      setData(transformedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cash flow data';
      console.error('useCashFlowData: Error fetching cash flow data:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('useCashFlowData: Fetch completed');
    }
  }, [projectId]);

  // Update data on server
  const updateData = useCallback(
    async (updatedData: CashFlowData) => {
      if (!projectId) return;

      try {
        await CashFlowAPI.updateProjectCashFlow(projectId, updatedData);
        setData(updatedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update cash flow data';
        setError(errorMessage);
        throw err;
      }
    },
    [projectId]
  );

  // Add payment milestone
  const addPaymentMilestone = useCallback(
    async (milestone: Omit<PaymentMilestone, 'id'>) => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      try {
        console.log('useCashFlowData: Adding payment milestone:', milestone);
        
        // Call API to add milestone
        const newMilestone = await PaymentScheduleAPI.addPaymentMilestone(projectId, milestone);
        console.log('useCashFlowData: Milestone added successfully:', newMilestone);
        
        // Refresh data to get updated list
        await fetchData();
        
        return newMilestone;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to add payment milestone';
        console.error('useCashFlowData: Error adding milestone:', err);
        setError(errorMessage);
        throw err;
      }
    },
    [projectId, fetchData]
  );

  return {
    data,
    loading,
    error,
    fetchData,
    updateData,
    addPaymentMilestone,
    setData,
    setError,
  };
};
