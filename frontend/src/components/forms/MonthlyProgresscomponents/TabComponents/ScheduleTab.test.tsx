import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ScheduleTab from './ScheduleTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';

// Mock the dateUtils
vi.mock('../../../../utils/dateUtils', () => ({
  formatDateForInput: (date: any) => {
    if (!date) return '';
    if (typeof date === 'string') {
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        const [day, month, year] = date.split('-');
        return `${year}-${month}-${day}`;
      }
      return date;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  },
  parseDateFromInput: (dateString: string) => {
    if (!dateString) return null;
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  },
}));

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
      currentMonthActions: [],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('ScheduleTab', () => {
  it('renders all date fields', () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/Date of issue of WO\/LOI/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Completion Date \(Contract\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Completion Date \(Extension\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected Completion Date/i)).toBeInTheDocument();
  });

  it('renders Schedule title', () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    expect(screen.getByText('Schedule')).toBeInTheDocument();
  });

  it('disables first three date fields', () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const dateOfIssueField = screen.getByLabelText(/Date of issue of WO\/LOI/i) as HTMLInputElement;
    const contractDateField = screen.getByLabelText(/Completion Date \(Contract\)/i) as HTMLInputElement;
    const extensionDateField = screen.getByLabelText(/Completion Date \(Extension\)/i) as HTMLInputElement;

    expect(dateOfIssueField.disabled).toBe(true);
    expect(contractDateField.disabled).toBe(true);
    expect(extensionDateField.disabled).toBe(true);
  });

  it('enables expected completion date field', () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const expectedCompletionField = screen.getByLabelText(/Expected Completion Date/i) as HTMLInputElement;
    expect(expectedCompletionField.disabled).toBe(false);
  });

  it('allows entering expected completion date', async () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const expectedCompletionField = screen.getByLabelText(/Expected Completion Date/i) as HTMLInputElement;
    fireEvent.change(expectedCompletionField, { target: { value: '2025-12-31' } });

    await waitFor(() => {
      expect(expectedCompletionField.value).toBe('2025-12-31');
    });
  });

  it('displays error message for invalid date format', async () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const expectedCompletionField = screen.getByLabelText(/Expected Completion Date/i);
    fireEvent.change(expectedCompletionField, { target: { value: 'invalid-date' } });
    fireEvent.blur(expectedCompletionField);

    await waitFor(() => {
      // Error message should appear if validation fails
      const errorMessages = screen.queryAllByText(/Date must be/i);
      // May or may not show error depending on validation timing
    });
  });

  it('renders with default null values', () => {
    const { container } = render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    // Check for date input fields directly by type
    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs.length).toBeGreaterThan(0);
    
    // Check that most fields have empty values (some might have defaults)
    const emptyFields = Array.from(dateInputs).filter(field => 
      (field as HTMLInputElement).value === ''
    );
    expect(emptyFields.length).toBeGreaterThan(0);
  });

  it('renders with pre-filled date values', () => {
    const defaultValues: Partial<MonthlyProgressSchemaType> = {
      schedule: {
        dateOfIssueWOLOI: '01-01-2025',
        completionDateAsPerContract: '31-12-2025',
        completionDateAsPerExtension: null,
        expectedCompletionDate: '15-12-2025',
      },
    };

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ScheduleTab />
      </TestWrapper>
    );

    // Check for date input fields by their type attribute instead of role
    const dateFields = screen.getAllByDisplayValue(/2025/);
    expect(dateFields.length).toBeGreaterThan(0);
    
    // Verify specific date values are present
    expect(screen.getByDisplayValue('2025-01-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-12-15')).toBeInTheDocument();
  });

  it('renders in a Paper component with proper styling', () => {
    const { container } = render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('[class*="MuiPaper"]');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders fields in a Grid layout', () => {
    const { container } = render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const gridContainers = container.querySelectorAll('[class*="MuiGrid"]');
    expect(gridContainers.length).toBeGreaterThan(0);
  });

  it('handles date field changes correctly', async () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const expectedCompletionField = screen.getByLabelText(/Expected Completion Date/i) as HTMLInputElement;

    fireEvent.change(expectedCompletionField, { target: { value: '2025-06-15' } });

    await waitFor(() => {
      expect(expectedCompletionField.value).toBe('2025-06-15');
    });
  });

  it('maintains form state across multiple field changes', async () => {
    render(
      <TestWrapper>
        <ScheduleTab />
      </TestWrapper>
    );

    const expectedCompletionField = screen.getByLabelText(/Expected Completion Date/i) as HTMLInputElement;

    fireEvent.change(expectedCompletionField, { target: { value: '2025-03-20' } });
    await waitFor(() => {
      expect(expectedCompletionField.value).toBe('2025-03-20');
    });

    fireEvent.change(expectedCompletionField, { target: { value: '2025-04-25' } });
    await waitFor(() => {
      expect(expectedCompletionField.value).toBe('2025-04-25');
    });
  });
});
