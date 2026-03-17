import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LastMonthActionsTab from './LastMonthActionsTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';

const TestWrapper: React.FC<{ children: React.ReactNode; defaultValues?: Partial<MonthlyProgressSchemaType> }> = ({
  children,
  defaultValues,
}) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      financialAndContractDetails: {
        net: null,
        serviceTax: null,
        feeTotal: null,
        budgetOdcs: null,
        budgetStaff: null,
        budgetSubTotal: null,
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
      lastMonthActions: [
        {
          actions: 'Completed requirements gathering',
          date: '01-03-2026',
          comments: 'All stakeholders approved',
        },
      ],
      currentMonthActions: [],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('LastMonthActionsTab', () => {
  it('renders the component', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Last Month Actions/i)).toBeInTheDocument();
  });

  it('renders action fields', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Actions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
  });

  it('renders with default values', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Completed requirements gathering')).toBeInTheDocument();
  });

  it('allows editing action fields', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByLabelText(/Actions/i) as HTMLInputElement;
    fireEvent.change(actionsField, { target: { value: 'Updated action' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('Updated action');
    });
  });

  it('renders with null values', () => {
    render(
      <TestWrapper
        defaultValues={{
          lastMonthActions: [
            {
              actions: null,
              date: null,
              comments: null,
            },
          ],
        }}
      >
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Last Month Actions/i)).toBeInTheDocument();
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders fields in a Grid layout', () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const gridContainers = container.querySelectorAll('[class*="MuiGrid"]');
    expect(gridContainers.length).toBeGreaterThan(0);
  });

  it('handles date field changes', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const dateField = screen.getByLabelText(/Date/i) as HTMLInputElement;
    fireEvent.change(dateField, { target: { value: '2025-12-25' } });

    await waitFor(() => {
      expect(dateField.value).toBe('2025-12-25');
    });
  });

  it('handles comments field changes', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const commentsField = screen.getByLabelText(/Comments/i) as HTMLInputElement;
    fireEvent.change(commentsField, { target: { value: 'Updated comments' } });

    await waitFor(() => {
      expect(commentsField.value).toBe('Updated comments');
    });
  });

  it('maintains form state across multiple field changes', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByLabelText(/Actions/i) as HTMLInputElement;
    const commentsField = screen.getByLabelText(/Comments/i) as HTMLInputElement;

    fireEvent.change(actionsField, { target: { value: 'Action 1' } });
    await waitFor(() => {
      expect(actionsField.value).toBe('Action 1');
    });

    fireEvent.change(commentsField, { target: { value: 'Comment 1' } });
    await waitFor(() => {
      expect(commentsField.value).toBe('Comment 1');
    });

    expect(actionsField.value).toBe('Action 1');
  });

  it('renders multiline text field for actions', () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('allows clearing field values', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByLabelText(/Actions/i) as HTMLInputElement;
    fireEvent.change(actionsField, { target: { value: '' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('');
    });
  });

  it('renders with empty actions array', () => {
    render(
      <TestWrapper
        defaultValues={{
          lastMonthActions: [],
        }}
      >
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Last Month Actions/i)).toBeInTheDocument();
  });

  it('renders with multiple actions', () => {
    render(
      <TestWrapper
        defaultValues={{
          lastMonthActions: [
            {
              actions: 'Action 1',
              date: '01-03-2026',
              comments: 'Comment 1',
            },
            {
              actions: 'Action 2',
              date: '02-03-2026',
              comments: 'Comment 2',
            },
          ],
        }}
      >
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Last Month Actions/i)).toBeInTheDocument();
  });

  it('renders with long text values', () => {
    const longText = 'A'.repeat(500);
    render(
      <TestWrapper
        defaultValues={{
          lastMonthActions: [
            {
              actions: longText,
              date: '01-03-2026',
              comments: longText,
            },
          ],
        }}
      >
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Last Month Actions/i)).toBeInTheDocument();
  });
});
