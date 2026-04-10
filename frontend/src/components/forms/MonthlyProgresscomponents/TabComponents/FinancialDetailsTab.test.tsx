import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FinancialDetailsTab from './FinancialDetailsTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';

const TestWrapper: React.FC<{ children: React.ReactNode; defaultValues?: Partial<MonthlyProgressSchemaType> }> = ({
  children,
  defaultValues,
}) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      financialAndContractDetails: {
        net: 1000,
        serviceTax: 10,
        feeTotal: 1100,
        budgetOdcs: 200,
        budgetStaff: 300,
        budgetSubTotal: 500,
        contractType: 'lumpsum',
      },
      actualCost: {
        priorCumulativeTotal: null,
        actualSubtotal: null,
        totalCumulativeOdc: null,
        totalCumulativeStaff: null,
        totalCumulativeCost: null,
      },
      ctcAndEac: {
        ctcODC: null,
        ctcStaff: null,
        ctcSubtotal: null,
        actualctcODC: null,
        actualCtcStaff: null,
        actualCtcSubtotal: null,
        eacOdc: null,
        eacStaff: null,
        totalEAC: null,
        grossProfitPercentage: null,
      },
      schedule: {
        dateOfIssueWOLOI: null,
        completionDateAsPerContract: null,
        completionDateAsPerExtension: null,
        expectedCompletionDate: null,
      },
      budgetTable: {
        originalBudget: { revenueFee: null, cost: null, profitPercentage: null },
        currentBudgetInMIS: { revenueFee: null, cost: null, profitPercentage: null },
        percentCompleteOnCosts: { revenueFee: null, cost: null },
      },
      manpowerPlanning: {
        manpower: [],
        manpowerTotal: {
          plannedTotal: null,
          consumedTotal: null,
          approvedTotal: null,
          extraHoursTotal: null,
          extraCostTotal: null,
          paymentTotal: null,
          balanceTotal: null,
          nextMonthPlanningTotal: null,
        },
      },
      progressDeliverable: {
        deliverables: [],
        totalPaymentDue: null,
      },
      changeOrder: [],
      programmeSchedule: [],
      earlyWarnings: [],
      lastMonthActions: [],
      currentMonthActions: [],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('FinancialDetailsTab', () => {
  it('renders the component', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Fees/i)).toBeInTheDocument();
  });

  it('renders financial fields', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Net/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Tax/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^Total$/i)[0]).toBeInTheDocument();
  });

  it('renders budget fields', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/ODCs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Staff/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sub Total/i)).toBeInTheDocument();
  });

  it('renders contract type select', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('displays default values', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    expect(netField.value).toBe('₹1,000');
  });



  it('renders with null values', () => {
    render(
      <TestWrapper
        defaultValues={{
          financialAndContractDetails: {
            net: null,
            serviceTax: null,
            feeTotal: null,
            budgetOdcs: null,
            budgetStaff: null,
            budgetSubTotal: null,
            contractType: 'lumpsum',
          },
        }}
      >
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Fees/i)).toBeInTheDocument();
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders fields in a Grid layout', () => {
    const { container } = render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const gridContainers = container.querySelectorAll('[class*="MuiGrid"]');
    expect(gridContainers.length).toBeGreaterThan(0);
  });



  it('renders with different contract types', () => {
    render(
      <TestWrapper
        defaultValues={{
          financialAndContractDetails: {
            net: 1000,
            serviceTax: 10,
            feeTotal: 1100,
            budgetOdcs: 200,
            budgetStaff: 300,
            budgetSubTotal: 500,
            contractType: 'timeAndExpense',
          },
        }}
      >
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Fees/i)).toBeInTheDocument();
  });

  it('renders numeric input fields', () => {
    const { container } = render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const inputFields = container.querySelectorAll('input[type="text"]');
    expect(inputFields.length).toBeGreaterThan(0);
  });

  it('displays contract type options', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Lumpsum/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Time & Expense/i)).toBeInTheDocument();
  });

  it('renders with zero values', () => {
    render(
      <TestWrapper
        defaultValues={{
          financialAndContractDetails: {
            net: 0,
            serviceTax: 0,
            feeTotal: 0,
            budgetOdcs: 0,
            budgetStaff: 0,
            budgetSubTotal: 0,
            contractType: 'lumpsum',
          },
        }}
      >
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    expect(netField.value).toBe('₹0');
  });
});
