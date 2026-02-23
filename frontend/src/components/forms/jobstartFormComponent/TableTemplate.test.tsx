// import React from 'react';

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import TableTemplate, { CustomRow } from './TableTemplate';
import { WBSResource } from '../../../types/jobStartFormTypes';

// Mocking Material-UI components that might be complex or have specific behaviors
// For simplicity, we'll mock only those that are essential for testing the template's structure and interactions.
// TextField and InputAdornment are generally handled well by RTL, but we can mock them if needed.

describe('TableTemplate', () => {
  const mockResources: WBSResource[] = [
    { id: 'res-1', taskType: 1, description: 'Resource 1', rate: 100, units: 10, budgetedCost: 1000, remarks: 'Res 1 Remark' },
    { id: 'res-2', taskType: 0, description: 'Resource 2', rate: 150, units: 5, budgetedCost: 750, remarks: null },
  ];

  const mockCustomRows: CustomRow[] = [
    { id: 'custom-1', prefix: 'C1', title: 'Custom Row 1', hasRateField: true, hasUnitsField: true, unitSuffix: '%', units: 10, budgetedCost: 100, remarks: 'Custom 1 Remark' },
    { id: 'custom-2', prefix: 'C2', title: 'Custom Row 2', budgetedCost: 200, remarks: '' },
  ];

  const mockOnDataChange = vi.fn();

  const defaultProps = {
    title: 'Test Table',
    sectionId: 'test-section',
    sectionPrefix: 'T',
    headerTitle: 'Test Header',
    resources: mockResources,
    totalLabel: 'Total Cost',
    initialExpanded: true,
    customRows: mockCustomRows,
    totalCalculationType: 'sumAll' as const,
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<TableTemplate {...defaultProps} />);

    // Check title and header
    expect(screen.getByText('Test Table')).toBeInTheDocument();
    expect(screen.getByText('Test Header')).toBeInTheDocument();

    // Check resources
    expect(screen.getByText('Resource 1')).toBeInTheDocument();
    expect(screen.getAllByText('100.00').length).toBeGreaterThanOrEqual(2); // Rate for Res 1 and Cost for Custom 1
    expect(screen.getByText('10.00')).toBeInTheDocument(); // Units
    expect(screen.getByText('1,000.00')).toBeInTheDocument(); // Budgeted Cost
    expect(screen.getByDisplayValue('Res 1 Remark')).toBeInTheDocument(); // Remarks

    // Check custom rows
    expect(screen.getByText('Custom Row 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Units for custom row 1
    // Custom Row 1 budgeted cost 100 is already covered by getAllByText('100.00') above
    expect(screen.getByDisplayValue('Custom 1 Remark')).toBeInTheDocument(); // Remarks for custom row 1

    expect(screen.getByText('Custom Row 2')).toBeInTheDocument();
    // Custom Row 2 has no rate/units field, so it should be an input field for budgeted cost (per my recent change)
    expect(screen.getByDisplayValue('200')).toBeInTheDocument();

    // Check total row
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    // Total Cost calculation depends on totalCalculationType and data.
    // For 'sumAll', it should be sum of all resources and custom row budgeted costs.
    // (1000 + 750) + (100 + 200) = 2050
    expect(screen.getByText('2,050.00')).toBeInTheDocument();
  });

  it('expands and collapses accordion', async () => {
    render(<TableTemplate {...defaultProps} initialExpanded={false} />);

    // Initially not expanded
    await waitFor(() => expect(screen.queryByText('Resource 1')).not.toBeInTheDocument());

    // Expand the accordion
    const accordionSummary = screen.getByText('Test Table');
    fireEvent.click(accordionSummary);

    // Check if expanded
    expect(screen.getByText('Resource 1')).toBeInTheDocument();

    // Collapse the accordion
    fireEvent.click(accordionSummary);

    // Check if collapsed
    await waitFor(() => expect(screen.queryByText('Resource 1')).not.toBeInTheDocument());
  });

  it('updates remarks and calls onDataChange', () => {
    render(<TableTemplate {...defaultProps} />);

    const remarksInput = screen.getByDisplayValue('Res 1 Remark');
    fireEvent.change(remarksInput, { target: { value: 'Updated Remark 1' } });

    expect(mockOnDataChange).toHaveBeenCalledTimes(1);
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      resources: expect.arrayContaining([
        expect.objectContaining({ id: 'res-1', remarks: 'Updated Remark 1' }),
      ]),
      customRows: mockCustomRows, // customRows should not change here
    }));
  });

  it('updates custom row units and calls onDataChange', () => {
    render(<TableTemplate {...defaultProps} />);

    // Find the units input for 'Custom Row 1'
    const customRow1Element = screen.getByText('Custom Row 1').closest('tr');
    const unitsInput = within(customRow1Element!).getByRole('textbox', { name: /units/i });
    fireEvent.change(unitsInput, { target: { value: '20' } });

    expect(mockOnDataChange).toHaveBeenCalledTimes(1);
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      resources: mockResources, // resources should not change here
      customRows: expect.arrayContaining([
        expect.objectContaining({ id: 'custom-1', units: 20 }),
      ]),
    }));
  });

  it('updates custom row budgeted cost and calls onDataChange', () => {
    render(<TableTemplate {...defaultProps} />);

    // Find the budgeted cost input for 'Custom Row 2'
    const customRow2Element = screen.getByText('Custom Row 2').closest('tr');
    const budgetedCostInput = within(customRow2Element!).getByRole('textbox', { name: /budgeted cost/i });
    fireEvent.change(budgetedCostInput, { target: { value: '300' } });

    expect(mockOnDataChange).toHaveBeenCalledTimes(1);
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      resources: mockResources,
      customRows: expect.arrayContaining([
        expect.objectContaining({ id: 'custom-2', budgetedCost: 300 }),
      ]),
    }));
  });

  it('calculates total correctly with sumResourcesOnly', () => {
    render(<TableTemplate {...defaultProps} totalCalculationType="sumResourcesOnly" />);
    // Expected total = 1000 + 750 = 1750
    expect(screen.getByText('1,750.00')).toBeInTheDocument();
  });

  it('calculates total correctly with sumExpenseContingencies', () => {
    // Mock custom rows to include expense-specific ones
    const mockExpenseCustomRows: CustomRow[] = [
      { id: 'expenses-subtotal', prefix: '2b', title: 'Sub-Total', budgetedCost: 1500 },
      { id: 'expenses-contingencies', prefix: '2c', title: 'Contingencies (LS)', units: 10, budgetedCost: 150 },
      { id: 'expenses-expense-contingencies', prefix: '2d', title: 'Expense Contingencies (LS)', units: 5, budgetedCost: 75 },
    ];
    render(<TableTemplate {...defaultProps} customRows={mockExpenseCustomRows} totalCalculationType="sumExpenseContingencies" />);
    // Expected total = 1500 + 150 + 75 = 1725
    expect(screen.getByText('1,725.00')).toBeInTheDocument();
  });

  it('calculates total correctly with sumTimeContingencies', () => {
    // Mock custom rows to include time-specific ones
    const mockTimeCustomRows: CustomRow[] = [
      { id: 'time-subtotal', prefix: '1b', title: 'Sub-Total', budgetedCost: 1250 },
      { id: 'time-contingencies', prefix: '1c', title: 'Time Contingencies (LS)', units: 15, budgetedCost: 187.5 },
    ];
    render(<TableTemplate {...defaultProps} customRows={mockTimeCustomRows} totalCalculationType="sumTimeContingencies" />);
    // Expected total = 1250 + 187.5 = 1437.50
    expect(screen.getByText('1,437.50')).toBeInTheDocument();
  });

  it('handles empty resources and custom rows gracefully', () => {
    render(<TableTemplate {...defaultProps} resources={[]} customRows={[]} />);
    // Check that the total row still displays 0.00
    expect(screen.getByText('Total Cost')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });
});
