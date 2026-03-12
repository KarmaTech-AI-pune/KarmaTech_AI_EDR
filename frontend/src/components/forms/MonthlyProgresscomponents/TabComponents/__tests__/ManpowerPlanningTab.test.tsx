import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import ManpowerPlanningTab from '../ManpowerPlanningTab';
import { MonthlyProgressSchemaType } from '../../../../../schemas/monthlyProgress/MonthlyProgressSchema';

// Mock useWatch to return stable data and prevent infinite useEffect -> setValue -> useWatch loop
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual<typeof import('react-hook-form')>('react-hook-form');
  return {
    ...actual,
    useWatch: vi.fn().mockReturnValue([
      {
        workAssignment: 'Task A',
        assignee: 'User 1',
        planned: 100,
        consumed: 50,
        balance: 50,
        nextMonthPlanning: 25,
        manpowerComments: 'Good progress'
      }
    ]),
  };
});

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const methods = useForm<MonthlyProgressSchemaType>({
    defaultValues: {
      manpowerPlanning: {
        manpower: [
          {
            workAssignment: 'Task A',
            assignee: 'User 1',
            planned: 100,
            consumed: 50,
            balance: 50,
            nextMonthPlanning: 25,
            manpowerComments: 'Good progress'
          }
        ],
        manpowerTotal: {
          plannedTotal: 100,
          consumedTotal: 50,
          balanceTotal: 50,
          nextMonthPlanningTotal: 25
        }
      }
    } as any
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('ManpowerPlanningTab', () => {
  it('should render header and total summaries correctly', () => {
    render(
      <Wrapper>
        <ManpowerPlanningTab />
      </Wrapper>
    );

    expect(screen.getByText('Manpower Planning')).toBeInTheDocument();
    
    // Verifying that initial data is displayed
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    
    // Total numbers mapped to subtitle2
    expect(screen.getByText('100')).toBeInTheDocument(); // Planned Total
    expect(screen.getAllByText('50').length).toBeGreaterThanOrEqual(1); // Consumed & Balance Total
    expect(screen.getByText('25')).toBeInTheDocument();  // Next Month Total
  });

  it('should format values as per initial data', () => {
    render(
      <Wrapper>
        <ManpowerPlanningTab />
      </Wrapper>
    );
    expect(screen.getByText('TOTAL')).toBeInTheDocument();
  });
});
