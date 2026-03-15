/**
 * useCashFlowData Hook Tests
 * 
 * Comprehensive test suite for useCashFlowData custom hook
 * Tests: Data fetching, state management, API integration, error handling
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCashFlowData } from '../../../src/features/cashflow/hooks/useCashFlowData';
import { CashFlowAPI } from '../../../src/features/cashflow/services/cashflowApi';
import { PaymentScheduleAPI } from '../../../src/features/cashflow/services/paymentScheduleApi';

// Mock the API modules
vi.mock('../../../src/features/cashflow/services/cashflowApi');
vi.mock('../../../src/features/cashflow/services/paymentScheduleApi');

describe('useCashFlowData Hook', () => {
  const mockProjectId = '123';

  const mockCashflowData = {
    projectId: '123',
    projectName: 'Test Project',
    rows: [
      {
        period: 'Jan-25',
        hours: 160,
        personnel: 50000,
        odc: 10000,
        totalCosts: 60000,
        cumulativeCost: 60000,
        revenue: 70000,
        cumulativeRevenue: 70000,
        netCashFlow: 10000,
      },
    ],
    summary: {
      pureManpowerCost: 50000,
      otherODC: 10000,
      total: 60000,
      manpowerContingencies: { percentage: 10, amount: 5000 },
      odcContingencies: { percentage: 5, amount: 500 },
      subTotal: 65500,
      profit: { percentage: 15, amount: 9825 },
      totalProjectCost: 75325,
      gst: { percentage: 18, amount: 13558.5 },
      quotedPrice: 88883.5,
    },
  };

  const mockPaymentScheduleData = {
    milestones: [
      {
        id: 1,
        description: 'Inception Report',
        percentage: 10,
        amountINR: 50000,
        dueDate: '2025-01-15',
      },
    ],
    totalPercentage: 10,
    totalAmountINR: 50000,
    totalProjectFee: 500000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State Tests', () => {
    it('initializes with null data', () => {
      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));
      
      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('provides all expected functions', () => {
      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));
      
      expect(typeof result.current.fetchData).toBe('function');
      expect(typeof result.current.updateData).toBe('function');
      expect(typeof result.current.addPaymentMilestone).toBe('function');
    });
  });

  describe('fetchData Tests', () => {
    it('fetches cashflow and payment schedule data successfully', async () => {
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(mockCashflowData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).not.toBeNull();
      expect(result.current.data?.projectId).toBe('123');
      expect(result.current.data?.paymentSchedule).toEqual(mockPaymentScheduleData);
      expect(result.current.error).toBeNull();
    });

    it('sets loading state during fetch', async () => {
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockCashflowData), 100))
      );
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('transforms API data to monthlyBudget format', async () => {
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(mockCashflowData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data?.monthlyBudget).toBeDefined();
      });

      expect(result.current.data?.monthlyBudget?.months).toHaveLength(1);
      expect(result.current.data?.monthlyBudget?.months[0]).toEqual({
        month: 'Jan-25',
        totalHours: 160,
        purePersonnel: 50000,
        totalODCs: 10000,
        totalProjectCost: 60000,
        cumulativeMonthlyCosts: 60000,
        revenue: 70000,
        cumulativeRevenue: 70000,
        cashFlow: 10000,
      });
    });

    it('handles empty cashflow data', async () => {
      const emptyData = {
        projectId: '123',
        projectName: 'Test Project',
        rows: [],
      };

      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(emptyData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data?.monthlyBudget?.months).toEqual([]);
      });
    });

    it('handles cashflow API error but still fetches payment schedule', async () => {
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockRejectedValue(new Error('Cashflow API error'));
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data?.paymentSchedule).toEqual(mockPaymentScheduleData);
      expect(result.current.error).toBeNull(); // Error cleared because payment schedule succeeded
    });

    it('handles payment schedule API error gracefully', async () => {
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(mockCashflowData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockRejectedValue(new Error('Payment API error'));

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data?.paymentSchedule).toEqual({
        milestones: [],
        totalPercentage: 0,
        totalAmountINR: 0,
      });
      expect(result.current.error).toBeNull();
    });

    it('handles both APIs failing', async () => {
      const cashflowError = new Error('Cashflow error');
      const paymentError = new Error('Payment error');
      
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockRejectedValue(cashflowError);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockRejectedValue(paymentError);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await waitFor(() => {
        // Check for actual error message from the Error object
        expect(result.current.error).toBe(cashflowError.message);
      });
    });

    it('does not fetch when projectId is empty', async () => {
      const { result } = renderHook(() => useCashFlowData({ projectId: '' }));

      result.current.fetchData();

      await waitFor(() => {
        expect(CashFlowAPI.getProjectCashFlow).not.toHaveBeenCalled();
      });
    });
  });

  describe('updateData Tests', () => {
    it('updates data successfully', async () => {
      vi.mocked(CashFlowAPI.updateProjectCashFlow).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      const updatedData = {
        projectId: '123',
        rows: [],
      };

      await result.current.updateData(updatedData);

      expect(CashFlowAPI.updateProjectCashFlow).toHaveBeenCalledWith(mockProjectId, updatedData);
      
      await waitFor(() => {
        expect(result.current.data).toEqual(updatedData);
      });
    });

    it('handles update error', async () => {
      const updateError = new Error('Update failed');
      vi.mocked(CashFlowAPI.updateProjectCashFlow).mockRejectedValue(updateError);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      const updatedData = {
        projectId: '123',
        rows: [],
      };

      await expect(result.current.updateData(updatedData)).rejects.toThrow();
      
      await waitFor(() => {
        // Check for actual error message from the Error object
        expect(result.current.error).toBe(updateError.message);
      });
    });

    it('does not update when projectId is empty', async () => {
      const { result } = renderHook(() => useCashFlowData({ projectId: '' }));

      const updatedData = {
        projectId: '',
        rows: [],
      };

      await result.current.updateData(updatedData);

      expect(CashFlowAPI.updateProjectCashFlow).not.toHaveBeenCalled();
    });
  });

  describe('addPaymentMilestone Tests', () => {
    it('adds milestone and refreshes payment schedule', async () => {
      const newMilestone = {
        description: 'New Milestone',
        percentage: 20,
        amountINR: 100000,
        dueDate: '2025-12-31',
      };

      const addedMilestone = { id: 2, ...newMilestone };

      const updatedPaymentSchedule = {
        ...mockPaymentScheduleData,
        milestones: [...mockPaymentScheduleData.milestones, addedMilestone],
        totalPercentage: 30,
        totalAmountINR: 150000,
      };

      vi.mocked(PaymentScheduleAPI.addPaymentMilestone).mockResolvedValue(addedMilestone);
      
      // Mock initial fetch and refresh call
      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(mockCashflowData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones)
        .mockResolvedValueOnce(mockPaymentScheduleData)
        .mockResolvedValueOnce(updatedPaymentSchedule);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      // Fetch initial data
      await result.current.fetchData();

      // Wait for initial state to be set
      await waitFor(() => {
        expect(result.current.data?.paymentSchedule?.milestones).toHaveLength(1);
      });

      // Add the milestone
      await result.current.addPaymentMilestone(newMilestone);

      expect(PaymentScheduleAPI.addPaymentMilestone).toHaveBeenCalledWith(mockProjectId, newMilestone);
      expect(PaymentScheduleAPI.getPaymentMilestones).toHaveBeenCalledWith(mockProjectId);
      
      // After refresh, should have the updated payment schedule
      await waitFor(() => {
        expect(result.current.data?.paymentSchedule?.milestones).toHaveLength(2);
        expect(result.current.data?.paymentSchedule?.totalPercentage).toBe(30);
      });
    });

    it('handles add milestone error', async () => {
      const newMilestone = {
        description: 'New Milestone',
        percentage: 20,
        amountINR: 100000,
      };

      const addError = new Error('Add failed');
      vi.mocked(PaymentScheduleAPI.addPaymentMilestone).mockRejectedValue(addError);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      await expect(result.current.addPaymentMilestone(newMilestone)).rejects.toThrow();
      
      await waitFor(() => {
        // Check for actual error message from the Error object
        expect(result.current.error).toBe(addError.message);
      });
    });

    it('throws error when projectId is empty', async () => {
      const { result } = renderHook(() => useCashFlowData({ projectId: '' }));

      const newMilestone = {
        description: 'Test',
        percentage: 10,
        amountINR: 50000,
      };

      await expect(result.current.addPaymentMilestone(newMilestone)).rejects.toThrow('Project ID is required');
    });

    it('continues even if refresh fails after successful add', async () => {
      const newMilestone = {
        description: 'New Milestone',
        percentage: 20,
        amountINR: 100000,
      };

      const addedMilestone = { id: 2, ...newMilestone };

      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(mockCashflowData);
      vi.mocked(PaymentScheduleAPI.addPaymentMilestone).mockResolvedValue(addedMilestone);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones)
        .mockResolvedValueOnce(mockPaymentScheduleData)
        .mockRejectedValueOnce(new Error('Refresh failed'));

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      // Fetch initial data
      await result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data).not.toBeNull();
      });

      const result2 = await result.current.addPaymentMilestone(newMilestone);

      expect(result2).toEqual(addedMilestone);
      // Should not throw error
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined summary in cashflow data', async () => {
      const dataWithoutSummary = {
        ...mockCashflowData,
        summary: undefined,
      };

      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(dataWithoutSummary);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data?.monthlyBudget?.summary).toBeUndefined();
      });
    });

    it('handles missing revenue in rows', async () => {
      const dataWithoutRevenue = {
        ...mockCashflowData,
        rows: [
          {
            period: 'Jan-25',
            hours: 160,
            personnel: 50000,
            odc: 10000,
            totalCosts: 60000,
            cumulativeCost: 60000,
            // revenue missing
            cumulativeRevenue: 0,
            netCashFlow: -60000,
          },
        ],
      };

      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(dataWithoutRevenue);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data?.monthlyBudget?.months[0].revenue).toBe(0);
      });
    });

    it('handles multiple months data', async () => {
      const multiMonthData = {
        ...mockCashflowData,
        rows: [
          mockCashflowData.rows[0],
          {
            period: 'Feb-25',
            hours: 160,
            personnel: 50000,
            odc: 10000,
            totalCosts: 60000,
            cumulativeCost: 120000,
            revenue: 0,
            cumulativeRevenue: 70000,
            netCashFlow: -60000,
          },
        ],
      };

      vi.mocked(CashFlowAPI.getProjectCashFlow).mockResolvedValue(multiMonthData);
      vi.mocked(PaymentScheduleAPI.getPaymentMilestones).mockResolvedValue(mockPaymentScheduleData);

      const { result } = renderHook(() => useCashFlowData({ projectId: mockProjectId }));

      result.current.fetchData();

      await waitFor(() => {
        expect(result.current.data?.monthlyBudget?.months).toHaveLength(2);
      });
    });
  });
});
