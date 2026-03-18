import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import LastMonthActionsTab from '../LastMonthActionsTab';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      lastMonthActions: []
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('LastMonthActionsTab', () => {
  it('should render header and add row button', () => {
    render(
      <Wrapper>
        <LastMonthActionsTab />
      </Wrapper>
    );

    expect(screen.getByText('Last Month Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
  });

  it('should render empty state initially', () => {
    render(
      <Wrapper>
        <LastMonthActionsTab />
      </Wrapper>
    );
    expect(screen.getByText(/no last month actions/i)).toBeInTheDocument();
  });

  it('should add a row when "Add Row" is clicked', () => {
    render(
      <Wrapper>
        <LastMonthActionsTab />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /add row/i }));

    expect(screen.getByPlaceholderText('Action Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Comments')).toBeInTheDocument();
  });

  it('should remove a row when delete button is clicked', () => {
    render(
      <Wrapper>
        <LastMonthActionsTab />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /add row/i }));
    const deleteIcon = screen.getByTestId('DeleteIcon');
    fireEvent.click(deleteIcon.closest('button')!);

    expect(screen.queryByPlaceholderText('Action Description')).not.toBeInTheDocument();
  });
});
