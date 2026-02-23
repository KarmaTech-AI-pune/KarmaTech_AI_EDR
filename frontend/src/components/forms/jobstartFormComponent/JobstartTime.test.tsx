import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobstartTime from './JobstartTime';
import { WBSResource } from '../../../types/jobStartFormTypes';

// Mocking dependencies
vi.mock('./TableTemplate', () => ({
  __esModule: true,
  default: vi.fn(({ title, headerTitle, resources,  customRows, onDataChange }) => (
    <div data-testid="mock-table-template">
      <h3>{title}</h3>
      <h4>{headerTitle}</h4>
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

vi.mock('../../../utils/calculations', () => ({
  addCalculation: vi.fn((...args: number[]) => args.reduce((sum, current) => sum + current, 0)),
  percentageCalculation: vi.fn((percentage: number, total: number) => (percentage / 100) * total),
}));

describe('JobstartTime', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockWbsResources: WBSResource[] = [
    { id: '1', name: 'Manpower A', budgetedCost: 5000, units: 50, taskType: 0, description: 'Manpower A Desc', rate: 100, remarks: 'Manpower A Remarks' },
    { id: '2', name: 'Manpower B', budgetedCost: 7500, units: 75, taskType: 0, description: 'Manpower B Desc', rate: 100, remarks: 'Manpower B Remarks' },
  ];

  const mockInitialTimeContingencyUnits = 15;
  const mockInitialTimeContingencyRemarks = 'Initial time contingency remarks';
  const mockInitialSubtotalRemarks = 'Initial subtotal remarks';
  const mockOnTotalCostChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly and calculates initial totals', () => {
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

    // In jsdom, useEffect might run immediately after render depending on the environment setup.
    // We check for the final calculated values.
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

    const simulateButton = screen.getByText('Simulate Data Change');
    fireEvent.click(simulateButton);

    expect(mockOnTotalCostChange).toHaveBeenCalled();
  });
});
