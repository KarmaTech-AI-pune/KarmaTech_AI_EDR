import {  describe, it, expect } from 'vitest';
// import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobstartGrandTotal from './JobstartGrandTotal';
import { formatToIndianNumber } from '../../../utils/numberFormatting';

describe('JobstartGrandTotal', () => {
  const mockTimeCost = 15000.50;
  const mockOdcExpensesCost = 25000.75;
  const expectedGrandTotal = formatToIndianNumber(mockTimeCost + mockOdcExpensesCost);

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

  it('formats the grand total with Indian number formatting', () => {
    render(
      <JobstartGrandTotal
        timeCost={1234567.89}
        odcExpensesCost={9876543.21}
      />
    );

    const expectedFormattedTotal = formatToIndianNumber(1234567.89 + 9876543.21);
    expect(screen.getByText('GRAND TOTAL')).toBeInTheDocument();
    expect(screen.getByText(expectedFormattedTotal)).toBeInTheDocument();
  });

  // Add more tests if there are specific interactions or edge-case handling, or outdated tests.
});

