import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCashFlowCalculations } from '../../../src/features/cashflow/hooks/useCashFlowCalculations';
import { CashFlowData, CashFlowRow, ViewMode } from '../../../src/features/cashflow/types/cashflow';

describe('useCashFlowCalculations Hook', () => {
  const mockRows: CashFlowRow[] = [
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
    {
      period: 'Feb-25',
      hours: 160,
      personnel: 50000,
      odc: 10000,
      totalCosts: 60000,
      revenue: 80000,
      netCashFlow: 20000,
      status: 'Completed',
    },
    {
      period: 'Mar-25',
      hours: 160,
      personnel: 50000,
      odc: 10000,
      totalCosts: 60000,
      revenue: 80000,
      netCashFlow: 20000,
      status: 'Planned',
    },
  ];

  const mockData: CashFlowData = {
    projectId: 'project-123',
    rows: mockRows,
  };

  describe('Totals Calculation', () => {
    it('calculates totals correctly for filtered rows', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.totals).not.toBeNull();
      expect(result.current.totals?.hours).toBe(480);
      expect(result.current.totals?.personnel).toBe(150000);
      expect(result.current.totals?.odc).toBe(30000);
      expect(result.current.totals?.totalCosts).toBe(180000);
      expect(result.current.totals?.revenue).toBe(240000);
      expect(result.current.totals?.netCashFlow).toBe(60000);
    });

    it('returns null totals for empty filtered rows', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: [],
        })
      );

      expect(result.current.totals).toBeNull();
    });

    it('calculates totals for single row', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: [mockRows[0]],
        })
      );

      expect(result.current.totals).not.toBeNull();
      expect(result.current.totals?.hours).toBe(160);
      expect(result.current.totals?.revenue).toBe(80000);
    });

    it('recalculates totals when filtered rows change', () => {
      const { result, rerender } = renderHook(
        ({ filteredRows }) =>
          useCashFlowCalculations({
            data: mockData,
            viewMode: 'Monthly',
            filteredRows,
          }),
        {
          initialProps: { filteredRows: [mockRows[0]] },
        }
      );

      expect(result.current.totals?.revenue).toBe(80000);

      rerender({ filteredRows: mockRows });

      expect(result.current.totals?.revenue).toBe(240000);
    });

    it('handles negative values in totals', () => {
      const negativeRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: -10000 },
      ];

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: negativeRows,
        })
      );

      expect(result.current.totals?.netCashFlow).toBe(-10000);
    });
  });

  describe('Metrics Calculation', () => {
    it('calculates metrics correctly from data', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.metrics.totalRevenue).toBe(240000);
      expect(result.current.metrics.totalCosts).toBe(180000);
      expect(result.current.metrics.netTotal).toBe(60000);
      expect(result.current.metrics.completedCount).toBe(2);
      expect(result.current.metrics.plannedCount).toBe(1);
    });

    it('returns zero metrics for null data', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: null,
          viewMode: 'Monthly',
          filteredRows: [],
        })
      );

      expect(result.current.metrics.totalRevenue).toBe(0);
      expect(result.current.metrics.totalCosts).toBe(0);
      expect(result.current.metrics.netTotal).toBe(0);
      expect(result.current.metrics.completedCount).toBe(0);
      expect(result.current.metrics.plannedCount).toBe(0);
    });

    it('returns zero metrics for empty data rows', () => {
      const emptyData: CashFlowData = {
        projectId: 'project-123',
        rows: [],
      };

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: emptyData,
          viewMode: 'Monthly',
          filteredRows: [],
        })
      );

      expect(result.current.metrics.totalRevenue).toBe(0);
      expect(result.current.metrics.completedCount).toBe(0);
    });

    it('recalculates metrics when data changes', () => {
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCashFlowCalculations({
            data,
            viewMode: 'Monthly',
            filteredRows: mockRows,
          }),
        {
          initialProps: { data: mockData },
        }
      );

      expect(result.current.metrics.totalRevenue).toBe(240000);

      const newData: CashFlowData = {
        projectId: 'project-123',
        rows: [mockRows[0]],
      };

      rerender({ data: newData });

      expect(result.current.metrics.totalRevenue).toBe(80000);
    });

    it('handles all completed rows', () => {
      const completedData: CashFlowData = {
        projectId: 'project-123',
        rows: mockRows.map(row => ({ ...row, status: 'Completed' as const })),
      };

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: completedData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.metrics.completedCount).toBe(3);
      expect(result.current.metrics.plannedCount).toBe(0);
    });

    it('handles all planned rows', () => {
      const plannedData: CashFlowData = {
        projectId: 'project-123',
        rows: mockRows.map(row => ({ ...row, status: 'Planned' as const })),
      };

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: plannedData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.metrics.completedCount).toBe(0);
      expect(result.current.metrics.plannedCount).toBe(3);
    });
  });

  describe('Display Rows - Monthly View', () => {
    it('returns filtered rows as-is for Monthly view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows).toEqual(mockRows);
      expect(result.current.displayRows).toHaveLength(3);
    });

    it('preserves row data in Monthly view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].period).toBe('Jan-25');
      expect(result.current.displayRows[0].netCashFlow).toBe(20000);
    });

    it('returns empty array for empty filtered rows in Monthly view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: [],
        })
      );

      expect(result.current.displayRows).toEqual([]);
    });
  });

  describe('Display Rows - Cumulative View', () => {
    it('calculates cumulative values for Cumulative view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows).toHaveLength(3);
      expect(result.current.displayRows[0].netCashFlow).toBe(20000);
      expect(result.current.displayRows[1].netCashFlow).toBe(40000);
      expect(result.current.displayRows[2].netCashFlow).toBe(60000);
    });

    it('calculates cumulative revenue correctly', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].revenue).toBe(80000);
      expect(result.current.displayRows[1].revenue).toBe(160000);
      expect(result.current.displayRows[2].revenue).toBe(240000);
    });

    it('calculates cumulative costs correctly', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].totalCosts).toBe(60000);
      expect(result.current.displayRows[1].totalCosts).toBe(120000);
      expect(result.current.displayRows[2].totalCosts).toBe(180000);
    });

    it('calculates cumulative hours correctly', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].hours).toBe(160);
      expect(result.current.displayRows[1].hours).toBe(320);
      expect(result.current.displayRows[2].hours).toBe(480);
    });

    it('preserves non-cumulative properties in Cumulative view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].period).toBe('Jan-25');
      expect(result.current.displayRows[0].personnel).toBe(50000);
      expect(result.current.displayRows[0].status).toBe('Completed');
    });

    it('handles negative cash flow in Cumulative view', () => {
      const negativeRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: -10000 },
        { ...mockRows[1], netCashFlow: -5000 },
      ];

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: negativeRows,
        })
      );

      expect(result.current.displayRows[0].netCashFlow).toBe(-10000);
      expect(result.current.displayRows[1].netCashFlow).toBe(-15000);
    });

    it('returns empty array for empty filtered rows in Cumulative view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: [],
        })
      );

      expect(result.current.displayRows).toEqual([]);
    });
  });

  describe('Display Rows - Milestones View', () => {
    it('returns filtered rows as-is for Milestones view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Milestones',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows).toEqual(mockRows);
      expect(result.current.displayRows).toHaveLength(3);
    });

    it('preserves row data in Milestones view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Milestones',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows[0].period).toBe('Jan-25');
      expect(result.current.displayRows[0].netCashFlow).toBe(20000);
    });
  });

  describe('Display Rows - BudgetDashboard View', () => {
    it('returns filtered rows as-is for BudgetDashboard view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'BudgetDashboard',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows).toEqual(mockRows);
    });
  });

  describe('Display Rows - PaymentSchedule View', () => {
    it('returns filtered rows as-is for PaymentSchedule view', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'PaymentSchedule',
          filteredRows: mockRows,
        })
      );

      expect(result.current.displayRows).toEqual(mockRows);
    });
  });

  describe('View Mode Changes', () => {
    it('updates display rows when view mode changes from Monthly to Cumulative', () => {
      const { result, rerender } = renderHook(
        ({ viewMode }) =>
          useCashFlowCalculations({
            data: mockData,
            viewMode,
            filteredRows: mockRows,
          }),
        {
          initialProps: { viewMode: 'Monthly' as ViewMode },
        }
      );

      expect(result.current.displayRows[0].netCashFlow).toBe(20000);

      rerender({ viewMode: 'Cumulative' as ViewMode });

      expect(result.current.displayRows[0].netCashFlow).toBe(20000);
      expect(result.current.displayRows[1].netCashFlow).toBe(40000);
    });

    it('updates display rows when view mode changes from Cumulative to Monthly', () => {
      const { result, rerender } = renderHook(
        ({ viewMode }) =>
          useCashFlowCalculations({
            data: mockData,
            viewMode,
            filteredRows: mockRows,
          }),
        {
          initialProps: { viewMode: 'Cumulative' as ViewMode },
        }
      );

      expect(result.current.displayRows[1].netCashFlow).toBe(40000);

      rerender({ viewMode: 'Monthly' as ViewMode });

      expect(result.current.displayRows[1].netCashFlow).toBe(20000);
    });

    it('handles view mode changes with empty filtered rows', () => {
      const { result, rerender } = renderHook(
        ({ viewMode }) =>
          useCashFlowCalculations({
            data: mockData,
            viewMode,
            filteredRows: [],
          }),
        {
          initialProps: { viewMode: 'Monthly' as ViewMode },
        }
      );

      expect(result.current.displayRows).toEqual([]);

      rerender({ viewMode: 'Cumulative' as ViewMode });

      expect(result.current.displayRows).toEqual([]);
    });
  });

  describe('Memoization', () => {
    it('memoizes totals when filtered rows do not change', () => {
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCashFlowCalculations({
            data,
            viewMode: 'Monthly',
            filteredRows: mockRows,
          }),
        {
          initialProps: { data: mockData },
        }
      );

      const firstTotals = result.current.totals;

      rerender({ data: mockData });

      expect(result.current.totals).toBe(firstTotals);
    });

    it('memoizes metrics when data does not change', () => {
      const { result, rerender } = renderHook(
        ({ viewMode }) =>
          useCashFlowCalculations({
            data: mockData,
            viewMode,
            filteredRows: mockRows,
          }),
        {
          initialProps: { viewMode: 'Monthly' as ViewMode },
        }
      );

      const firstMetrics = result.current.metrics;

      rerender({ viewMode: 'Cumulative' as ViewMode });

      expect(result.current.metrics).toBe(firstMetrics);
    });

    it('memoizes display rows when filtered rows and view mode do not change', () => {
      const { result, rerender } = renderHook(
        ({ data }) =>
          useCashFlowCalculations({
            data,
            viewMode: 'Monthly',
            filteredRows: mockRows,
          }),
        {
          initialProps: { data: mockData },
        }
      );

      const firstDisplayRows = result.current.displayRows;

      rerender({ data: mockData });

      expect(result.current.displayRows).toBe(firstDisplayRows);
    });
  });

  describe('Edge Cases', () => {
    it('handles single row in all view modes', () => {
      const singleRow = [mockRows[0]];

      const monthlyResult = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: singleRow,
        })
      );

      const cumulativeResult = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: singleRow,
        })
      );

      expect(monthlyResult.result.current.displayRows).toHaveLength(1);
      expect(cumulativeResult.result.current.displayRows).toHaveLength(1);
      expect(monthlyResult.result.current.displayRows[0].netCashFlow).toBe(20000);
      expect(cumulativeResult.result.current.displayRows[0].netCashFlow).toBe(20000);
    });

    it('handles large datasets efficiently', () => {
      const largeDataset: CashFlowRow[] = Array.from({ length: 1000 }, (_, i) => ({
        period: `Month-${i}`,
        hours: 160,
        personnel: 50000,
        odc: 10000,
        totalCosts: 60000,
        revenue: 80000,
        netCashFlow: 20000,
        status: 'Completed' as const,
      }));

      const largeData: CashFlowData = {
        projectId: 'project-123',
        rows: largeDataset,
      };

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: largeData,
          viewMode: 'Cumulative',
          filteredRows: largeDataset,
        })
      );

      expect(result.current.displayRows).toHaveLength(1000);
      expect(result.current.displayRows[999].netCashFlow).toBe(20000000);
    });

    it('handles mixed positive and negative cash flows', () => {
      const mixedRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: 20000 },
        { ...mockRows[1], netCashFlow: -10000 },
        { ...mockRows[2], netCashFlow: 15000 },
      ];

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mixedRows,
        })
      );

      expect(result.current.displayRows[0].netCashFlow).toBe(20000);
      expect(result.current.displayRows[1].netCashFlow).toBe(10000);
      expect(result.current.displayRows[2].netCashFlow).toBe(25000);
    });

    it('handles zero values correctly', () => {
      const zeroRows: CashFlowRow[] = [
        {
          period: 'Jan-25',
          hours: 0,
          personnel: 0,
          odc: 0,
          totalCosts: 0,
          revenue: 0,
          netCashFlow: 0,
          status: 'Completed',
        },
      ];

      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: zeroRows,
        })
      );

      expect(result.current.totals?.netCashFlow).toBe(0);
      expect(result.current.displayRows[0].netCashFlow).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('provides consistent data across all return values', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Monthly',
          filteredRows: mockRows,
        })
      );

      // Totals should match filtered rows
      expect(result.current.totals?.revenue).toBe(240000);
      
      // Metrics should match original data
      expect(result.current.metrics.totalRevenue).toBe(240000);
      
      // Display rows should match filtered rows in Monthly view
      expect(result.current.displayRows).toEqual(mockRows);
    });

    it('handles complete workflow from data to display', () => {
      const { result } = renderHook(() =>
        useCashFlowCalculations({
          data: mockData,
          viewMode: 'Cumulative',
          filteredRows: mockRows,
        })
      );

      // Check totals
      expect(result.current.totals).not.toBeNull();
      expect(result.current.totals?.netCashFlow).toBe(60000);

      // Check metrics
      expect(result.current.metrics.completedCount).toBe(2);
      expect(result.current.metrics.plannedCount).toBe(1);

      // Check display rows are cumulative
      expect(result.current.displayRows[2].netCashFlow).toBe(60000);
    });
  });
});
