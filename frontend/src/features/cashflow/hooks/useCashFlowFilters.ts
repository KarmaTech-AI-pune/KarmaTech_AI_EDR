/**
 * Custom hook for cash flow filtering logic
 * Encapsulates filtering business logic with memoization
 */

import { useMemo } from 'react';
import { CashFlowRow, CashFlowFilterOptions } from '../types';
import { filterRowsByProjections } from '../utils';

interface UseCashFlowFiltersProps {
  rows: CashFlowRow[];
  showProjections: boolean;
}

export const useCashFlowFilters = ({
  rows,
  showProjections,
}: UseCashFlowFiltersProps) => {
  // Apply all filters to rows
  const filteredRows = useMemo<CashFlowRow[]>(() => {
    if (!rows || rows.length === 0) return [];

    // Filter by projections (status)
    const statusFilteredRows = filterRowsByProjections(rows, showProjections);

    return statusFilteredRows;
  }, [rows, showProjections]);

  // Additional filter utility function
  const applyCustomFilters = useMemo(() => {
    return (rowsToFilter: CashFlowRow[], options: CashFlowFilterOptions): CashFlowRow[] => {
      let result = [...rowsToFilter];

      // Filter by status
      if (options.status) {
        result = result.filter((row) => row.status === options.status);
      }

      // Filter by date range
      if (options.dateRange) {
        // Implement date range filtering if needed
        // This would require period parsing and comparison
      }

      // Apply projections filter
      result = filterRowsByProjections(result, options.showProjections);

      return result;
    };
  }, []);

  return {
    filteredRows,
    applyCustomFilters,
  };
};
