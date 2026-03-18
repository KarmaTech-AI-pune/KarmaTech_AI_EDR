import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CashFlowAPI } from '../../../src/features/cashflow/services/cashflowApi';
import { axiosInstance } from '../../../src/services/axiosConfig';
import { CashFlowData, MonthlyBudgetData, PaymentScheduleData, ReportGenerationData } from '../../../src/features/cashflow/types/cashflow';

// Mock axiosInstance
vi.mock('../../../src/services/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe('CashFlowAPI Service', () => {
  const mockProjectId = 'project-123';
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getProjectCashFlow', () => {
    const mockCashFlowData: CashFlowData = {
      projectId: mockProjectId,
      rows: [
        {
          period: 'Jan-25',
          hours: 160,
          personnel: 50000,
          odc: 10000,
          totalCosts: 60000,
          revenue: 80000,
          netCashFlow: 20000,
          status: 'Completed',
        },
      ],
      totals: {
        hours: 160,
        personnel: 50000,
        odc: 10000,
        totalCosts: 60000,
        revenue: 80000,
        netCashFlow: 20000,
      },
    };

    it('successfully fetches cashflow data', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockCashFlowData });

      const result = await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows`);
      expect(result).toEqual(mockCashFlowData);
    });

    it('logs the fetch request', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockCashFlowData });

      await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(console.log).toHaveBeenCalledWith('CashFlowAPI: Fetching cashflow for projectId:', mockProjectId);
      expect(console.log).toHaveBeenCalledWith('CashFlowAPI: Request URL:', `/api/projects/${mockProjectId}/cashflows`);
    });

    it('logs successful fetch', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockCashFlowData });

      await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(console.log).toHaveBeenCalledWith('CashFlowAPI: Response received:', mockCashFlowData);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      await expect(CashFlowAPI.getProjectCashFlow(mockProjectId)).rejects.toThrow('Network error');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      try {
        await CashFlowAPI.getProjectCashFlow(mockProjectId);
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(
          `CashFlowAPI: Error fetching cashflow for project ${mockProjectId}:`,
          mockError
        );
      }
    });

    it('handles empty rows array', async () => {
      const emptyData: CashFlowData = {
        projectId: mockProjectId,
        rows: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: emptyData });

      const result = await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(result.rows).toEqual([]);
    });

    it('handles cashflow data with optional fields', async () => {
      const dataWithOptionals: CashFlowData = {
        projectId: mockProjectId,
        rows: [],
        monthlyBudget: {
          projectName: 'Test Project',
          months: [],
        },
        paymentSchedule: {
          milestones: [],
          totalPercentage: 0,
          totalAmountINR: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: dataWithOptionals });

      const result = await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(result.monthlyBudget).toBeDefined();
      expect(result.paymentSchedule).toBeDefined();
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockCashFlowData });

      await CashFlowAPI.getProjectCashFlow(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows`);
    });
  });

  describe('getMonthlyBudget', () => {
    const mockMonthlyBudgetData: MonthlyBudgetData = {
      projectName: 'Test Project',
      months: [
        {
          month: 'Jan-25',
          totalHours: 160,
          purePersonnel: 50000,
          totalODCs: 10000,
          totalProjectCost: 60000,
          cumulativeMonthlyCosts: 60000,
          revenue: 80000,
          cumulativeRevenue: 80000,
          cashFlow: 20000,
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

    it('successfully fetches monthly budget data', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockMonthlyBudgetData });

      const result = await CashFlowAPI.getMonthlyBudget(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/monthly-budget`);
      expect(result).toEqual(mockMonthlyBudgetData);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      await expect(CashFlowAPI.getMonthlyBudget(mockProjectId)).rejects.toThrow('Network error');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      try {
        await CashFlowAPI.getMonthlyBudget(mockProjectId);
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(
          `Error fetching monthly budget for project ${mockProjectId}:`,
          mockError
        );
      }
    });

    it('handles monthly budget without summary', async () => {
      const dataWithoutSummary: MonthlyBudgetData = {
        projectName: 'Test Project',
        months: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: dataWithoutSummary });

      const result = await CashFlowAPI.getMonthlyBudget(mockProjectId);

      expect(result.summary).toBeUndefined();
    });

    it('handles empty months array', async () => {
      const emptyData: MonthlyBudgetData = {
        projectName: 'Test Project',
        months: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: emptyData });

      const result = await CashFlowAPI.getMonthlyBudget(mockProjectId);

      expect(result.months).toEqual([]);
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockMonthlyBudgetData });

      await CashFlowAPI.getMonthlyBudget(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/monthly-budget`);
    });
  });

  describe('getPaymentSchedule', () => {
    const mockPaymentScheduleData: PaymentScheduleData = {
      milestones: [
        {
          id: 1,
          description: 'Initial Payment',
          percentage: 30,
          amountINR: 30000,
          dueDate: '2025-01-15',
        },
        {
          id: 2,
          description: 'Mid-project Payment',
          percentage: 40,
          amountINR: 40000,
          dueDate: '2025-02-15',
        },
      ],
      totalPercentage: 70,
      totalAmountINR: 70000,
      totalProjectFee: 100000,
    };

    it('successfully fetches payment schedule data', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockPaymentScheduleData });

      const result = await CashFlowAPI.getPaymentSchedule(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/payment-schedule`);
      expect(result).toEqual(mockPaymentScheduleData);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      await expect(CashFlowAPI.getPaymentSchedule(mockProjectId)).rejects.toThrow('Network error');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      try {
        await CashFlowAPI.getPaymentSchedule(mockProjectId);
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(
          `Error fetching payment schedule for project ${mockProjectId}:`,
          mockError
        );
      }
    });

    it('handles empty milestones array', async () => {
      const emptyData: PaymentScheduleData = {
        milestones: [],
        totalPercentage: 0,
        totalAmountINR: 0,
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: emptyData });

      const result = await CashFlowAPI.getPaymentSchedule(mockProjectId);

      expect(result.milestones).toEqual([]);
    });

    it('handles milestones without due dates', async () => {
      const dataWithoutDates: PaymentScheduleData = {
        milestones: [
          {
            id: 1,
            description: 'Payment',
            percentage: 100,
            amountINR: 100000,
          },
        ],
        totalPercentage: 100,
        totalAmountINR: 100000,
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: dataWithoutDates });

      const result = await CashFlowAPI.getPaymentSchedule(mockProjectId);

      expect(result.milestones[0].dueDate).toBeUndefined();
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockPaymentScheduleData });

      await CashFlowAPI.getPaymentSchedule(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/payment-schedule`);
    });
  });

  describe('getReportOptions', () => {
    const mockReportData: ReportGenerationData = {
      reports: [
        { name: 'Monthly Budget', percentage: 100, selected: true },
        { name: 'Payment Schedule', percentage: 100, selected: false },
      ],
    };

    it('successfully fetches report options', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockReportData });

      const result = await CashFlowAPI.getReportOptions(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/report-options`);
      expect(result).toEqual(mockReportData);
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      await expect(CashFlowAPI.getReportOptions(mockProjectId)).rejects.toThrow('Network error');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValue(mockError);

      try {
        await CashFlowAPI.getReportOptions(mockProjectId);
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(
          `Error fetching report options for project ${mockProjectId}:`,
          mockError
        );
      }
    });

    it('handles empty reports array', async () => {
      const emptyData: ReportGenerationData = {
        reports: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: emptyData });

      const result = await CashFlowAPI.getReportOptions(mockProjectId);

      expect(result.reports).toEqual([]);
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockReportData });

      await CashFlowAPI.getReportOptions(mockProjectId);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${mockProjectId}/cashflows/report-options`);
    });
  });

  describe('updateProjectCashFlow', () => {
    const mockUpdateData: CashFlowData = {
      projectId: mockProjectId,
      rows: [
        {
          period: 'Jan-25',
          hours: 160,
          personnel: 50000,
          odc: 10000,
          totalCosts: 60000,
          revenue: 80000,
          netCashFlow: 20000,
          status: 'Completed',
        },
      ],
    };

    it('successfully updates cashflow data', async () => {
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: {} });

      await CashFlowAPI.updateProjectCashFlow(mockProjectId, mockUpdateData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows`,
        mockUpdateData
      );
    });

    it('throws error when API call fails', async () => {
      const mockError = new Error('Update failed');
      vi.mocked(axiosInstance.put).mockRejectedValue(mockError);

      await expect(CashFlowAPI.updateProjectCashFlow(mockProjectId, mockUpdateData)).rejects.toThrow('Update failed');
    });

    it('logs error when API call fails', async () => {
      const mockError = new Error('Update failed');
      vi.mocked(axiosInstance.put).mockRejectedValue(mockError);

      try {
        await CashFlowAPI.updateProjectCashFlow(mockProjectId, mockUpdateData);
      } catch (error) {
        expect(console.error).toHaveBeenCalledWith(
          `Error updating cashflow for project ${mockProjectId}:`,
          mockError
        );
      }
    });

    it('handles update with empty rows', async () => {
      const emptyData: CashFlowData = {
        projectId: mockProjectId,
        rows: [],
      };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: {} });

      await CashFlowAPI.updateProjectCashFlow(mockProjectId, emptyData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows`,
        emptyData
      );
    });

    it('handles update with all optional fields', async () => {
      const fullData: CashFlowData = {
        projectId: mockProjectId,
        rows: [],
        totals: {
          hours: 0,
          personnel: 0,
          odc: 0,
          totalCosts: 0,
          revenue: 0,
          netCashFlow: 0,
        },
        monthlyBudget: {
          projectName: 'Test',
          months: [],
        },
        paymentSchedule: {
          milestones: [],
          totalPercentage: 0,
          totalAmountINR: 0,
        },
      };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: {} });

      await CashFlowAPI.updateProjectCashFlow(mockProjectId, fullData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows`,
        fullData
      );
    });

    it('calls correct API endpoint', async () => {
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: {} });

      await CashFlowAPI.updateProjectCashFlow(mockProjectId, mockUpdateData);

      expect(axiosInstance.put).toHaveBeenCalledTimes(1);
      expect(axiosInstance.put).toHaveBeenCalledWith(
        `/api/projects/${mockProjectId}/cashflows`,
        mockUpdateData
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles very long project IDs', async () => {
      const longProjectId = 'a'.repeat(1000);
      const mockData: CashFlowData = { projectId: longProjectId, rows: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await CashFlowAPI.getProjectCashFlow(longProjectId);

      expect(result.projectId).toBe(longProjectId);
    });

    it('handles special characters in project ID', async () => {
      const specialProjectId = 'project-123!@#$%';
      const mockData: CashFlowData = { projectId: specialProjectId, rows: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await CashFlowAPI.getProjectCashFlow(specialProjectId);

      expect(axiosInstance.get).toHaveBeenCalledWith(`/api/projects/${specialProjectId}/cashflows`);
    });

    it('handles numeric project IDs', async () => {
      const numericProjectId = '12345';
      const mockData: CashFlowData = { projectId: numericProjectId, rows: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockData });

      const result = await CashFlowAPI.getProjectCashFlow(numericProjectId);

      expect(result.projectId).toBe(numericProjectId);
    });
  });

  describe('Error Scenarios', () => {
    it('handles network timeout', async () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      vi.mocked(axiosInstance.get).mockRejectedValue(timeoutError);

      await expect(CashFlowAPI.getProjectCashFlow(mockProjectId)).rejects.toThrow('timeout');
    });

    it('handles 404 error', async () => {
      const notFoundError = { response: { status: 404, data: { message: 'Project not found' } } };
      vi.mocked(axiosInstance.get).mockRejectedValue(notFoundError);

      await expect(CashFlowAPI.getProjectCashFlow(mockProjectId)).rejects.toEqual(notFoundError);
    });

    it('handles 500 server error', async () => {
      const serverError = { response: { status: 500, data: { message: 'Internal server error' } } };
      vi.mocked(axiosInstance.get).mockRejectedValue(serverError);

      await expect(CashFlowAPI.getProjectCashFlow(mockProjectId)).rejects.toEqual(serverError);
    });

    it('handles validation error from server', async () => {
      const validationError = { response: { status: 400, data: { message: 'Invalid project ID' } } };
      vi.mocked(axiosInstance.put).mockRejectedValue(validationError);

      const mockData: CashFlowData = { projectId: mockProjectId, rows: [] };
      await expect(CashFlowAPI.updateProjectCashFlow(mockProjectId, mockData)).rejects.toEqual(validationError);
    });

    it('handles unauthorized error', async () => {
      const unauthorizedError = { response: { status: 401, data: { message: 'Unauthorized' } } };
      vi.mocked(axiosInstance.get).mockRejectedValue(unauthorizedError);

      await expect(CashFlowAPI.getProjectCashFlow(mockProjectId)).rejects.toEqual(unauthorizedError);
    });
  });
});
