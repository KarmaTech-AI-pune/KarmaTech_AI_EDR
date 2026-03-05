import { describe, it, expect } from 'vitest';
import {
  calculateNetCashFlow,
  calculateCumulativeCashFlow,
  calculateTotals,
  filterRowsByProjections,
  calculateMetrics,
  calculateBurnRate,
  calculateRunway,
} from '../../../src/features/cashflow/utils/calculations';
import { CashFlowRow, CashFlowData } from '../../../src/features/cashflow/types/cashflow';

describe('Calculations Utility', () => {
  describe('calculateNetCashFlow', () => {
    it('calculates positive net cash flow', () => {
      const result = calculateNetCashFlow(100000, 60000);
      expect(result).toBe(40000);
    });

    it('calculates negative net cash flow', () => {
      const result = calculateNetCashFlow(50000, 80000);
      expect(result).toBe(-30000);
    });

    it('calculates zero net cash flow when revenue equals costs', () => {
      const result = calculateNetCashFlow(75000, 75000);
      expect(result).toBe(0);
    });

    it('handles zero revenue', () => {
      const result = calculateNetCashFlow(0, 50000);
      expect(result).toBe(-50000);
    });

    it('handles zero costs', () => {
      const result = calculateNetCashFlow(100000, 0);
      expect(result).toBe(100000);
    });

    it('handles both zero values', () => {
      const result = calculateNetCashFlow(0, 0);
      expect(result).toBe(0);
    });

    it('handles large numbers', () => {
      const result = calculateNetCashFlow(10000000, 5000000);
      expect(result).toBe(5000000);
    });

    it('handles decimal values', () => {
      const result = calculateNetCashFlow(1000.50, 500.25);
      expect(result).toBeCloseTo(500.25, 2);
    });
  });

  describe('calculateCumulativeCashFlow', () => {
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

    it('calculates cumulative values correctly', () => {
      const result = calculateCumulativeCashFlow(mockRows);

      expect(result[0].netCashFlow).toBe(20000);
      expect(result[1].netCashFlow).toBe(40000);
      expect(result[2].netCashFlow).toBe(60000);
    });

    it('calculates cumulative revenue correctly', () => {
      const result = calculateCumulativeCashFlow(mockRows);

      expect(result[0].revenue).toBe(80000);
      expect(result[1].revenue).toBe(160000);
      expect(result[2].revenue).toBe(240000);
    });

    it('calculates cumulative costs correctly', () => {
      const result = calculateCumulativeCashFlow(mockRows);

      expect(result[0].totalCosts).toBe(60000);
      expect(result[1].totalCosts).toBe(120000);
      expect(result[2].totalCosts).toBe(180000);
    });

    it('calculates cumulative hours correctly', () => {
      const result = calculateCumulativeCashFlow(mockRows);

      expect(result[0].hours).toBe(160);
      expect(result[1].hours).toBe(320);
      expect(result[2].hours).toBe(480);
    });

    it('preserves original row properties', () => {
      const result = calculateCumulativeCashFlow(mockRows);

      expect(result[0].period).toBe('Jan-25');
      expect(result[0].personnel).toBe(50000);
      expect(result[0].odc).toBe(10000);
      expect(result[0].status).toBe('Completed');
    });

    it('handles empty array', () => {
      const result = calculateCumulativeCashFlow([]);
      expect(result).toEqual([]);
    });

    it('handles single row', () => {
      const singleRow: CashFlowRow[] = [mockRows[0]];
      const result = calculateCumulativeCashFlow(singleRow);

      expect(result).toHaveLength(1);
      expect(result[0].netCashFlow).toBe(20000);
    });

    it('handles negative cash flow', () => {
      const negativeRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: -10000 },
        { ...mockRows[1], netCashFlow: -5000 },
      ];
      const result = calculateCumulativeCashFlow(negativeRows);

      expect(result[0].netCashFlow).toBe(-10000);
      expect(result[1].netCashFlow).toBe(-15000);
    });

    it('handles mixed positive and negative cash flow', () => {
      const mixedRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: 20000 },
        { ...mockRows[1], netCashFlow: -10000 },
        { ...mockRows[2], netCashFlow: 15000 },
      ];
      const result = calculateCumulativeCashFlow(mixedRows);

      expect(result[0].netCashFlow).toBe(20000);
      expect(result[1].netCashFlow).toBe(10000);
      expect(result[2].netCashFlow).toBe(25000);
    });
  });

  describe('calculateTotals', () => {
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
    ];

    it('calculates totals correctly', () => {
      const result = calculateTotals(mockRows);

      expect(result.hours).toBe(320);
      expect(result.personnel).toBe(100000);
      expect(result.odc).toBe(20000);
      expect(result.totalCosts).toBe(120000);
      expect(result.revenue).toBe(160000);
      expect(result.netCashFlow).toBe(40000);
    });

    it('handles empty array', () => {
      const result = calculateTotals([]);

      expect(result.hours).toBe(0);
      expect(result.personnel).toBe(0);
      expect(result.odc).toBe(0);
      expect(result.totalCosts).toBe(0);
      expect(result.revenue).toBe(0);
      expect(result.netCashFlow).toBe(0);
    });

    it('handles single row', () => {
      const result = calculateTotals([mockRows[0]]);

      expect(result.hours).toBe(160);
      expect(result.personnel).toBe(50000);
      expect(result.odc).toBe(10000);
      expect(result.totalCosts).toBe(60000);
      expect(result.revenue).toBe(80000);
      expect(result.netCashFlow).toBe(20000);
    });

    it('handles negative values', () => {
      const negativeRows: CashFlowRow[] = [
        { ...mockRows[0], netCashFlow: -10000 },
      ];
      const result = calculateTotals(negativeRows);

      expect(result.netCashFlow).toBe(-10000);
    });

    it('handles zero values', () => {
      const zeroRows: CashFlowRow[] = [
        {
          period: 'Jan-25',
          hours: 0,
          personnel: 0,
          odc: 0,
          totalCosts: 0,
          revenue: 0,
          netCashFlow: 0,
          status: 'Planned',
        },
      ];
      const result = calculateTotals(zeroRows);

      expect(result.hours).toBe(0);
      expect(result.personnel).toBe(0);
      expect(result.odc).toBe(0);
      expect(result.totalCosts).toBe(0);
      expect(result.revenue).toBe(0);
      expect(result.netCashFlow).toBe(0);
    });

    it('handles large numbers', () => {
      const largeRows: CashFlowRow[] = [
        {
          period: 'Jan-25',
          hours: 10000,
          personnel: 5000000,
          odc: 1000000,
          totalCosts: 6000000,
          revenue: 8000000,
          netCashFlow: 2000000,
          status: 'Completed',
        },
      ];
      const result = calculateTotals(largeRows);

      expect(result.hours).toBe(10000);
      expect(result.personnel).toBe(5000000);
      expect(result.revenue).toBe(8000000);
    });
  });

  describe('filterRowsByProjections', () => {
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
        status: 'Planned',
      },
      {
        period: 'Mar-25',
        hours: 160,
        personnel: 50000,
        odc: 10000,
        totalCosts: 60000,
        revenue: 80000,
        netCashFlow: 20000,
        status: 'Completed',
      },
    ];

    it('returns all rows when showProjections is true', () => {
      const result = filterRowsByProjections(mockRows, true);
      expect(result).toHaveLength(3);
    });

    it('returns only completed rows when showProjections is false', () => {
      const result = filterRowsByProjections(mockRows, false);
      expect(result).toHaveLength(2);
      expect(result.every(row => row.status === 'Completed')).toBe(true);
    });

    it('handles empty array', () => {
      const result = filterRowsByProjections([], true);
      expect(result).toEqual([]);
    });

    it('handles all completed rows', () => {
      const completedRows: CashFlowRow[] = mockRows.map(row => ({ ...row, status: 'Completed' as const }));
      const result = filterRowsByProjections(completedRows, false);
      expect(result).toHaveLength(3);
    });

    it('handles all planned rows', () => {
      const plannedRows: CashFlowRow[] = mockRows.map(row => ({ ...row, status: 'Planned' as const }));
      const result = filterRowsByProjections(plannedRows, false);
      expect(result).toHaveLength(0);
    });

    it('preserves row data when filtering', () => {
      const result = filterRowsByProjections(mockRows, false);
      expect(result[0].period).toBe('Jan-25');
      expect(result[0].hours).toBe(160);
      expect(result[0].revenue).toBe(80000);
    });
  });

  describe('calculateMetrics', () => {
    const mockData: CashFlowData = {
      projectId: 'project-123',
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
        {
          period: 'Feb-25',
          hours: 160,
          personnel: 50000,
          odc: 10000,
          totalCosts: 60000,
          revenue: 80000,
          netCashFlow: 20000,
          status: 'Planned',
        },
        {
          period: 'Mar-25',
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

    it('calculates metrics correctly', () => {
      const result = calculateMetrics(mockData);

      expect(result.totalRevenue).toBe(240000);
      expect(result.totalCosts).toBe(180000);
      expect(result.netTotal).toBe(60000);
      expect(result.completedCount).toBe(2);
      expect(result.plannedCount).toBe(1);
    });

    it('handles null data', () => {
      const result = calculateMetrics(null);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalCosts).toBe(0);
      expect(result.netTotal).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.plannedCount).toBe(0);
    });

    it('handles empty rows', () => {
      const emptyData: CashFlowData = {
        projectId: 'project-123',
        rows: [],
      };
      const result = calculateMetrics(emptyData);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalCosts).toBe(0);
      expect(result.netTotal).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.plannedCount).toBe(0);
    });

    it('handles data without rows property', () => {
      const dataWithoutRows = { projectId: 'project-123' } as CashFlowData;
      const result = calculateMetrics(dataWithoutRows);

      expect(result.totalRevenue).toBe(0);
      expect(result.totalCosts).toBe(0);
      expect(result.netTotal).toBe(0);
      expect(result.completedCount).toBe(0);
      expect(result.plannedCount).toBe(0);
    });

    it('handles all completed rows', () => {
      const completedData: CashFlowData = {
        projectId: 'project-123',
        rows: mockData.rows.map(row => ({ ...row, status: 'Completed' as const })),
      };
      const result = calculateMetrics(completedData);

      expect(result.completedCount).toBe(3);
      expect(result.plannedCount).toBe(0);
    });

    it('handles all planned rows', () => {
      const plannedData: CashFlowData = {
        projectId: 'project-123',
        rows: mockData.rows.map(row => ({ ...row, status: 'Planned' as const })),
      };
      const result = calculateMetrics(plannedData);

      expect(result.completedCount).toBe(0);
      expect(result.plannedCount).toBe(3);
    });

    it('handles negative net cash flow', () => {
      const negativeData: CashFlowData = {
        projectId: 'project-123',
        rows: [
          {
            period: 'Jan-25',
            hours: 160,
            personnel: 50000,
            odc: 10000,
            totalCosts: 100000,
            revenue: 50000,
            netCashFlow: -50000,
            status: 'Completed',
          },
        ],
      };
      const result = calculateMetrics(negativeData);

      expect(result.netTotal).toBe(-50000);
    });
  });

  describe('calculateBurnRate', () => {
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
        status: 'Completed',
      },
    ];

    it('calculates burn rate correctly', () => {
      const result = calculateBurnRate(mockRows);
      expect(result).toBe(60000);
    });

    it('handles empty array', () => {
      const result = calculateBurnRate([]);
      expect(result).toBe(0);
    });

    it('handles single row', () => {
      const result = calculateBurnRate([mockRows[0]]);
      expect(result).toBe(60000);
    });

    it('handles varying costs', () => {
      const varyingRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 50000 },
        { ...mockRows[1], totalCosts: 70000 },
        { ...mockRows[2], totalCosts: 60000 },
      ];
      const result = calculateBurnRate(varyingRows);
      expect(result).toBe(60000);
    });

    it('handles zero costs', () => {
      const zeroRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 0 },
        { ...mockRows[1], totalCosts: 0 },
      ];
      const result = calculateBurnRate(zeroRows);
      expect(result).toBe(0);
    });

    it('handles large costs', () => {
      const largeRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 1000000 },
        { ...mockRows[1], totalCosts: 2000000 },
      ];
      const result = calculateBurnRate(largeRows);
      expect(result).toBe(1500000);
    });

    it('handles decimal costs', () => {
      const decimalRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 60000.50 },
        { ...mockRows[1], totalCosts: 60000.50 },
      ];
      const result = calculateBurnRate(decimalRows);
      expect(result).toBeCloseTo(60000.50, 2);
    });
  });

  describe('calculateRunway', () => {
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
    ];

    it('calculates runway correctly', () => {
      const result = calculateRunway(300000, mockRows);
      expect(result).toBe(5);
    });

    it('handles zero balance', () => {
      const result = calculateRunway(0, mockRows);
      expect(result).toBe(0);
    });

    it('handles empty rows', () => {
      const result = calculateRunway(100000, []);
      expect(result).toBe(Infinity);
    });

    it('handles zero burn rate', () => {
      const zeroRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 0 },
      ];
      const result = calculateRunway(100000, zeroRows);
      expect(result).toBe(Infinity);
    });

    it('handles negative burn rate', () => {
      const negativeRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: -60000 },
      ];
      const result = calculateRunway(100000, negativeRows);
      expect(result).toBe(Infinity);
    });

    it('handles large balance', () => {
      const result = calculateRunway(10000000, mockRows);
      expect(result).toBeCloseTo(166.67, 2);
    });

    it('handles small balance', () => {
      const result = calculateRunway(60000, mockRows);
      expect(result).toBe(1);
    });

    it('handles decimal balance', () => {
      const result = calculateRunway(150000.50, mockRows);
      expect(result).toBeCloseTo(2.50, 2);
    });

    it('handles varying costs', () => {
      const varyingRows: CashFlowRow[] = [
        { ...mockRows[0], totalCosts: 50000 },
        { ...mockRows[1], totalCosts: 70000 },
      ];
      const result = calculateRunway(240000, varyingRows);
      expect(result).toBe(4);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('handles complete workflow from raw data to metrics', () => {
      const rawRows: CashFlowRow[] = [
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
          status: 'Planned',
        },
      ];

      // Filter projections
      const filtered = filterRowsByProjections(rawRows, false);
      expect(filtered).toHaveLength(1);

      // Calculate totals
      const totals = calculateTotals(filtered);
      expect(totals.revenue).toBe(80000);

      // Calculate cumulative
      const cumulative = calculateCumulativeCashFlow(filtered);
      expect(cumulative[0].netCashFlow).toBe(20000);

      // Calculate burn rate
      const burnRate = calculateBurnRate(filtered);
      expect(burnRate).toBe(60000);

      // Calculate runway
      const runway = calculateRunway(180000, filtered);
      expect(runway).toBe(3);
    });

    it('handles all zero values throughout calculations', () => {
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

      const totals = calculateTotals(zeroRows);
      expect(totals.netCashFlow).toBe(0);

      const burnRate = calculateBurnRate(zeroRows);
      expect(burnRate).toBe(0);

      const runway = calculateRunway(0, zeroRows);
      expect(runway).toBe(Infinity);
    });

    it('handles very large datasets', () => {
      const largeDataset: CashFlowRow[] = Array.from({ length: 1000 }, (_, i) => ({
        period: `Month-${i}`,
        hours: 160,
        personnel: 50000,
        odc: 10000,
        totalCosts: 60000,
        revenue: 80000,
        netCashFlow: 20000,
        status: i % 2 === 0 ? 'Completed' as const : 'Planned' as const,
      }));

      const totals = calculateTotals(largeDataset);
      expect(totals.revenue).toBe(80000000);

      const filtered = filterRowsByProjections(largeDataset, false);
      expect(filtered).toHaveLength(500);
    });
  });
});
