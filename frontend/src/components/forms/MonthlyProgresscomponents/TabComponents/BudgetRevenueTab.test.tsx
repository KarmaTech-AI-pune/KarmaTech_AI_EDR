import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import BudgetRevenueTab from './BudgetRevenueTab';
import { FormProvider, useForm } from 'react-hook-form';

describe('BudgetRevenueTab', () => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        budgetTable: {
          originalBudget: {
             revenueFee: 10000,
             cost: 8000,
             profitPercentage: 20
          },
          currentBudgetInMIS: {
            revenueFee: 12000,
            cost: 9000,
            profitPercentage: 25
          },
          percentCompleteOnCosts: {
             revenueFee: 0,
             cost: 0
          }
        }
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renders correctly with default values from form context', () => {
    render(
      <Wrapper>
        <BudgetRevenueTab />
      </Wrapper>
    );

    expect(screen.getByText('Budget Revenue')).toBeInTheDocument();
    // Values are formatted, e.g., '10,000.00' or similar. 
    // In BudgetTextField, it's formatToIndianNumber(field.value).
    expect(screen.getByDisplayValue('10,000.00')).toBeInTheDocument();
  });

  const WrapperWithAllData = ({ children }: { children: React.ReactNode }) => {
    const methods = useForm({
      defaultValues: {
        budgetTable: {
          currentBudgetInMIS: {
            revenueFee: 1000,
            cost: 800,
          },
        },
        progressDeliverable: {
          totalPaymentDue: 500,
        },
        actualCost: {
          totalCumulativeCost: 400,
        },
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('calculates percent complete correctly', () => {
    render(
      <WrapperWithAllData>
        <BudgetRevenueTab />
      </WrapperWithAllData>
    );

    // Revenue % = (totalPaymentDue 500 / misRevenue 1000) * 100 = 50%
    // Cost % = (totalCumulativeActualCost 400 / misCost 800) * 100 = 50%
    
    // Display values will be '50.00'
    const percentInputs = screen.getAllByDisplayValue('50.00');
    expect(percentInputs.length).toBeGreaterThanOrEqual(2);
  });
});
