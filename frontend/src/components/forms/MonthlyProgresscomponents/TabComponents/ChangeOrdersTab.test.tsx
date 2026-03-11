import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ChangeOrdersTab from './ChangeOrdersTab';
import { FormProvider, useForm } from 'react-hook-form';

describe('ChangeOrdersTab', () => {
  const Wrapper = ({ children, initialData = [] }: { children: React.ReactNode, initialData?: any[] }) => {
    const methods = useForm({
      defaultValues: {
        changeOrder: initialData,
      },
    });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };

  it('renders correctly with existing change orders', () => {
    const initialData = [
      { contractTotal: 1000, cost: 800, fee: 200, summaryDetails: 'Test CO', status: 'Approved' },
    ];
    render(
      <Wrapper initialData={initialData}>
        <ChangeOrdersTab />
      </Wrapper>
    );

    expect(screen.getByText('Change Orders')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test CO')).toBeInTheDocument();
  });

  it('adds a new row when Add Row button is clicked', () => {
    render(
      <Wrapper>
        <ChangeOrdersTab />
      </Wrapper>
    );

    // Specifically target the button to avoid ambiguity with text in the "No change orders" message
    const addButton = screen.getByRole('button', { name: /Add Row/i });
    fireEvent.click(addButton);

    // Should find at least one empty row now (not 'No change orders')
    expect(screen.queryByText(/No change orders/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1); // Header + 1 new row
  });

  it('removes a row when delete icon is clicked', () => {
    const initialData = [
      { contractTotal: 1000, cost: 800, fee: 200, summaryDetails: 'Test CO', status: 'Approved' },
    ];
    render(
      <Wrapper initialData={initialData}>
        <ChangeOrdersTab />
      </Wrapper>
    );

    const deleteButton = screen.getByTestId('DeleteIcon').parentElement as HTMLElement;
    fireEvent.click(deleteButton!);

    expect(screen.getByText(/No change orders/i)).toBeInTheDocument();
  });
});
