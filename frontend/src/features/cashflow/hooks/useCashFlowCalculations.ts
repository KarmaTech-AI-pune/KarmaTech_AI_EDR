/**
 * Custom hook for cash flow calculations
 * Encapsulates all calculation logic with memoization
 */

import { useMemo } from 'react';
import {
  CashFlowRow,
  CashFlowData,
  CashFlowTotals,
  CashFlowMetrics,
  ViewMode,
} from '../types';
import {
  calculateTotals,
  calculateMetrics,
  calculateCumulativeCashFlow,
} from '../utils';

interface UseCashFlowCalculationsProps {
  data: CashFlowData | null;
  viewMode: ViewMode;
  filteredRows: CashFlowRow[];
}

export const useCashFlowCalculations = ({
  data,
  viewMode,
  filteredRows,
}: UseCashFlowCalculationsProps) => {
  // Calculate totals based on filtered rows
  const totals = useMemo<CashFlowTotals | null>(() => {
    if (!filteredRows || filteredRows.length === 0) return null;
    return calculateTotals(filteredRows);
  }, [filteredRows]);

  // Calculate metrics for the entire dataset
  const metrics = useMemo<CashFlowMetrics>(() => {
    return calculateMetrics(data);
  }, [data]);

  // Calculate display rows based on view mode
  const displayRows = useMemo<CashFlowRow[]>(() => {
    if (!filteredRows || filteredRows.length === 0) return [];

    switch (viewMode) {
      case 'Cumulative':
        return calculateCumulativeCashFlow(filteredRows);
      case 'Monthly':
      case 'Milestones':
      default:
        return filteredRows;
    }
  }, [filteredRows, viewMode]);

  return {
    totals,
    metrics,
    displayRows,
  };
};
