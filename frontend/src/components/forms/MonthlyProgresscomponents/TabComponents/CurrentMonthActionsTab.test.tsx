import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CurrentMonthActionsTab from './CurrentMonthActionsTab';
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
      currentMonthActions: [
        {
          actions: 'Complete design phase',
          date: '2026-03-15',
          comments: 'High priority',
          priority: 'H',
        },
      ],
      ...defaultValues,
    },
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe('CurrentMonthActionsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (dateUtils.formatDateForInput as any).mockImplementation((date: any) => {
      if (!date) return '';
      if (typeof date === 'string' && date.includes('-')) return date;
      return '2026-03-15';
    });
    (dateUtils.parseDateFromInput as any).mockImplementation((val: string) => val);
  });

  it('renders the component', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getAllByText(/Current Month Actions/i)[0]).toBeInTheDocument();
  });

  it('renders action fields by placeholder', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText(/Action Description/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Comments/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('renders with default values', () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Complete design phase')).toBeInTheDocument();
    expect(screen.getByDisplayValue('High priority')).toBeInTheDocument();
    // Using getAllByText and checking the first one, or being more specific
    expect(screen.getByText(/^High$/i)).toBeInTheDocument(); 
  });

  it('allows editing action fields', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByPlaceholderText(/Action Description/i) as HTMLInputElement;
    fireEvent.change(actionsField, { target: { value: 'Updated current action' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('Updated current action');
    });
  });

  it('renders in a Paper component', () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument();
  });

  it('renders fields in a Table layout', () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(container.querySelector('.MuiTable-root')).toBeInTheDocument();
  });

  it('handles date field changes', async () => {
    const { container } = render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const dateField = container.querySelector('input[type="date"]') as HTMLInputElement;
    expect(dateField).toBeInTheDocument();
    
    fireEvent.change(dateField, { target: { value: '2026-04-01' } });

    await waitFor(() => {
      expect(dateField.value).toBe('2026-04-01');
    });
  });

  it('handles priority change attempt', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const prioritySelect = screen.getByRole('combobox');
    expect(prioritySelect).toBeInTheDocument();
    
    fireEvent.mouseDown(prioritySelect);
    // MUI Select uses portals, so we just verify the trigger interaction here for simplicity
  });

  it('handles comments field changes', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const commentsField = screen.getByPlaceholderText(/Comments/i) as HTMLInputElement;
    fireEvent.change(commentsField, { target: { value: 'Updated current comments' } });

    await waitFor(() => {
      expect(commentsField.value).toBe('Updated current comments');
    });
  });

  it('maintains form state across multiple field changes', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    const actionsField = screen.getByPlaceholderText(/Action Description/i) as HTMLInputElement;
    const commentsField = screen.getByPlaceholderText(/Comments/i) as HTMLInputElement;

    fireEvent.change(actionsField, { target: { value: 'Cur Action 1' } });
    fireEvent.change(commentsField, { target: { value: 'Cur Comment 1' } });

    await waitFor(() => {
      expect(actionsField.value).toBe('Cur Action 1');
      expect(commentsField.value).toBe('Cur Comment 1');
    });
  });

  it('allows clearing field values', async () => {
    render(
      <TestWrapper>
        <CurrentMonthActionsTab />
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
          currentMonthActions: [],
        }}
      >
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByText(/No current month actions/i)).toBeInTheDocument();
  });

  it('adds a new row when the "Add Row" button is clicked', async () => {
    render(
      <TestWrapper
        defaultValues={{
          currentMonthActions: [],
        }}
      >
        <CurrentMonthActionsTab />
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
        <CurrentMonthActionsTab />
      </TestWrapper>
    );

    expect(screen.getByDisplayValue('Complete design phase')).toBeInTheDocument();

    const deleteButton = screen.getByTestId('DeleteIcon').parentElement as HTMLButtonElement;
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByDisplayValue('Complete design phase')).not.toBeInTheDocument();
    });
  });
});
