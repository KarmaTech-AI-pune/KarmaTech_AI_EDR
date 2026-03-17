import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ProgressReviewDeliverables from './ProgressReviewDeliverables';
import { MonthlyProgressSchema, MonthlyProgressSchemaType } from '../../../../schemas/monthlyProgress/MonthlyProgressSchema';
import * as dateUtils from '../../../../utils/dateUtils';
import * as numberFormatting from '../../../../utils/numberFormatting';

// Mock the utility functions
jest.mock('../../../../utils/dateUtils');
jest.mock('../../../../utils/numberFormatting');
jest.mock('../../../../hooks/useCurrencyInput', () => ({
  useCurrencyInput: (value: any, name: string) => ({
    value: value?.toString() || '',
    getChangeHandler: (callback: (val: number) => void) => (e: any) => {
      const numValue = parseFloat(e.target.value) || 0;
      callback(numValue);
    }
  })
}));

// Setup default mock implementations
beforeEach(() => {
  (dateUtils.formatDateForInput as jest.Mock).mockImplementation((date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  });

  (dateUtils.parseDateFromInput as jest.Mock).mockImplementation((dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr);
  });

  (numberFormatting.formatToIndianNumber as jest.Mock).mockImplementation((num) => {
    return num?.toString() || '0';
  });
});

const TestWrapper: React.FC<{ children: React.ReactNode; defaultValues?: Partial<MonthlyProgressSchemaType> }> = ({
  children,
  defaultValues
}) => {
  const form = useForm<MonthlyProgressSchemaType>({
    resolver: zodResolver(MonthlyProgressSchema),
    defaultValues: {
      schedule: {
        startDate: null,
        endDate: null,
        expectedCompletionDate: null,
      },
      deliverable: {
        deliverables: [],
      },
      progressDeliverable: {
        deliverables: defaultValues?.progressDeliverable?.deliverables || [],
        totalPaymentDue: defaultValues?.progressDeliverable?.totalPaymentDue || 0,
      },
      lastMonthAction: {
        actions: [],
      },
      currentMonthActi