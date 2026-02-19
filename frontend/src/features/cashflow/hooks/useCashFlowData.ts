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

  // Fetch data from API
  const fetchData = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await CashFlowAPI.getProjectCashFlow(projectId);
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cash flow data';
      setError(errorMessage);
      console.error('Error fetching cash flow data:', err);
    } finally {
      setLoading(false);
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
