import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EarlyWarningsTab from '../EarlyWarningsTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      earlyWarnings: []
    }
  });

  return (
    <FormProvider {...form}>
      {children}
    </FormProvider>
  );
};

describe('EarlyWarningsTab', () => {
  test('renders with empty state message', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    expect(screen.getByText('Early Warnings')).toBeInTheDocument();
    expect(screen.getByText('Warning Description')).toBeInTheDocument();
    expect(screen.getByText('No early warnings. Click "Add Row" to get started.')).toBeInTheDocument();
    expect(screen.getByText('Add Row')).toBeInTheDocument();
  });

  test('adds new row when Add Row button is clicked', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add Row');
    fireEvent.click(addButton);

    // Should have a text area for warning description
    expect(screen.getByPlaceholderText('Enter warning description...')).toBeInTheDocument();
    
    // Should have a delete button
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  test('removes row when delete button is clicked', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    // Add a row first
    const addButton = screen.getByText('Add Row');
    fireEvent.click(addButton);

    // Verify row exists
    expect(screen.getByPlaceholderText('Enter warning description...')).toBeInTheDocument();

    // Delete the row
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    // Should show empty state again
    expect(screen.getByText('No early warnings. Click "Add Row" to get started.')).toBeInTheDocument();
  });

  test('allows text input in warning description field', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    // Add a row
    const addButton = screen.getByText('Add Row');
    fireEvent.click(addButton);

    // Type in the text area
    const textArea = screen.getByPlaceholderText('Enter warning description...');
    fireEvent.change(textArea, { target: { value: 'Test warning description' } });

    expect(textArea).toHaveValue('Test warning description');
  });
});
