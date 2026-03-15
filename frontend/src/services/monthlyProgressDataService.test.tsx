import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock all upstream dependencies
vi.mock('./jobStartFormApi', () => ({
  getJobStartFormByProjectId: vi.fn(),
}));

vi.mock('../features/wbs/services/wbsApi', () => ({
  WBSStructureAPI: {
    getProjectWBS: vi.fn(),
  },
}));

vi.mock('./projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('./monthlyProgressApi', () => ({
  MonthlyProgressAPI: {
    getManpowerResources: vi.fn(),
    getMonthlyReportByYearMonth: vi.fn(),
  },
}));

vi.mock('../utils/calculations', () => ({
  addCalculation: vi.fn((a: number, b: number) => a + b),
  percentageCalculation: vi.fn((pct: number, value: number) => (pct / 100) * value),
}));

import { getAggregatedMonthlyProgressData, getMonthlyProgressData } from './monthlyProgressDataService';
import { getJobStartFormByProjectId } from './jobStartFormApi';
import { WBSStructureAPI } from '../features/wbs/services/wbsApi';
import { projectApi } from './projectApi';
import { MonthlyProgressAPI } from './monthlyProgressApi';

describe('monthlyProgressDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getAggregatedMonthlyProgressData', () => {
    it('returns default structure when all APIs fail', async () => {
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.financialAndContractDetails).toBeDefined();
      expect(result.actualCost).toBeDefined();
      expect(result.ctcAndEac).toBeDefined();
      expect(result.schedule).toBeDefined();
      expect(result.manpowerPlanning).toBeDefined();
    });

    it('populates financial data from job start form', async () => {
      vi.mocked(getJobStartFormByProjectId).mockResolvedValue([{
        projectFees: 10000,
        serviceTaxPercentage: 18,
        grandTotal: 8000,
        profitPercentage: 25,
      }] as any);
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.financialAndContractDetails?.net).toBe(10000);
      expect(result.financialAndContractDetails?.serviceTax).toBe(18);
      expect(result.budgetTable?.originalBudget?.revenueFee).toBe(10000);
      expect(result.budgetTable?.originalBudget?.cost).toBe(8000);
      expect(result.budgetTable?.originalBudget?.profitPercentage).toBe(25);
    });

    it('populates WBS budget data', async () => {
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockResolvedValue({
        wbsHeaderId: 1,
        tasks: [
          { taskType: 0, totalCost: 5000 },
          { taskType: 1, totalCost: 2000 },
        ],
        workBreakdownStructures: [],
      } as any);
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.financialAndContractDetails?.budgetStaff).toBe(5000);
      expect(result.financialAndContractDetails?.budgetOdcs).toBe(2000);
      expect(result.financialAndContractDetails?.budgetSubTotal).toBe(7000);
    });

    it('populates schedule from project data', async () => {
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockResolvedValue({
        feeType: 'timeAndExpense',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      } as any);
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.schedule?.dateOfIssueWOLOI).toBe('2023-01-01');
      expect(result.schedule?.completionDateAsPerContract).toBe('2023-12-31');
      expect(result.financialAndContractDetails?.contractType).toBe('timeAndExpense');
    });

    it('populates manpower data', async () => {
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockResolvedValue({
        resources: [
          {
            taskTitle: 'Design',
            employeeName: 'John',
            monthlyHours: [],
          },
        ],
      } as any);

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.manpowerPlanning?.manpower).toHaveLength(1);
      expect(result.manpowerPlanning?.manpower[0].workAssignment).toBe('Design');
      expect(result.manpowerPlanning?.manpower[0].assignee).toBe('John');
    });

    it('defaults contractType to lumpsum when project feeType is missing', async () => {
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockResolvedValue({ startDate: null, endDate: null } as any);
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getAggregatedMonthlyProgressData('1');

      expect(result.financialAndContractDetails?.contractType).toBe('lumpsum');
    });
  });

  describe('getMonthlyProgressData', () => {
    it('returns aggregated data when no existing report', async () => {
      vi.mocked(MonthlyProgressAPI.getMonthlyReportByYearMonth).mockRejectedValue(new Error('404'));
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getMonthlyProgressData('1', 2023, 6);
      expect(result).toBeDefined();
      expect(result.financialAndContractDetails).toBeDefined();
    });

    it('merges existing report with aggregated data', async () => {
      // Previous month call
      vi.mocked(MonthlyProgressAPI.getMonthlyReportByYearMonth)
        .mockResolvedValueOnce(null as any) // previous month - no data
        .mockResolvedValueOnce({
          month: 6,
          year: 2023,
          financialAndContractDetails: { net: 5000 },
        } as any);

      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getMonthlyProgressData('1', 2023, 6);
      expect(result).toBeDefined();
    });

    it('includes previous month actual cost as prior cumulative', async () => {
      vi.mocked(MonthlyProgressAPI.getMonthlyReportByYearMonth)
        .mockResolvedValueOnce({
          actualCost: {
            totalCumulativeOdc: 100,
            totalCumulativeStaff: 200,
            totalCumulativeCost: 300,
          },
          currentMonthActions: [{ action: 'Test' }],
        } as any) // previous month
        .mockRejectedValueOnce(new Error('404')); // current month

      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      const result = await getMonthlyProgressData('1', 2023, 6);
      expect(result.actualCost?.priorCumulativeOdc).toBe(100);
      expect(result.actualCost?.priorCumulativeStaff).toBe(200);
      expect(result.lastMonthActions).toEqual([{ action: 'Test' }]);
    });

    it('handles January by wrapping to December of previous year', async () => {
      vi.mocked(MonthlyProgressAPI.getMonthlyReportByYearMonth)
        .mockRejectedValue(new Error('404'));
      vi.mocked(getJobStartFormByProjectId).mockRejectedValue(new Error('fail'));
      vi.mocked(WBSStructureAPI.getProjectWBS).mockRejectedValue(new Error('fail'));
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('fail'));
      vi.mocked(MonthlyProgressAPI.getManpowerResources).mockRejectedValue(new Error('fail'));

      await getMonthlyProgressData('1', 2023, 1);

      // First call should be for December 2022
      expect(MonthlyProgressAPI.getMonthlyReportByYearMonth).toHaveBeenCalledWith('1', 2022, 12);
    });
  });
});
