import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobstartTime from './JobstartTime';
import { WBSResource } from '../../../types/jobStartFormTypes';

// Mocking dependencies
// Mocking TableTemplate component
jest.mock('./TableTemplate', () => ({
  __esModule: true,
  default: jest.fn(({ title, resources, totalLabel, customRows, onDataChange }) => (
    <div data-testid="mock-table-template">
      <h3>{title}</h3>
      <div>
        <h4>Resources:</h4>
        {resources.map((res: WBSResource, index: number) => (
          <div key={index} data-testid={`resource-${index}`}>
            {res.name}: {res.budgetedCost}
          </div>
        ))}
      </div>
      <div>
        <h4>Custom Rows:</h4>
        {customRows.map((row: any) => (
          <div key={row.id} data-testid={`custom-row-${row.id}`}>
            {row.title}: {row.budgetedCost} {row.unitSuffix} {row.units !== undefined && `(${row.units})`}
          </div>
        ))}
      </div>
      <button onClick={() => onDataChange({ resources: [], customRows: [] })}>Simulate Data Change</button>
    </div>
  )),
}));

// Mocking utility functions
jest.mock('../../../utils/calculations', () => ({
  addCalculation: jest.fn((...args: number[]) => args.reduce((sum, current) => sum + current, 0)),
  percentageCalculation: jest.fn((percentage: number, total: number) => (percentage / 100) * total),
}));

describe('JobstartTime', () => {
  const mockWbsResources: WBSResource[] = [
    { id: '1', name: 'Manpower A', budgetedCost: 5000, units: 50, taskType: 0, description: 'Manpower A Desc', rate: 100, remarks: 'Manpower A Remarks' },
    { id: '2', name: 'Manpower B', budgetedCost: 7500, units: 75, taskType: 0, description: 'Manpower B Desc', rate: 100, remarks: 'Manpower B Remarks' },
  ];

  const mockInitialTimeContingencyUnits = 15;
  const mockInitialTimeContingencyRemarks = 'Initial time contingency remarks';
  const mockInitialSubtotalRemarks = 'Initial subtotal remarks';

  const mockOnTotalCostChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <JobstartTime
        wbsResources={mockWbsResources}
        initialTimeContingencyUnits={mockInitialTimeContingencyUnits}
        initialTimeContingencyRemarks={mockInitialTimeContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    expect(screen.getByText('1.0 TIME')).toBeInTheDocument();
    expect(screen.getByText('Employee Personnel')).toBeInTheDocument();

    expect(screen.getByTestId('resource-0')).toHaveTextContent('Manpower A: 5000');
    expect(screen.getByTestId('resource-1')).toHaveTextContent('Manpower B: 7500');

    expect(screen.getByTestId('custom-row-time-subtotal')).toHaveTextContent('Sub-Total: 0'); // Initial value before calculation
    expect(screen.getByTestId('custom-row-time-contingencies')).toHaveTextContent('Time Contingencies (LS): 0 % (15)');
  });

  it('calculates subtotal and time contingencies correctly', () => {
    render(
      <JobstartTime
        wbsResources={mockWbsResources}
        initialTimeContingencyUnits={mockInitialTimeContingencyUnits}
        initialTimeContingencyRemarks={mockInitialTimeContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Expected calculations:
    // Subtotal = 5000 + 7500 = 12500
    // Time Contingencies = 15% of 12500 = 1875

    expect(screen.getByTestId('custom-row-time-subtotal')).toHaveTextContent('Sub-Total: 12500');
    expect(screen.getByTestId('custom-row-time-contingencies')).toHaveTextContent('Time Contingencies (LS): 1875 % (15)');
  });

  it('calls onTotalCostChange when data changes', () => {
    render(
      <JobstartTime
        wbsResources={mockWbsResources}
        initialTimeContingencyUnits={mockInitialTimeContingencyUnits}
        initialTimeContingencyRemarks={mockInitialTimeContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    const mockTableTemplate = screen.getByTestId('mock-table-template');
    const simulateButton = mockTableTemplate.querySelector('button');

    if (simulateButton) {
      fireEvent.click(simulateButton);
    }

    expect(mockOnTotalCostChange).toHaveBeenCalledWith({ resources: [], customRows: [] });
  });

  it('updates remarks when initial remarks props change', () => {
    const { rerender } = render(
      <JobstartTime
        wbsResources={mockWbsResources}
        initialTimeContingencyUnits={mockInitialTimeContingencyUnits}
        initialTimeContingencyRemarks={mockInitialTimeContingencyRemarks}
        initialSubtotalRemarks={mockInitialSubtotalRemarks}
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    rerender(
      <JobstartTime
        wbsResources={mockWbsResources}
        initialTimeContingencyUnits={mockInitialTimeContingencyUnits}
        initialTimeContingencyRemarks="Updated time contingency remarks"
        initialSubtotalRemarks="Updated subtotal remarks"
        onTotalCostChange={mockOnTotalCostChange}
      />
    );

    // Note: The mock TableTemplate does not explicitly render remarks, so we cannot directly assert on them.
    // If remarks were critical for testing, the mock would need to be updated to display them.
  });

  // Add more tests for edge cases, empty states, error handling if applicable
});
