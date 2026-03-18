import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import ProgressReviewDeliverables from '../ProgressReviewDeliverables';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

vi.mock('../../../../../utils/numberFormatting', () => ({
  formatToIndianNumber: (num: number) => `₹${num}`
}));

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      progressDeliverable: {
        deliverables: [],
        totalPaymentDue: 0
      }
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ProgressReviewDeliverables', () => {
  it('should render header and add deliverable button', () => {
    render(
      <Wrapper>
        <ProgressReviewDeliverables />
      </Wrapper>
    );

    expect(screen.getByText('Progress Review Deliverables')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add deliverable/i })).toBeInTheDocument();
  });

  it('should render empty state initially', () => {
    render(
      <Wrapper>
        <ProgressReviewDeliverables />
      </Wrapper>
    );
    expect(screen.getByText(/no deliverables added yet/i)).toBeInTheDocument();
  });

  it('should add a row when "Add Deliverable" is clicked', () => {
    render(
      <Wrapper>
        <ProgressReviewDeliverables />
      </Wrapper>
    );

    fireEvent.click(screen.getByRole('button', { name: /add deliverable/i }));

    expect(screen.getByPlaceholderText('Enter milestone')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
  });

  it('should display total footer correctly', () => {
    render(
      <Wrapper>
        <ProgressReviewDeliverables />
      </Wrapper>
    );

    expect(screen.getByText(/Total: ₹0/i)).toBeInTheDocument();
  });
});
