import {  describe, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EarlyWarningsTab from './EarlyWarningsTab';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema'; // Fixed: 4 levels up, not 6

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
    expect(screen.getByText('No early warnings. Click "Add Row" to get started.')).toBeInTheDocument();
    expect(screen.getByText('Add issue')).toBeInTheDocument(); // Fixed: button says "Add issue"
  });

  test('adds new row when Add issue button is clicked', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    const addButton = screen.getByText('Add issue');
    fireEvent.click(addButton);

    // Should have a text area for warning description (row is in edit mode)
    expect(screen.getByPlaceholderText('Enter warning description...')).toBeInTheDocument();
    
    // Note: Delete button is NOT visible while in edit mode
    // The row must be blurred first to show edit/delete buttons
  });

  test('removes row when delete button is clicked', async () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    // Add a row first
    const addButton = screen.getByText('Add issue');
    fireEvent.click(addButton);

    // Verify row exists
    const textArea = screen.getByPlaceholderText('Enter warning description...');
    expect(textArea).toBeInTheDocument();
    
    // Blur the text field to exit edit mode and show delete button
    fireEvent.blur(textArea);

    // Wait for the view mode to appear (Paper with description)
    await waitFor(() => {
      expect(screen.getByText('No description entered.')).toBeInTheDocument();
    });

    // Now find all buttons with delete icon - there should be one
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('[data-testid="DeleteIcon"]'));
    
    if (deleteButton) {
      fireEvent.click(deleteButton);
    } else {
      // Fallback: click the last button (should be delete)
      fireEvent.click(deleteButtons[deleteButtons.length - 1]);
    }

    // Should show empty state again
    await waitFor(() => {
      expect(screen.getByText('No early warnings. Click "Add Row" to get started.')).toBeInTheDocument();
    });
  });

  test('allows text input in warning description field', () => {
    render(
      <TestWrapper>
        <EarlyWarningsTab />
      </TestWrapper>
    );

    // Add a row
    const addButton = screen.getByText('Add issue');
    fireEvent.click(addButton);

    // Type in the text area
    const textArea = screen.getByPlaceholderText('Enter warning description...');
    fireEvent.change(textArea, { target: { value: 'Test warning description' } });

    expect(textArea).toHaveValue('Test warning description');
  });
});

