import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ActualCost from './ActualCost';
import { FormProvider, useForm } from 'react-hook-form';

describe('ActualCost', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        actualCost: {
          priorCumulativeOdc: 1000,
          priorCumulativeStaff: 0,
          actualOdc: 500,
          actualStaff: 10,
        },
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renders correctly with default values from form context', () => {
    render(
      <Wrapper>
        <ActualCost />
      </Wrapper>
    );

    expect(screen.getByText('Prior Cumulative Actual Cost')).toBeInTheDocument();
    // ODC 1000 -> '1,000.00'
    expect(screen.getAllByDisplayValue('1,000.00').length).toBeGreaterThanOrEqual(1);
    // actualSubtotal = 500 + 10 = 510 -> '510.00'
    expect(screen.getByDisplayValue('510.00')).toBeInTheDocument();
  });

  it('calculates total cumulative ODC correctly', () => {
    render(
      <Wrapper>
        <ActualCost />
      </Wrapper>
    );

    // Total = Prior (1000) + actual (500) = 1500 -> '1,500.00'
    expect(screen.getByDisplayValue('1,500.00')).toBeInTheDocument();
  });
});
