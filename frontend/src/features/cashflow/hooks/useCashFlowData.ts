/**
 * Custom hook for cash flow data fetching and management
 * Encapsulates API calls and data state management
 */

import { useState, useCallback } from 'react';
import { CashFlowData } from '../types';
import { CashFlowAPI } from '../services/cashflowApi';

interface UseCashFlowDataProps {
  projectId: string;
}

export const useCashFlowData = ({ projectId }: UseCashFlowDataProps) => {
  const [data, setData] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Transform API rows to MonthlyBudgetData format
  const transformToMonthlyBudget = (apiData: CashFlowData) => {
    if (!apiData.rows || apiData.rows.length === 0) {
      return apiData;
    }

    // Transform rows to monthly budget format
    const months = apiData.rows.map((row, index) => {
      // Calculate cumulative costs
      const cumulativeCosts = apiData.rows
        .slice(0, index + 1)
        .reduce((sum, r) => sum + r.totalCosts, 0);
      
      // Calculate cumulative revenue
      const cumulativeRevenue = apiData.rows
        .slice(0, index + 1)
        .reduce((sum, r) => sum + r.revenue, 0);

      return {
        month: row.period, // e.g., "Feb-26"
        totalHours: row.hours,
        purePersonnel: row.personnel,
        totalODCs: row.odc,
        totalProjectCost: row.totalCosts,
        cumulativeMonthlyCosts: cumulativeCosts,
        revenue: row.revenue,
        cumulativeRevenue: cumulativeRevenue,
      };
    });

    // Add monthlyBudget structure to the data
    return {
      ...apiData,
      monthlyBudget: {
        projectName: `Project ${apiData.projectId}`, // You can enhance this with actual project name
        months: months,
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
      const result = await CashFlowAPI.getProjectCashFlow(projectId);
      console.log('useCashFlowData: Raw API data:', result);
      
      // Transform the data to include monthlyBudget structure
      const transformedData = transformToMonthlyBudget(result);
      console.log('useCashFlowData: Transformed data:', transformedData);
      
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

  return {
    data,
    loading,
    error,
    fetchData,
    updateData,
    setData,
    setError,
  };
};
