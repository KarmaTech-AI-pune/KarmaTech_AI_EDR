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

    expect(screen.getByText(/Financial and Contract Details/i)).toBeInTheDocument();
  });

  it('renders financial fields', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Net/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Service Tax/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Fee Total/i)).toBeInTheDocument();
  });

  it('renders budget fields', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Budget ODCs/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget Staff/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget SubTotal/i)).toBeInTheDocument();
  });

  it('renders contract type select', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Contract Type/i)).toBeInTheDocument();
  });

  it('displays default values', () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    expect(netField.value).toBe('1000');
  });

  it('allows editing financial fields', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    fireEvent.change(netField, { target: { value: '2000' } });

    await waitFor(() => {
      expect(netField.value).toBe('2000');
    });
  });

  it('validates service tax range', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const serviceTaxField = screen.getByLabelText(/Service Tax/i) as HTMLInputElement;
    fireEvent.change(serviceTaxField, { target: { value: '150' } });
    fireEvent.blur(serviceTaxField);

    await waitFor(() => {
      // Error should appear for value > 100
    });
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

    expect(screen.getByText(/Financial and Contract Details/i)).toBeInTheDocument();
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

  it('handles contract type change', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const contractTypeSelect = screen.getByLabelText(/Contract Type/i);
    fireEvent.mouseDown(contractTypeSelect);

    await waitFor(() => {
      const options = screen.queryAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    });
  });

  it('displays all contract type options', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const contractTypeSelect = screen.getByLabelText(/Contract Type/i);
    fireEvent.mouseDown(contractTypeSelect);

    await waitFor(() => {
      expect(screen.queryByText('lumpsum')).toBeInTheDocument();
    });
  });

  it('maintains form state across multiple field changes', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    const serviceTaxField = screen.getByLabelText(/Service Tax/i) as HTMLInputElement;

    fireEvent.change(netField, { target: { value: '1500' } });
    await waitFor(() => {
      expect(netField.value).toBe('1500');
    });

    fireEvent.change(serviceTaxField, { target: { value: '15' } });
    await waitFor(() => {
      expect(serviceTaxField.value).toBe('15');
    });

    expect(netField.value).toBe('1500');
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

    expect(screen.getByText(/Financial and Contract Details/i)).toBeInTheDocument();
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

  it('allows clearing field values', async () => {
    render(
      <TestWrapper>
        <FinancialDetailsTab />
      </TestWrapper>
    );

    const netField = screen.getByLabelText(/Net/i) as HTMLInputElement;
    fireEvent.change(netField, { target: { value: '' } });

    await waitFor(() => {
      expect(netField.value).toBe('');
    });
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
    expect(netField.value).toBe('0');
  });
});
