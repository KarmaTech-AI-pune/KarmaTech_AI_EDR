import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LastMonthActionsTab from './LastMonthActionsTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import * as dateUtils from '../../../../utils/dateUtils';

// Mock the utility functions
vi.mock('../../../../utils/dateUtils', () => ({
  formatDateForInput: vi.fn(),
  parseDateFromInput: vi.fn(),
}));

const TestWrapper: React.FC<{ children: React.ReactNode; defaultValues?: Partial<MonthlyProgressSchemaType> }> = ({
  children,
  defaultValues,
}) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      lastMonthActions: [
        {
          actions: 'Completed requirements gathering',
          date: '2026-03-01',
          comments: 'All stakeholders approved',
        },
      ],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('LastMonthActionsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dateUtils.formatDateForInput as any).mockImplementation((date: any) => {
      if (!date) return '';
      if (typeof date === 'string' && date.includes('-')) return date; // Already in YYYY-MM-DD
      return '2026-03-01';
    });
    (dateUtils.parseDateFromInput as any).mockImplementation((val: string) => val);
  });

  it('renders the component', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getAllByText(/Last Month Actions/i)[0]).toBeInTheDocument();
  });

  it('renders action fields by placeholder', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/Action Description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Comments/i)).toBeInTheDocument();
    // For the date field, we can find it by its type
  });

  it('renders with default values', () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Completed requirements gathering')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All stakeholders approved')).toBeInTheDocument();
  });

  it('allows editing action fields', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByPlaceholderText(/Action Description/i) as HTMLInputElement;
    fireEvent.change(actionsField, { target: { value: 'Updated action' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('Updated action');
    });
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const paperElement = container.querySelector('.MuiPaper-root');
    expect(paperElement).toBeInTheDocument();
  });

  it('renders fields in a Table layout', () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const table = container.querySelector('.MuiTable-root');
    expect(table).toBeInTheDocument();
  });

  it('handles date field changes', async () => {
    const { container } = render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const dateField = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateField).toBeInTheDocument();
    
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

    const commentsField = screen.getByPlaceholderText(/Comments/i) as HTMLInputElement;
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

    const actionsField = screen.getByPlaceholderText(/Action Description/i) as HTMLInputElement;
    const commentsField = screen.getByPlaceholderText(/Comments/i) as HTMLInputElement;

    fireEvent.change(actionsField, { target: { value: 'Action 1' } });
    fireEvent.change(commentsField, { target: { value: 'Comment 1' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('Action 1');
      expect(commentsField.value).toBe('Comment 1');
    });
  });

  it('allows clearing field values', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByPlaceholderText(/Action Description/i) as HTMLInputElement;
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

    expect(screen.getByText(/No last month actions/i)).toBeInTheDocument();
  });

  it('adds a new row when the "Add Row" button is clicked', async () => {
    render(
      <TestWrapper
        defaultValues={{
          lastMonthActions: [],
        }}
      >
        <LastMonthActionsTab />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /Add Row/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Action Description/i)).toBeInTheDocument();
    });
  });

  it('removes a row when the delete button is clicked', async () => {
    render(
      <TestWrapper>
        <LastMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Completed requirements gathering')).toBeInTheDocument();

    const deleteButton = screen.getByTestId('DeleteIcon').parentElement as HTMLButtonElement;
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Completed requirements gathering')).not.toBeInTheDocument();
    });
  });
});

