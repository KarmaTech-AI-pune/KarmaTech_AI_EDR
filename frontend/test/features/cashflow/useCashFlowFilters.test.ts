import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCashFlowFilters } from '../../../src/features/cashflow/hooks/useCashFlowFilters';
import { CashFlowRow, CashFlowFilterOptions } from '../../../src/features/cashflow/types/cashflow';

describe('useCashFlowFilters Hook', () => {
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
    {
      period: 'Apr-25',
      hours: 160,
      personnel: 50000,
      odc: 10000,
      totalCosts: 60000,
      revenue: 80000,
      netCashFlow: 20000,
      status: 'Planned',
    },
  ];

  describe('Filtered Rows - Basic Filtering', () => {
    it('returns all rows when showProjections is true', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      expect(result.current.filteredRows).toHaveLength(4);
      expect(result.current.filteredRows).toEqual(mockRows);
    });

    it('returns only completed rows when showProjections is false', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: false,
        })
      );

      expect(result.current.filteredRows).toHaveLength(2);
      expect(result.current.filteredRows.every(row => row.status === 'Completed')).toBe(true);
    });

    it('returns empty array for empty rows', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: [],
          showProjections: true,
        })
      );

      expect(result.current.filteredRows).toEqual([]);
    });

    it('preserves row data when filtering', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: false,
        })
      );

      expect(result.current.filteredRows[0].period).toBe('Jan-25');
      expect(result.current.filteredRows[0].hours).toBe(160);
      expect(result.current.filteredRows[0].revenue).toBe(80000);
    });

    it('handles all completed rows', () => {
      const completedRows: CashFlowRow[] = mockRows.map(row => ({
        ...row,
        status: 'Completed' as const,
      }));

      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: completedRows,
          showProjections: false,
        })
      );

      expect(result.current.filteredRows).toHaveLength(4);
    });

    it('handles all planned rows', () => {
      const plannedRows: CashFlowRow[] = mockRows.map(row => ({
        ...row,
        status: 'Planned' as const,
      }));

      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: plannedRows,
          showProjections: false,
        })
      );

      expect(result.current.filteredRows).toHaveLength(0);
    });

    it('handles single row', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: [mockRows[0]],
          showProjections: true,
        })
      );

      expect(result.current.filteredRows).toHaveLength(1);
      expect(result.current.filteredRows[0]).toEqual(mockRows[0]);
    });
  });

  describe('Filtered Rows - Reactivity', () => {
    it('updates filtered rows when showProjections changes', () => {
      const { result, rerender } = renderHook(
        ({ showProjections }) =>
          useCashFlowFilters({
            rows: mockRows,
            showProjections,
          }),
        {
          initialProps: { showProjections: true },
        }
      );

      expect(result.current.filteredRows).toHaveLength(4);

      rerender({ showProjections: false });

      expect(result.current.filteredRows).toHaveLength(2);
    });

    it('updates filtered rows when rows change', () => {
      const { result, rerender } = renderHook(
        ({ rows }) =>
          useCashFlowFilters({
            rows,
            showProjections: true,
          }),
        {
          initialProps: { rows: [mockRows[0]] },
        }
      );

      expect(result.current.filteredRows).toHaveLength(1);

      rerender({ rows: mockRows });

      expect(result.current.filteredRows).toHaveLength(4);
    });

    it('updates filtered rows when both rows and showProjections change', () => {
      const { result, rerender } = renderHook(
        ({ rows, showProjections }) =>
          useCashFlowFilters({
            rows,
            showProjections,
          }),
        {
          initialProps: { rows: [mockRows[0]], showProjections: true },
        }
      );

      expect(result.current.filteredRows).toHaveLength(1);

      rerender({ rows: mockRows, showProjections: false });

      expect(result.current.filteredRows).toHaveLength(2);
    });
  });

  describe('Apply Custom Filters - Status Filter', () => {
    it('filters by Completed status', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Completed')).toBe(true);
    });

    it('filters by Planned status', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Planned',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Planned')).toBe(true);
    });

    it('returns all rows when no status filter is provided', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(4);
    });

    it('returns empty array when status filter matches no rows', () => {
      const completedRows: CashFlowRow[] = mockRows.map(row => ({
        ...row,
        status: 'Completed' as const,
      }));

      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: completedRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Planned',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(completedRows, options);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Apply Custom Filters - Projections Filter', () => {
    it('applies projections filter when showProjections is true', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(4);
    });

    it('applies projections filter when showProjections is false', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        showProjections: false,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Completed')).toBe(true);
    });
  });

  describe('Apply Custom Filters - Combined Filters', () => {
    it('applies both status and projections filters', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: false,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Completed')).toBe(true);
    });

    it('handles status filter with showProjections true', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Planned',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Planned')).toBe(true);
    });

    it('handles conflicting filters correctly', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      // Filter for Planned status but showProjections is false (only Completed)
      const options: CashFlowFilterOptions = {
        status: 'Planned',
        showProjections: false,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      // Should return empty because Planned rows are filtered out by showProjections
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Apply Custom Filters - Date Range Filter', () => {
    it('handles date range filter option', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        dateRange: {
          start: '2025-01-01',
          end: '2025-03-31',
        },
        showProjections: true,
      };

      // Date range filtering is not implemented yet, so it should return all rows
      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered).toHaveLength(4);
    });

    it('combines date range with other filters', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Completed',
        dateRange: {
          start: '2025-01-01',
          end: '2025-12-31',
        },
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      // Date range not implemented, but status filter should work
      expect(filtered).toHaveLength(2);
      expect(filtered.every(row => row.status === 'Completed')).toBe(true);
    });
  });

  describe('Apply Custom Filters - Edge Cases', () => {
    it('handles empty rows array', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: [],
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters([], options);

      expect(filtered).toEqual([]);
    });

    it('handles single row', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters([mockRows[0]], options);

      expect(filtered).toHaveLength(1);
    });

    it('does not mutate original rows array', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const originalLength = mockRows.length;
      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: false,
      };

      result.current.applyCustomFilters(mockRows, options);

      expect(mockRows).toHaveLength(originalLength);
    });

    it('preserves row properties after filtering', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);

      expect(filtered[0].period).toBe('Jan-25');
      expect(filtered[0].hours).toBe(160);
      expect(filtered[0].revenue).toBe(80000);
    });
  });

  describe('Memoization', () => {
    it('memoizes filteredRows when inputs do not change', () => {
      const { result, rerender } = renderHook(
        ({ rows, showProjections }) =>
          useCashFlowFilters({
            rows,
            showProjections,
          }),
        {
          initialProps: { rows: mockRows, showProjections: true },
        }
      );

      const firstFilteredRows = result.current.filteredRows;

      rerender({ rows: mockRows, showProjections: true });

      expect(result.current.filteredRows).toBe(firstFilteredRows);
    });

    it('memoizes applyCustomFilters function', () => {
      const { result, rerender } = renderHook(
        ({ rows }) =>
          useCashFlowFilters({
            rows,
            showProjections: true,
          }),
        {
          initialProps: { rows: mockRows },
        }
      );

      const firstFunction = result.current.applyCustomFilters;

      rerender({ rows: mockRows });

      expect(result.current.applyCustomFilters).toBe(firstFunction);
    });

    it('recalculates filteredRows when showProjections changes', () => {
      const { result, rerender } = renderHook(
        ({ showProjections }) =>
          useCashFlowFilters({
            rows: mockRows,
            showProjections,
          }),
        {
          initialProps: { showProjections: true },
        }
      );

      const firstFilteredRows = result.current.filteredRows;

      rerender({ showProjections: false });

      expect(result.current.filteredRows).not.toBe(firstFilteredRows);
    });

    it('recalculates filteredRows when rows change', () => {
      const { result, rerender } = renderHook(
        ({ rows }) =>
          useCashFlowFilters({
            rows,
            showProjections: true,
          }),
        {
          initialProps: { rows: [mockRows[0]] },
        }
      );

      const firstFilteredRows = result.current.filteredRows;

      rerender({ rows: mockRows });

      expect(result.current.filteredRows).not.toBe(firstFilteredRows);
    });
  });

  describe('Integration Tests', () => {
    it('provides consistent filtering across both methods', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: false,
        })
      );

      const options: CashFlowFilterOptions = {
        showProjections: false,
      };

      const customFiltered = result.current.applyCustomFilters(mockRows, options);

      // Both should return only completed rows
      expect(result.current.filteredRows).toHaveLength(2);
      expect(customFiltered).toHaveLength(2);
      expect(result.current.filteredRows.every(row => row.status === 'Completed')).toBe(true);
      expect(customFiltered.every(row => row.status === 'Completed')).toBe(true);
    });

    it('handles complete filtering workflow', () => {
      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: mockRows,
          showProjections: true,
        })
      );

      // Start with all rows
      expect(result.current.filteredRows).toHaveLength(4);

      // Apply custom filter for completed only
      const options: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: true,
      };

      const filtered = result.current.applyCustomFilters(mockRows, options);
      expect(filtered).toHaveLength(2);

      // Apply stricter filter
      const strictOptions: CashFlowFilterOptions = {
        status: 'Completed',
        showProjections: false,
      };

      const strictFiltered = result.current.applyCustomFilters(mockRows, strictOptions);
      expect(strictFiltered).toHaveLength(2);
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
        status: i % 2 === 0 ? ('Completed' as const) : ('Planned' as const),
      }));

      const { result } = renderHook(() =>
        useCashFlowFilters({
          rows: largeDataset,
          showProjections: false,
        })
      );

      expect(result.current.filteredRows).toHaveLength(500);
    });
  });
});
