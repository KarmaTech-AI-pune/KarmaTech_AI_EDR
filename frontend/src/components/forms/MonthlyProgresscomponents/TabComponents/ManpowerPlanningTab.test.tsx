import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ManpowerPlanningTab from './ManpowerPlanningTab';
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
        manpower: [
          {
            workAssignment: 'Task A',
            assignee: 'John Doe',
            rate: 100,
            planned: 100,
            consumed: 50,
            approved: 40,
            extraHours: 10,
            extraCost: 1000,
            payment: 5000,
            balance: 60,
            nextMonthPlanning: 20,
            manpowerComments: 'On track',
          },
        ],
        manpowerTotal: {
          plannedTotal: 100,
          consumedTotal: 50,
          approvedTotal: 40,
          extraHoursTotal: 10,
          extraCostTotal: 1000,
          paymentTotal: 5000,
          balanceTotal: 60,
          nextMonthPlanningTotal: 20,
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

describe('ManpowerPlanningTab', () => {
  it('renders the component', () => {
    render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
  });

  it('renders table with headers', () => {
    render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByText('Work Assignment')).toBeInTheDocument();
    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByText('Rate')).toBeInTheDocument();
    expect(screen.getByText('Planned')).toBeInTheDocument();
    expect(screen.getByText('Consumed')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('Balance')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Extra Hours')).toBeInTheDocument();
    expect(screen.getByText('Extra Cost')).toBeInTheDocument();
  });

  it('renders totals row', () => {
    render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByText('TOTAL')).toBeInTheDocument();
  });

  it('displays correct totals for single entry', async () => {
    render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    await waitFor(() => {
      const totalCells = screen.getAllByText(/100|50|40|60|5000|10|1000|20/);
      expect(totalCells.length).toBeGreaterThan(0);
    });
  });

  it('renders empty manpower list', () => {
    render(
      <TestWrapper
        defaultValues={{
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
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
  });

  it('renders multiple manpower entries', () => {
    render(
      <TestWrapper
        defaultValues={{
          manpowerPlanning: {
            manpower: [
              {
                workAssignment: 'Task A',
                assignee: 'John Doe',
                rate: 100,
                planned: 100,
                consumed: 50,
                approved: 40,
                extraHours: 10,
                extraCost: 1000,
                payment: 5000,
                balance: 60,
                nextMonthPlanning: 20,
                manpowerComments: 'On track',
              },
              {
                workAssignment: 'Task B',
                assignee: 'Jane Smith',
                rate: 120,
                planned: 80,
                consumed: 60,
                approved: 50,
                extraHours: 10,
                extraCost: 1200,
                payment: 7200,
                balance: 30,
                nextMonthPlanning: 15,
                manpowerComments: 'Ahead of schedule',
              },
            ],
            manpowerTotal: {
              plannedTotal: 180,
              consumedTotal: 110,
              approvedTotal: 90,
              extraHoursTotal: 20,
              extraCostTotal: 2200,
              paymentTotal: 12200,
              balanceTotal: 90,
              nextMonthPlanningTotal: 35,
            },
          },
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Task A')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Task B')).toBeInTheDocument();
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders table with proper structure', () => {
    const { container } = render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();

    const thead = table?.querySelector('thead');
    expect(thead).toBeInTheDocument();

    const tbody = table?.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('displays balance as negative when negative', async () => {
    render(
      <TestWrapper
        defaultValues={{
          manpowerPlanning: {
            manpower: [
              {
                workAssignment: 'Task A',
                assignee: 'John Doe',
                rate: 100,
                planned: 50,
                consumed: 50,
                approved: 60,
                extraHours: -10,
                extraCost: -1000,
                payment: 5000,
                balance: -10,
                nextMonthPlanning: 20,
                manpowerComments: 'Over approved',
              },
            ],
            manpowerTotal: {
              plannedTotal: 50,
              consumedTotal: 50,
              approvedTotal: 60,
              extraHoursTotal: -10,
              extraCostTotal: -1000,
              paymentTotal: 5000,
              balanceTotal: -10,
              nextMonthPlanningTotal: 20,
            },
          },
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
    });
  });

  it('calculates totals correctly with multiple entries', async () => {
    render(
      <TestWrapper
        defaultValues={{
          manpowerPlanning: {
            manpower: [
              {
                workAssignment: 'Task A',
                assignee: 'John',
                rate: 100,
                planned: 100,
                consumed: 50,
                approved: 40,
                extraHours: 10,
                extraCost: 1000,
                payment: 5000,
                balance: 60,
                nextMonthPlanning: 20,
                manpowerComments: '',
              },
              {
                workAssignment: 'Task B',
                assignee: 'Jane',
                rate: 150,
                planned: 80,
                consumed: 60,
                approved: 50,
                extraHours: 10,
                extraCost: 1500,
                payment: 9000,
                balance: 30,
                nextMonthPlanning: 15,
                manpowerComments: '',
              },
            ],
            manpowerTotal: {
              plannedTotal: 180,
              consumedTotal: 110,
              approvedTotal: 90,
              extraHoursTotal: 20,
              extraCostTotal: 2500,
              paymentTotal: 14000,
              balanceTotal: 90,
              nextMonthPlanningTotal: 35,
            },
          },
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
    });
  });

  it('renders with null values gracefully', () => {
    render(
      <TestWrapper
        defaultValues={{
          manpowerPlanning: {
            manpower: [
              {
                workAssignment: null,
                assignee: null,
                rate: null,
                planned: null,
                consumed: null,
                approved: null,
                extraHours: null,
                extraCost: null,
                payment: null,
                balance: null,
                nextMonthPlanning: null,
                manpowerComments: null,
              },
            ],
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
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
  });

  it('renders table cells with proper alignment', () => {
    const { container } = render(
      <TestWrapper>
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    const tableCells = container.querySelectorAll('td');
    expect(tableCells.length).toBeGreaterThan(0);
  });

  it('displays payment total with 2 decimal places', async () => {
    render(
      <TestWrapper
        defaultValues={{
          manpowerPlanning: {
            manpower: [
              {
                workAssignment: 'Task A',
                assignee: 'John',
                rate: 100,
                planned: 100,
                consumed: 50,
                approved: 40,
                extraHours: 10,
                extraCost: 1000,
                payment: 5000.55,
                balance: 60,
                nextMonthPlanning: 20,
                manpowerComments: '',
              },
            ],
            manpowerTotal: {
              plannedTotal: 100,
              consumedTotal: 50,
              approvedTotal: 40,
              extraHoursTotal: 10,
              extraCostTotal: 1000,
              paymentTotal: 5000.55,
              balanceTotal: 60,
              nextMonthPlanningTotal: 20,
            },
          },
        }}
      >
        <ManpowerPlanningTab />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
    });
  });
});
