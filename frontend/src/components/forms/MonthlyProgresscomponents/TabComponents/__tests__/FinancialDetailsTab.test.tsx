import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import FinancialDetailsTab from '../FinancialDetailsTab';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

vi.mock('../../../../../utils/MonthlyProgress/monthlyProgressUtils', () => ({
  formatCurrency: (val: number) => `$${val}`
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      financialAndContractDetails: {
        net: 100,
        serviceTax: 5,
        feeTotal: 105,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'lumpsum'
      }
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FinancialDetailsTab', () => {
  it('should render all sections (Fees, Budget Costs, Contract Type)', () => {
    render(
      <Wrapper>
        <FinancialDetailsTab />
      </Wrapper>
    );

    expect(screen.getByText('Fees')).toBeInTheDocument();
    expect(screen.getByText('Budget Costs')).toBeInTheDocument();
    expect(screen.getByText('Contract Type')).toBeInTheDocument();
  });

  it('should render read-only currency fields formatted', () => {
    render(
      <Wrapper>
        <FinancialDetailsTab />
      </Wrapper>
    );

    const netInput = screen.getByLabelText('Net') as HTMLInputElement;
    expect(netInput.value).toBe('$100');

    const totalInput = screen.getByLabelText('Total') as HTMLInputElement;
    expect(totalInput.value).toBe('$105');
  });

  it('should render correct radio button selected based on context', () => {
    render(
      <Wrapper>
        <FinancialDetailsTab />
      </Wrapper>
    );

    const lumpsumRadio = screen.getByLabelText('Lumpsum') as HTMLInputElement;
    expect(lumpsumRadio.checked).toBe(true);
  });
});
