import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobstartGrandTotal from './JobstartGrandTotal';

describe('JobstartGrandTotal', () => {
  const mockTimeCost = 15000.50;
  const mockOdcExpensesCost = 25000.75;
  const expectedGrandTotal = (mockTimeCost + mockOdcExpensesCost).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  it('renders correctly with provided costs', () => {
    render(
      <JobstartGrandTotal
        timeCost={mockTimeCost}
        odcExpensesCost={mockOdcExpensesCost}
      />
    );

    // Check if the grand total is displayed correctly
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
    expect(screen.getByText(expectedGrandTotal)).toBeInTheDocument();
  });

  it('calculates grand total correctly when costs are zero', () => {
    render(
      <JobstartGrandTotal
        timeCost={0}
        odcExpensesCost={0}
      />
    );

    // Check if the grand total is displayed as 0.00
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
  });

  it('formats the grand total with commas and two decimal places', () => {
    render(
      <JobstartGrandTotal
        timeCost={1234567.89}
        odcExpensesCost={9876543.21}
      />
    );

    const expectedFormattedTotal = (1234567.89 + 9876543.21).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
    expect(screen.getByText(expectedFormattedTotal)).toBeInTheDocument();
  });

  // Add more tests if there are specific interactions or edge cases to cover
});
