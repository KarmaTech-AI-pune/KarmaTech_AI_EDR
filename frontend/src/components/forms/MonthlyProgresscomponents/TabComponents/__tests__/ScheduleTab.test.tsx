import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import ScheduleTab from '../ScheduleTab';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      schedule: {
        dateOfIssueWOLOI: '2023-01-01',
        completionDateAsPerContract: '2023-12-31',
        completionDateAsPerExtension: '2024-06-30',
        expectedCompletionDate: '2024-03-31'
      }
    }
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ScheduleTab', () => {
  it('should render header and all date fields', () => {
    render(
      <Wrapper>
        <ScheduleTab />
      </Wrapper>
    );

    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByLabelText('Date of issue of WO/LOI')).toBeInTheDocument();
    expect(screen.getByLabelText('Completion Date (Contract)')).toBeInTheDocument();
    expect(screen.getByLabelText('Completion Date (Extension)')).toBeInTheDocument();
    expect(screen.getByLabelText('Expected Completion Date')).toBeInTheDocument();
  });

  it('should disable specific read-only fields', () => {
    render(
      <Wrapper>
        <ScheduleTab />
      </Wrapper>
    );

    // Some fields should be disabled/read-only
    const woDate = screen.getByLabelText('Date of issue of WO/LOI');
    expect(woDate).toBeDisabled();

    const expectedDate = screen.getByLabelText('Expected Completion Date');
    expect(expectedDate).not.toBeDisabled();
  });
});
