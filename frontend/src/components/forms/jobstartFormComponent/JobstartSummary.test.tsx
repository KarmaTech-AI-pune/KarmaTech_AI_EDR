import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobstartSummary from './JobstartSummary';

// Mocking utility functions
vi.mock('../../../utils/calculations', () => ({
  addCalculation: vi.fn((...args) => args.reduce((sum, current) => sum + current, 0)),
  percentageCalculation: vi.fn((percentage, total) => (percentage / 100) * total),
  getPercentage: vi.fn((partial, total) => total === 0 ? 0 : (partial / total) * 100),
}));

describe('JobstartSummary', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockGrandTotal = 30000;
  const mockInitialProjectFees = 50000;
  const mockInitialServiceTaxPercentage = 18;

  const mockOnDataChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with initial data', () => {
    render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    // Check initial values displayed
    expect(screen.getByDisplayValue('50000.00')).toBeInTheDocument(); // Project Fees (now input)
    expect(screen.getByDisplayValue('18')).toBeInTheDocument(); // Service Tax Percentage

    // Check calculated values
    // Profit = 50000 - 30000 = 20000
    // Profit Percentage = (20000 / 50000) * 100 = 40%
    // Service Tax Amount = 18% of 50000 = 9000
    // Total Project Fees = 50000 + 9000 = 59000
    expect(screen.getByText('20,000.00')).toBeInTheDocument(); // Profit
    expect(screen.getByText('40.00%')).toBeInTheDocument(); // Profit Percentage
    expect(screen.getByText('9,000.00')).toBeInTheDocument(); // Service Tax Amount
    expect(screen.getByText('59,000.00')).toBeInTheDocument(); // Total Project Fees
  });

  it('updates calculations and calls onDataChange when Project Fees change', () => {
    render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    const projectFeesInput = screen.getByDisplayValue('50000.00');
    fireEvent.change(projectFeesInput, { target: { value: '60000' } });
    fireEvent.blur(projectFeesInput);

    // Wait for calculations to update
    // Profit = 60000 - 30000 = 30000
    // Profit Percentage = (30000 / 60000) * 100 = 50%
    // Service Tax Amount = 18% of 60000 = 10800
    // Total Project Fees = 60000 + 10800 = 70800

    expect(screen.getByText('30,000.00')).toBeInTheDocument(); // Profit
    expect(screen.getByText('50.00%')).toBeInTheDocument(); // Profit Percentage
    expect(screen.getByText('10,800.00')).toBeInTheDocument(); // Service Tax Amount
    expect(screen.getByText('70,800.00')).toBeInTheDocument(); // Total Project Fees

    // Check if onDataChange was called with updated values
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      projectFees: 60000,
      serviceTaxPercentage: 18,
      serviceTaxAmount: 10800,
      totalProjectFees: 70800,
      profit: 30000,
      profitPercentage: 50,
    }));
  });

  it('updates calculations and calls onDataChange when Service Tax Percentage changes', () => {
    render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    const serviceTaxInput = screen.getByDisplayValue('18');
    fireEvent.change(serviceTaxInput, { target: { value: '20' } });
    fireEvent.blur(serviceTaxInput); // Trigger blur to handle formatting

    // Wait for calculations to update
    // Profit = 50000 - 30000 = 20000 (remains same)
    // Profit Percentage = 40% (remains same)
    // Service Tax Amount = 20% of 50000 = 10000
    // Total Project Fees = 50000 + 10000 = 60000

    expect(screen.getByText('20,000.00')).toBeInTheDocument(); // Profit
    expect(screen.getByText('40.00%')).toBeInTheDocument(); // Profit Percentage
    expect(screen.getByText('10,000.00')).toBeInTheDocument(); // Service Tax Amount
    expect(screen.getByText('60,000.00')).toBeInTheDocument(); // Total Project Fees

    // Check if onDataChange was called with updated values
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      projectFees: 50000,
      serviceTaxPercentage: 20,
      serviceTaxAmount: 10000,
      totalProjectFees: 60000,
      profit: 20000,
      profitPercentage: 40,
    }));
  });

  it('handles empty service tax input by setting it to 0', () => {
    render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    const serviceTaxInput = screen.getByDisplayValue('18');
    fireEvent.change(serviceTaxInput, { target: { value: '' } });
    fireEvent.blur(serviceTaxInput); // Trigger blur

    // Check if service tax is displayed as 0 and calculations are updated accordingly
    expect(screen.getByDisplayValue('0')).toBeInTheDocument(); // Service Tax Percentage
    
    // Service Tax Amount = 0% of 50000 = 0
    // Total Project Fees = 50000 + 0 = 50000

    expect(screen.getByText('50,000.00')).toBeInTheDocument(); // Total Project Fees
    
    // Specifically find the Service Tax row's amount
    const serviceTaxRow = screen.getByText('Service Tax (GST)').closest('tr');
    expect(serviceTaxRow).toHaveTextContent('0.00');

    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      serviceTaxPercentage: 0,
      serviceTaxAmount: 0,
      totalProjectFees: 50000,
    }));
  });

  it('handles invalid input in service tax by keeping previous value', () => {
    render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    const serviceTaxInput = screen.getByDisplayValue('18');
    mockOnDataChange.mockClear(); // Clear the initial mount call
    fireEvent.change(serviceTaxInput, { target: { value: 'abc' } }); // Invalid input
    fireEvent.blur(serviceTaxInput); // Trigger blur

    // Expect the input to retain its previous value (18) and calculations to remain unchanged
    expect(screen.getByDisplayValue('18')).toBeInTheDocument();
    expect(screen.getByText('9,000.00')).toBeInTheDocument(); // Service Tax Amount
    expect(screen.getByText('59,000.00')).toBeInTheDocument(); // Total Project Fees
    
    const calls = mockOnDataChange.mock.calls;
    calls.forEach(call => {
      expect(call[0].serviceTaxPercentage).not.toBeNaN();
      expect(typeof call[0].serviceTaxPercentage).toBe('number');
    });
  });

  it('updates calculations when grandTotal prop changes', () => {
    const { rerender } = render(
      <JobstartSummary
        grandTotal={mockGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    const newGrandTotal = 40000;
    rerender(
      <JobstartSummary
        grandTotal={newGrandTotal}
        initialProjectFees={mockInitialProjectFees}
        initialServiceTaxPercentage={mockInitialServiceTaxPercentage}
        onDataChange={mockOnDataChange}
      />
    );

    // Profit = 50000 - 40000 = 10000
    // Profit Percentage = (10000 / 50000) * 100 = 20%
    expect(screen.getByText('10,000.00')).toBeInTheDocument(); // Profit
    expect(screen.getByText('20.00%')).toBeInTheDocument(); // Profit Percentage

    // Check if onDataChange was called with updated profit values
    expect(mockOnDataChange).toHaveBeenCalledWith(expect.objectContaining({
      profit: 10000,
      profitPercentage: 20,
    }));
  });

  it('handles zero project fees correctly', () => {
    render(
      <JobstartSummary
        grandTotal={10000}
        initialProjectFees={0}
        initialServiceTaxPercentage={18}
        onDataChange={mockOnDataChange}
      />
    );

    // Profit = 0 - 10000 = -10000
    // Profit Percentage = 0% (handled by getPercentage)
    // Service Tax Amount = 18% of 0 = 0
    // Total Project Fees = 0 + 0 = 0

    expect(screen.getByText('-10,000.00')).toBeInTheDocument(); // Profit
    expect(screen.getByText('0.00%')).toBeInTheDocument(); // Profit Percentage
    
    // Using closest('tr') to check specific rows for '0.00'
    const projectFeesRow = screen.getByText('PROJECT FEES').closest('tr');
    const projectFeesInput = within(projectFeesRow!).getByRole('textbox');
    expect(projectFeesInput).toHaveValue('0.00');

    const totalFeesRow = screen.getByText('TOTAL PROJECT FEES(Incl.tax)').closest('tr');
    expect(totalFeesRow).toHaveTextContent('0.00');
  });
});
