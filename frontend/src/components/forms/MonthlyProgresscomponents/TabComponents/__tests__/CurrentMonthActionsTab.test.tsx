import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import CurrentMonthActionsTab from '../CurrentMonthActionsTab';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

// Wrapper to provide react-hook-form context
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      currentMonthActions: []
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('CurrentMonthActionsTab', () => {
  it('should render header and add row button', () => {
    render(
      <Wrapper>
        <CurrentMonthActionsTab />
      </Wrapper>
    );

    expect(screen.getByText('Current Month Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
  });

  it('should render empty state when no actions exist', () => {
    render(
      <Wrapper>
        <CurrentMonthActionsTab />
      </Wrapper>
    );

    expect(screen.getByText(/no current month actions/i)).toBeInTheDocument();
  });

  it('should add a row when "Add Row" is clicked', async () => {
    render(
      <Wrapper>
        <CurrentMonthActionsTab />
      </Wrapper>
    );

    const addButton = screen.getByRole('button', { name: /add row/i });
    fireEvent.click(addButton);

    // After adding a row, input fields should appear
    expect(screen.getByPlaceholderText('Action Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Comments')).toBeInTheDocument();
  });

  it('should remove a row when delete button is clicked', async () => {
    render(
      <Wrapper>
        <CurrentMonthActionsTab />
      </Wrapper>
    );

    const addButton = screen.getByRole('button', { name: /add row/i });
    fireEvent.click(addButton);

    expect(screen.getByPlaceholderText('Action Description')).toBeInTheDocument();

    const deleteIcon = screen.getByTestId('DeleteIcon');
    fireEvent.click(deleteIcon.closest('button')!);

    expect(screen.queryByPlaceholderText('Action Description')).not.toBeInTheDocument();
    expect(screen.getByText(/no current month actions/i)).toBeInTheDocument();
  });
});
