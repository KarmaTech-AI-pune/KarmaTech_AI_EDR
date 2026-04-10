import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProgressReviewDeliverables from './ProgressReviewDeliverables';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import * as dateUtils from '../../../../utils/dateUtils';
import * as numberFormatting from '../../../../utils/numberFormatting';

// Mock the utility functions
vi.mock('../../../../utils/dateUtils', () => ({
  formatDateForInput: vi.fn(),
  parseDateFromInput: vi.fn(),
}));

vi.mock('../../../../utils/numberFormatting', () => ({
  formatToIndianNumber: vi.fn((num) => num?.toString() || '0'),
}));

vi.mock('../../../../hooks/useCurrencyInput', () => ({
  useCurrencyInput: vi.fn((value) => ({
    value: value?.toString() || '',
    getChangeHandler: (callback: (val: number) => void) => (e: any) => {
      const numValue = parseFloat(e.target.value) || 0;
      callback(numValue);
    }
  })),
}));

const TestWrapper: React.FC<{ children: React.ReactNode; defaultValues?: Partial<MonthlyProgressSchemaType> }> = ({
  children,
  defaultValues,
}) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      progressDeliverable: {
        deliverables: [],
        totalPaymentDue: 0,
      },
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('ProgressReviewDeliverables', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dateUtils.formatDateForInput as any).mockImplementation((date: any) => {
      if (!date) return '';
      return typeof date === 'string' ? date : '2026-03-24';
    });
  });

  it('renders the component and "Add Deliverable" button', () => {
    render(
      <TestWrapper>
        <ProgressReviewDeliverables />
      </TestWrapper>
    );

    expect(screen.getByText(/Progress Review Deliverables/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Deliverable/i })).toBeInTheDocument();
  });

  it('renders a table with headers', () => {
    render(
      <TestWrapper>
        <ProgressReviewDeliverables />
      </TestWrapper>
    );

    expect(screen.getByText('Milestone')).toBeInTheDocument();
    expect(screen.getByText('Due Date (Contract)')).toBeInTheDocument();
    expect(screen.getByText('Payment Due')).toBeInTheDocument();
  });

  it('shows empty state message when no deliverables are present', () => {
    render(
      <TestWrapper>
        <ProgressReviewDeliverables />
      </TestWrapper>
    );

    expect(screen.getByText(/No deliverables added yet/i)).toBeInTheDocument();
  });

  it('adds a new row when the "Add Deliverable" button is clicked', async () => {
    render(
      <TestWrapper>
        <ProgressReviewDeliverables />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /Add Deliverable/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Enter milestone/i)).toBeInTheDocument();
    });
  });

  it('removes a row when the delete button is clicked', async () => {
    const defaultValues: Partial<MonthlyProgressSchemaType> = {
      progressDeliverable: {
        deliverables: [
          {
            milestone: 'Test Milestone',
            dueDateContract: null,
            dueDatePlanned: null,
            achievedDate: null,
            paymentDue: 1000,
            invoiceDate: null,
            paymentReceivedDate: null,
            deliverableComments: '',
          },
        ],
        totalPaymentDue: 1000,
      },
    };

    render(
      <TestWrapper defaultValues={defaultValues}>
        <ProgressReviewDeliverables />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Test Milestone')).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: '' }); // The IconButton has DeleteIcon but likely no text
    // We should find it by its testid or icon if possible, but let's try generic first or use container
    
    const row = screen.getByDisplayValue('Test Milestone').closest('tr');
    const deleteBtn = row?.querySelector('button');
    if (deleteBtn) fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Test Milestone')).not.toBeInTheDocument();
    });
  });
});