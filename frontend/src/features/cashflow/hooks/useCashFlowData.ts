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

      // Fallback to mock data in case of error
      console.warn('Falling back to mock data');
      setData({
        projectId,
        rows: [
          {
            period: 'Jan-25',
            hours: 135,
            personnel: 47250,
            odc: 285000,
            totalCosts: 332250,
            revenue: 0,
            netCashFlow: -332250,
            status: 'Completed',
          },
          {
            period: 'Feb-25',
            hours: 135,
            personnel: 47250,
            odc: 435000,
            totalCosts: 482250,
            revenue: 643601,
            netCashFlow: 161351,
            status: 'Completed',
          },
          {
            period: 'Mar-25',
            hours: 151,
            personnel: 59250,
            odc: 435000,
            totalCosts: 494250,
            revenue: 643601,
            netCashFlow: -21548,
            status: 'Completed',
          },
          {
            period: 'Apr-25',
            hours: 720,
            personnel: 526000,
            odc: 285000,
            totalCosts: 811000,
            revenue: 1265402,
            netCashFlow: 432854,
            status: 'Completed',
          },
          {
            period: 'May-25',
            hours: 720,
            personnel: 526000,
            odc: 710000,
            totalCosts: 1236000,
            revenue: 0,
            netCashFlow: -803146,
            status: 'Completed',
          },
          {
            period: 'Jun-25',
            hours: 1315,
            personnel: 714250,
            odc: 710000,
            totalCosts: 1424250,
            revenue: 2109003,
            netCashFlow: -1118393,
            status: 'Completed',
          },
          {
            period: 'Jul-25',
            hours: 675,
            personnel: 225250,
            odc: 285000,
            totalCosts: 510250,
            revenue: 2109003,
            netCashFlow: 1480360,
            status: 'Planned',
          },
          {
            period: 'Aug-25',
            hours: 360,
            personnel: 148000,
            odc: 420000,
            totalCosts: 568000,
            revenue: 2109003,
            netCashFlow: 3021363,
            status: 'Planned',
          },
          {
            period: 'Sep-25',
            hours: 370,
            personnel: 218500,
            odc: 285000,
            totalCosts: 503500,
            revenue: 3749248,
            netCashFlow: 6267111,
            status: 'Planned',
          },
        ],
      });
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
