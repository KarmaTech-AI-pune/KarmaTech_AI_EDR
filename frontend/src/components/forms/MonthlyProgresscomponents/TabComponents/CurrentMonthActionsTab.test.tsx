import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CurrentMonthActionsTab from './CurrentMonthActionsTab';
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
      lastMonthActions: [],
      currentMonthActions: [
        {
          actions: 'Complete design phase',
          date: '15-03-2026',
          comments: 'On schedule',
          priority: 'H',
        },
      ],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('CurrentMonthActionsTab', () => {
  it('renders the component', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Current Month Actions/i)).toBeInTheDocument();
  });

  it('renders action fields', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Actions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Comments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Priority/i)).toBeInTheDocument();
  });

  it('renders with default values', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Complete design phase')).toBeInTheDocument();
  });

  it('allows editing action fields', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByLabelText(/Actions/i) as HTMLInputElement;
    fireEvent.change(actionsField, { target: { value: 'New action' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('New action');
    });
  });

  it('renders priority select options', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const prioritySelect = screen.getByLabelText(/Priority/i);
    fireEvent.mouseDown(prioritySelect);

    await waitFor(() => {
      expect(screen.queryByText('H')).toBeInTheDocument();
      expect(screen.queryByText('M')).toBeInTheDocument();
      expect(screen.queryByText('L')).toBeInTheDocument();
    });
  });

  it('renders with null values', () => {
    render(
      <TestWrapper
        defaultValues={{
          currentMonthActions: [
            {
              actions: null,
              date: null,
              comments: null,
              priority: null,
            },
          ],
        }}
      >
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Current Month Actions/i)).toBeInTheDocument();
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders fields in a Grid layout', () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const gridContainers = container.querySelectorAll('[class*="MuiGrid"]');
    expect(gridContainers.length).toBeGreaterThan(0);
  });

  it('handles date field changes', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
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
        <CurrentMonthActionsTab />
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
        <CurrentMonthActionsTab />
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

  it('renders with different priority levels', () => {
    render(
      <TestWrapper
        defaultValues={{
          currentMonthActions: [
            {
              actions: 'Action',
              date: '15-03-2026',
              comments: 'Comment',
              priority: 'M',
            },
          ],
        }}
      >
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Current Month Actions/i)).toBeInTheDocument();
  });

  it('renders multiline text field for actions', () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const textareas = container.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThan(0);
  });

  it('allows clearing field values', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
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
          currentMonthActions: [],
        }}
      >
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/Current Month Actions/i)).toBeInTheDocument();
  });
});
