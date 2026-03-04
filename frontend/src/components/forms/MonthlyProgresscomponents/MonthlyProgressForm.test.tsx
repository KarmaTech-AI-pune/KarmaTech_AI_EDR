import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MonthlyProgressForm } from './MonthlyProgressForm';
import { useProject } from '../../../context/ProjectContext';
import { getMonthlyProgressData } from '../../../services/monthlyProgressDataService';

// Mock the external dependencies
vi.mock('../../../services/monthlyProgressApi', () => ({
  MonthlyProgressAPI: {
    submitMonthlyProgress: vi.fn(),
  },
}));

vi.mock('../../../services/monthlyProgressDataService', () => ({
  getMonthlyProgressData: vi.fn(),
}));

vi.mock('../../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

// Mock the heavy sub-components to keep unit test focused
vi.mock('./TabComponents/ActualCost', () => ({ default: () => <div data-testid="actual-cost-tab" /> }));
vi.mock('./TabComponents/ScheduleTab', () => ({ default: () => <div data-testid="schedule-tab" /> }));
vi.mock('./TabComponents/FinancialAndContractDetails', () => ({ default: () => <div data-testid="financial-tab" /> }));
vi.mock('./TabComponents/ProgressDeliverableTab', () => ({ default: () => <div data-testid="progress-tab" /> }));
vi.mock('./TabComponents/ProjectSummaryDetails', () => ({ default: () => <div data-testid="summary-tab" /> }));
vi.mock('./TabComponents/BudgetRevenueTab', () => ({ default: () => <div data-testid="budget-tab" /> }));
vi.mock('./TabComponents/ChangeOrdersTab', () => ({ default: () => <div data-testid="change-orders-tab" /> }));
vi.mock('./TabComponents/CostToCompleteAndEAC', () => ({ default: () => <div data-testid="ctc-tab" /> }));
// index.tsx might have different names
vi.mock('./index', () => ({
  FinancialDetailsTab: () => <div />,
  ActualCost: () => <div />,
  CostToCompleteAndEAC: () => <div />,
  ScheduleTab: () => <div />,
  ManpowerPlanningTab: () => <div />,
  BudgetRevenueTab: () => <div />,
  ProgressReviewDeliverables: () => <div />,
  ChangeOrdersTab: () => <div />,
  ProgrammeScheduleTab: () => <div />,
  EarlyWarningsTab: () => <div />,
  LastMonthActionsTab: () => <div />,
  CurrentMonthActionsTab: () => <div />,
}));

describe('MonthlyProgressForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useProject as any).mockReturnValue({
      projectId: '123',
    });
    (getMonthlyProgressData as any).mockResolvedValue({});
  });

  it('renders correctly and fetches data on mount', async () => {
    render(<MonthlyProgressForm />);
    
    await waitFor(() => {
      expect(screen.getByText(/Monthly Progress Review/i)).toBeInTheDocument();
    });
    
    expect(getMonthlyProgressData).toHaveBeenCalledWith('123', expect.any(Number), expect.any(Number));
  });
});
