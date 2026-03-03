/**
 * Calculation utilities for Cash Flow Feature
 * Business logic for financial calculations
 */

import { CashFlowRow, CashFlowData } from '../types/cashflow';

/**
 * Calculate net cash flow from revenue and total costs
 * @param revenue - Total revenue
 * @param totalCosts - Total costs
 * @returns Net cash flow
 */
export const calculateNetCashFlow = (revenue: number, totalCosts: number): number => {
  return revenue - totalCosts;
};

/**
 * Calculate cumulative cash flow from rows
 * @param rows - Array of cash flow rows
 * @returns Array of rows with cumulative values
 */
export const calculateCumulativeCashFlow = (rows: CashFlowRow[]): CashFlowRow[] => {
  let cumulativeNetCashFlow = 0;
  let cumulativeRevenue = 0;
  let cumulativeCosts = 0;
  let cumulativeHours = 0;

  return rows.map((row) => {
    cumulativeNetCashFlow += row.netCashFlow;
    cumulativeRevenue += row.revenue;
    cumulativeCosts += row.totalCosts;
    cumulativeHours += row.hours;

    return {
      ...row,
      netCashFlow: cumulativeNetCashFlow,
      revenue: cumulativeRevenue,
      totalCosts: cumulativeCosts,
      hours: cumulativeHours,
    };
  });
};

/**
 * Calculate totals for all numeric fields
 * @param rows - Array of cash flow rows
 * @returns Object with totals
 */
export const calculateTotals = (rows: CashFlowRow[]): {
  hours: number;
  personnel: number;
  odc: number;
  totalCosts: number;
  revenue: number;
  netCashFlow: number;
} => {
  return rows.reduce(
    (acc, row) => ({
      hours: acc.hours + row.hours,
      personnel: acc.personnel + row.personnel,
      odc: acc.odc + row.odc,
      totalCosts: acc.totalCosts + row.totalCosts,
      revenue: acc.revenue + row.revenue,
      netCashFlow: acc.netCashFlow + row.netCashFlow,
    }),
    {
      hours: 0,
      personnel: 0,
      odc: 0,
      totalCosts: 0,
      revenue: 0,
      netCashFlow: 0,
    }
  );
};

/**
 * Filter rows by status (Completed/Planned)
 * @param rows - Array of cash flow rows
 * @param showProjections - Whether to include planned rows
 * @returns Filtered rows
 */
export const filterRowsByProjections = (
  rows: CashFlowRow[],
  showProjections: boolean
): CashFlowRow[] => {
  if (showProjections) {
    return rows;
  }
  return rows.filter((row) => row.status === 'Completed');
};

/**
 * Calculate metrics for dashboard/summary
 * @param data - Cash flow data
 * @returns Calculated metrics
 */
export const calculateMetrics = (data: CashFlowData | null): {
  totalRevenue: number;
  totalCosts: number;
  netTotal: number;
  completedCount: number;
  plannedCount: number;
} => {
  if (!data || !data.rows || data.rows.length === 0) {
    return {
      totalRevenue: 0,
      totalCosts: 0,
      netTotal: 0,
      completedCount: 0,
      plannedCount: 0,
    };
  }

  const totals = calculateTotals(data.rows);
  const completedCount = data.rows.filter((row) => row.status === 'Completed').length;
  const plannedCount = data.rows.filter((row) => row.status === 'Planned').length;

  return {
    totalRevenue: totals.revenue,
    totalCosts: totals.totalCosts,
    netTotal: totals.netCashFlow,
    completedCount,
    plannedCount,
  };
};

/**
 * Calculate burn rate (average costs per period)
 * @param rows - Array of cash flow rows
 * @returns Average burn rate
 */
export const calculateBurnRate = (rows: CashFlowRow[]): number => {
  if (rows.length === 0) return 0;
  const totalCosts = rows.reduce((sum, row) => sum + row.totalCosts, 0);
  return totalCosts / rows.length;
};

/**
 * Calculate runway (months until funds depleted based on current cash flow)
 * @param currentBalance - Current cash balance
 * @param rows - Array of cash flow rows
 * @returns Number of months (runway)
 */
export const calculateRunway = (currentBalance: number, rows: CashFlowRow[]): number => {
  const burnRate = calculateBurnRate(rows);
  if (burnRate <= 0) return Infinity;
  return currentBalance / burnRate;
};
