import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProgrammeScheduleTab from './ProgrammeScheduleTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      programmeSchedule: []
    }
  });

  return (
    <FormProvider {...form}>
      {children}
    </FormProvider>
  );
};

describe('ProgrammeScheduleTab', () => {
  test('renders with empty state message', () => {
    render(
      <TestWrapper>
        <ProgrammeScheduleTab />
      </TestWrapper>
    );

    expect(screen.getByText('Programme Schedule')).toBeInTheDocument();
    expect(screen.getByText('No programme schedule entries. Click "Add" to get started.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  test('adds new row when Add button is clicked and exits edit mode on blur', () => {
    render(
      <TestWrapper>
        <ProgrammeScheduleTab />
      </TestWrapper>
    );

    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Should be in edit mode with a text area
    const textArea = screen.getByPlaceholderText('Enter programme description...');
    expect(textArea).toBeInTheDocument();

    // Exit edit mode by blurring the textarea
    fireEvent.blur(textArea);

    // Now the delete button should be visible
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('removes row when delete button is clicked', () => {
    render(
      <TestWrapper>
        <ProgrammeScheduleTab />
      </TestWrapper>
    );

    // Add a row first
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Exit edit mode to make delete button visible
    const textArea = screen.getByPlaceholderText('Enter programme description...');
    fireEvent.blur(textArea);

    // Delete the row
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Should show empty state again
    expect(screen.getByText('No programme schedule entries. Click "Add" to get started.')).toBeInTheDocument();
  });

  test('allows text input in programme description field', () => {
    render(
      <TestWrapper>
        <ProgrammeScheduleTab />
      </TestWrapper>
    );

    // Add a row
    const addButton = screen.getByRole('button', { name: /add/i });
    fireEvent.click(addButton);

    // Type in the text area
    const textArea = screen.getByPlaceholderText('Enter programme description...');
    fireEvent.change(textArea, { target: { value: 'Test programme description' } });

    expect(textArea).toHaveValue('Test programme description');
  });
});
