import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EstimatedExpenses from './EstimatedExpenses';
import { WBSResource } from '../../../types/jobStartFormTypes';

// Mocking dependencies
// Mocking TableTemplate component
vi.mock('./TableTemplate', () => ({
  __esModule: true,
  default: vi.fn(({ title, resources, totalLabel, customRows, onDataChange }) => (
    <div data-testid="mock-table-template">
      <h3>{title}</h3>
      <div>
        <h4>Resources:</h4>
        {resources.map((res: WBSResource, index: number) => (
          <div key={index} data-testid={`resource-${index}`}>
            {res.name}: {res.budgetedCost} - {res.remarks}
          </div>
        ))}
      </div>
      <div>
        <h4>Custom Rows:</h4>
        {customRows.map((row: any) => (
          <div key={row.id} data-testid={`custom-row-${row.id}`}>
            {row.title}: {row.budgetedCost} {row.unitSuffix} {row.units !== undefined && `(${row.units})`} - {row.remarks}
          </div>
        ))}
      </div>
      <button onClick={() => onDataChange({ resources: [], customRows: [] })}>Simulate Data Change</button>
    </div>
  )),
}));

// Mocking utility functions
vi.mock('../../../utils/calculations', () => ({
  addCalculation: vi.fn((...args: number[]) => args.reduce((sum, current) => sum + current, 0)),
  percentageCalculation: vi.fn((percentage: number, total: number) => (percentage / 100) * total),
}));

// Mocking the types if they are complex and not directly importable for testing purposes
// For now, assuming WBSResource is a simple object with budgetedCost and name

describe('EstimatedExpenses', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockWbsResources: WBSResource[] = [
    { id: '1', name: 'Resource A', budgetedCost: 1000, units: 10, taskType: 1, description: 'Resource A Description', rate: 100, remarks: 'Resource A Remarks' },
    { id: '2', name: 'Resource B', budgetedCost: 2000, units: 20, taskType: 1, description: 'Resource B Description', rate: 100, remarks: 'Resource B Remarks' },
  ];

  const mockInitialContingencyUnits = 10;
  const mockInitialContingencyRemarks = 'Initial contingency remarks';
  const mockInitialExpenseContingencyUnits = 5;
  const mockInitialExpenseContingencyRemarks = 'Initial expense contingency remarks';
  const mockInitialSubtotalRemarks = 'Initial subtotal remarks';

  const mockOnTotalCostChange = vi.fn();

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <EstimatedExpenses
        wbsResources={mockWbsResources}
        initialContingencyUnits={mockInitialContingencyUnits}
        initialContingencyRemarks={mockInitialContingencyRemarks}
        initialExpenseContingencyUnits={mockInitialExpenseContingencyUnits}
        initialExpenseContingencyRemarks={mockInitialExpenseContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Check if the mock TableTemplate is rendered with correct title
    expect(screen.getByText('2.0 ESTIMATED EXPENSES')).toBeInTheDocument();

    // Check if resources are rendered
    expect(screen.getByTestId('resource-0')).toHaveTextContent('Resource A: 1000');
    expect(screen.getByTestId('resource-1')).toHaveTextContent('Resource B: 2000');

    // Check if custom rows are rendered with initial values
    expect(screen.getByTestId('custom-row-expenses-subtotal')).toHaveTextContent('Sub-Total: 3000'); // Calculates immediately
    expect(screen.getByTestId('custom-row-expenses-contingencies')).toHaveTextContent('Contingencies (LS): 300 % (10)');
    expect(screen.getByTestId('custom-row-expenses-expense-contingencies')).toHaveTextContent('Expense Contingencies (LS): 150 % (5)');
  });

  it('calculates subtotal and contingencies correctly', () => {
    render(
      <EstimatedExpenses
        wbsResources={mockWbsResources}
        initialContingencyUnits={mockInitialContingencyUnits}
        initialContingencyRemarks={mockInitialContingencyRemarks}
        initialExpenseContingencyUnits={mockInitialExpenseContingencyUnits}
        initialExpenseContingencyRemarks={mockInitialExpenseContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Expected calculations:
    // Subtotal = 1000 + 2000 = 3000
    // Contingencies = 10% of 3000 = 300
    // Expense Contingencies = 5% of 3000 = 150

    expect(screen.getByTestId('custom-row-expenses-subtotal')).toHaveTextContent('Sub-Total: 3000');
    expect(screen.getByTestId('custom-row-expenses-contingencies')).toHaveTextContent('Contingencies (LS): 300 % (10)');
    expect(screen.getByTestId('custom-row-expenses-expense-contingencies')).toHaveTextContent('Expense Contingencies (LS): 150 % (5)');
  });

  it('calls onTotalCostChange when data changes', () => {
    render(
      <EstimatedExpenses
        wbsResources={mockWbsResources}
        initialContingencyUnits={mockInitialContingencyUnits}
        initialContingencyRemarks={mockInitialContingencyRemarks}
        initialExpenseContingencyUnits={mockInitialExpenseContingencyUnits}
        initialExpenseContingencyRemarks={mockInitialExpenseContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Simulate a data change from the TableTemplate
    const mockTableTemplate = screen.getByTestId('mock-table-template');
    const simulateButton = mockTableTemplate.querySelector('button');
    
    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    // Expect onTotalCostChange to have been called with the new data (empty in this mock)
    expect(mockOnTotalCostChange).toHaveBeenCalledWith({ resources: [], customRows: [] });
  });

  it('updates custom row remarks when initial remarks props change', () => {
    const { rerender } = render(
      <EstimatedExpenses
        wbsResources={mockWbsResources}
        initialContingencyUnits={mockInitialContingencyUnits}
        initialContingencyRemarks={mockInitialContingencyRemarks}
        initialExpenseContingencyUnits={mockInitialExpenseContingencyUnits}
        initialExpenseContingencyRemarks={mockInitialExpenseContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Rerender with updated remarks
    rerender(
      <EstimatedExpenses
        wbsResources={mockWbsResources}
        initialContingencyUnits={mockInitialContingencyUnits}
        initialContingencyRemarks="Updated contingency remarks"
        initialExpenseContingencyUnits={mockInitialExpenseContingencyUnits}
        initialExpenseContingencyRemarks={mockInitialExpenseContingencyRemarks}
        initialSubtotalRemarks="Updated subtotal remarks"
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Check if the remarks have been updated
    expect(screen.getByTestId('custom-row-expenses-contingencies')).toHaveTextContent('Contingencies (LS): 300 % (10) - Updated contingency remarks');
    expect(screen.getByTestId('custom-row-expenses-subtotal')).toHaveTextContent('Sub-Total: 3000 - Updated subtotal remarks');
  });

  // Add more tests for edge cases, empty states, error handling if applicable
});
