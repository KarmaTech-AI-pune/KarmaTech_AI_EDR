import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import CostToCompleteAndEAC from './CostToCompleteAndEAC';
import { FormProvider, useForm } from 'react-hook-form';

describe('CostToCompleteAndEAC', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        financialAndContractDetails: {
          net: 100000,
          budgetOdcs: 20000,
          budgetStaff: 50000,
        },
        actualCost: {
          totalCumulativeOdc: 5000,
          totalCumulativeStaff: 10000,
          totalCumulativeCost: 15000,
        },
        ctcAndEac: {
            actualctcODC: null,
            actualCtcStaff: null,
        }
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renders correctly and calculates initial CTC values', () => {
    render(
      <Wrapper>
        <CostToCompleteAndEAC />
      </Wrapper>
    );

    expect(screen.getByText('CTC')).toBeInTheDocument();
    
    // CTC ODC = Budget ODC (20000) - Cumulative ODC (5000) = 15000
    // Values are formatted as '15,000.00'
    const values = screen.getAllByDisplayValue('15,000.00');
    expect(values.length).toBeGreaterThanOrEqual(2);
    const staffValues = screen.getAllByDisplayValue('40,000.00'); // CTC Staff (50k - 10k)
    expect(staffValues.length).toBeGreaterThan(0);
  });

  it('calculates EAC and Gross Profit correctly when actual CTC is null', () => {
     render(
      <Wrapper>
        <CostToCompleteAndEAC />
      </Wrapper>
    );

    // EAC ODCs = Budget ODCs = 20000
    // EAC Staff = Budget StaffIndex = 50000
    // Total EAC = 70000
    expect(screen.getByDisplayValue('70,000.00')).toBeInTheDocument();
    
    // Gross Profit % = (Net 100000 - Total EAC 70000) / Net 100000 = 30 -> '30.00'
    expect(screen.getByDisplayValue('30.00')).toBeInTheDocument();
  });
});
