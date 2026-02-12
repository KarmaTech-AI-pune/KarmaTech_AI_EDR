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
        // Mock data for new dashboard sections
        monthlyBudget: {
          projectName: 'Ref day',
          months: [
            {
              month: 'Jan-26',
              totalHours: 135,
              purePersonnel: 47250,
              totalODCs: 285000,
              totalProjectCost: 332250,
              cumulativeMonthlyCosts: 332250,
              revenue: 0,
              cumulativeRevenue: 0,
            },
            {
              month: 'Feb-26',
              totalHours: 135,
              purePersonnel: 47250,
              totalODCs: 435000,
              totalProjectCost: 482250,
              cumulativeMonthlyCosts: 814500,
              revenue: 643601,
              cumulativeRevenue: 643601,
            },
            {
              month: 'Mar-26',
              totalHours: 151,
              purePersonnel: 59250,
              totalODCs: 435000,
              totalProjectCost: 494250,
              cumulativeMonthlyCosts: 1308750,
              revenue: 643601,
              cumulativeRevenue: 1287202,
            },
            {
              month: 'Apr-26',
              totalHours: 720,
              purePersonnel: 526000,
              totalODCs: 285000,
              totalProjectCost: 811000,
              cumulativeMonthlyCosts: 2119750,
              revenue: 1265402,
              cumulativeRevenue: 2552604,
            },
            {
              month: 'May-26',
              totalHours: 720,
              purePersonnel: 526000,
              totalODCs: 710000,
              totalProjectCost: 1236000,
              cumulativeMonthlyCosts: 3355750,
              revenue: 0,
              cumulativeRevenue: 2552604,
            },
            {
              month: 'Jun-26',
              totalHours: 1315,
              purePersonnel: 714250,
              totalODCs: 710000,
              totalProjectCost: 1424250,
              cumulativeMonthlyCosts: 4780000,
              revenue: 2109003,
              cumulativeRevenue: 4661607,
            },
            {
              month: 'Jul-26',
              totalHours: 675,
              purePersonnel: 225250,
              totalODCs: 285000,
              totalProjectCost: 510250,
              cumulativeMonthlyCosts: 5290250,
              revenue: 2109003,
              cumulativeRevenue: 6770610,
            },
            {
              month: 'Aug-26',
              totalHours: 360,
              purePersonnel: 148000,
              totalODCs: 420000,
              totalProjectCost: 568000,
              cumulativeMonthlyCosts: 5858250,
              revenue: 2109003,
              cumulativeRevenue: 8879613,
            },
            {
              month: 'Sep-26',
              totalHours: 370,
              purePersonnel: 218500,
              totalODCs: 285000,
              totalProjectCost: 503500,
              cumulativeMonthlyCosts: 6361750,
              revenue: 3749248,
              cumulativeRevenue: 12628861,
            },
            {
              month: 'Oct-26',
              totalHours: 360,
              purePersonnel: 148000,
              totalODCs: 420000,
              totalProjectCost: 568000,
              cumulativeMonthlyCosts: 6929750,
              revenue: 0,
              cumulativeRevenue: 12628861,
            },
            {
              month: 'Nov-26',
              totalHours: 370,
              purePersonnel: 218500,
              totalODCs: 285000,
              totalProjectCost: 503500,
              cumulativeMonthlyCosts: 7433250,
              revenue: 0,
              cumulativeRevenue: 12628861,
            },
            {
              month: 'Dec-26',
              totalHours: 360,
              purePersonnel: 148000,
              totalODCs: 420000,
              totalProjectCost: 568000,
              cumulativeMonthlyCosts: 8001250,
              revenue: 0,
              cumulativeRevenue: 12628861,
            },
          ],
        },
        paymentSchedule: {
          milestones: [
            {
              id: 1,
              description: 'Inception Report',
              percentage: 10,
              amountINR: 1262886,
              dueDate: '2025-02-15',
            },
            {
              id: 2,
              description: 'Feasibility Report',
              percentage: 10,
              amountINR: 1262886,
              dueDate: '2025-03-30',
            },
            {
              id: 3,
              description: 'Preliminary Design Report',
              percentage: 15,
              amountINR: 1894329,
              dueDate: '2025-05-15',
            },
            {
              id: 4,
              description: 'Detailed Design Report',
              percentage: 25,
              amountINR: 3157215,
              dueDate: '2025-07-31',
            },
            {
              id: 5,
              description: 'Tender Document',
              percentage: 20,
              amountINR: 2525772,
              dueDate: '2025-09-30',
            },
            {
              id: 6,
              description: 'Construction Supervision',
              percentage: 20,
              amountINR: 2525772,
              dueDate: '2025-12-31',
            },
          ],
          totalPercentage: 100,
          totalAmountINR: 12628860,
        },
        reportGeneration: {
          reports: [
            { name: 'Inception Report', percentage: 10, selected: false },
            { name: 'Feasibility Report', percentage: 10, selected: false },
            { name: 'Preliminary Design Report', percentage: 15, selected: false },
            { name: 'Detailed Design Report', percentage: 25, selected: false },
            { name: 'Tender Document', percentage: 20, selected: false },
            { name: 'Construction Supervision', percentage: 20, selected: false },
          ],
        },
        budgetSummary: {
          totalBudget: 8001250,
          totalRevenue: 12628861,
          gst: 2271195,
          quotedPrice: 14900056,
        },
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
