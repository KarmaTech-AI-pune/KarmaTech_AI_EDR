import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MonthlyReports } from './MonthlyReports';
import MonthlyReportDialog from '../dialogbox/MonthlyReportDialog';
import { MonthlyProgressAPI, MonthlyReport } from '../../services/monthlyProgressApi';
import { useProject } from '../../context/ProjectContext';
import { getMonthName } from '../../utils/dateUtils';

// Mock external dependencies
vi.mock('../dialogbox/MonthlyReportDialog', () => ({
  default: vi.fn(({ open, onClose, report }) => (
    <div data-testid="monthly-report-dialog">
      {open && <span>Monthly Report Dialog for {report?.month}/{report?.year}</span>}
      <button onClick={onClose}>Close Dialog</button>
    </div>
  )),
}));

vi.mock('../../services/monthlyProgressApi', () => ({
  MonthlyProgressAPI: {
    getMonthlyReports: vi.fn(),
  },
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('../../utils/dateUtils', () => ({
  getMonthName: vi.fn((month: string) => {
    const monthNames: { [key: string]: string } = {
      '1': 'January', '2': 'February', '3': 'March', '4': 'April',
      '5': 'May', '6': 'June', '7': 'July', '8': 'August',
      '9': 'September', '10': 'October', '11': 'November', '12': 'December'
    };
    return monthNames[month] || 'Unknown Month';
  }),
}));

// Type assertions for mocked functions
const mockMonthlyReportDialog = vi.mocked(MonthlyReportDialog);
const mockGetMonthlyReports = vi.mocked(MonthlyProgressAPI.getMonthlyReports);
const mockUseProject = vi.mocked(useProject);
const mockGetMonthName = vi.mocked(getMonthName);

const mockReports: MonthlyReport[] = [
  {
    id: 1,
    year: 2023,
    month: '1',
    projectId: 1,
    financialAndContractDetails: { net: 100, serviceTax: 10, feeTotal: 110, budgetOdcs: 50, budgetStaff: 50, budgetSubTotal: 100, contractType: 'lumpsum' },
    actualCost: { priorCumulativeOdc: 10, priorCumulativeStaff: 10, priorCumulativeTotal: 20, actualOdc: 5, actualStaff: 5, actualSubtotal: 10, totalCumulativeOdc: 15, totalCumulativeStaff: 15, totalCumulativeCost: 30 },
    ctcAndEac: { ctcODC: 10, ctcStaff: 10, ctcSubtotal: 20, actualCtcSubtotal: 20, eacOdc: 15, eacStaff: 15, totalEAC: 30, grossProfitPercentage: 50 },
    schedule: { dateOfIssueWOLOI: '2023-01-01', completionDateAsPerContract: '2023-12-31', completionDateAsPerExtension: '2024-01-31', expectedCompletionDate: '2024-01-31' },
    budgetTable: { originalBudget: { revenueFee: 100, cost: 50, profitPercentage: 50 }, currentBudgetInMIS: { revenueFee: 110, cost: 55, profitPercentage: 50 }, percentCompleteOnCosts: { revenueFee: 50, cost: 50 } },
    manpowerPlanning: { manpower: [], manpowerTotal: { plannedTotal: 0, consumedTotal: 0, balanceTotal: 0, nextMonthPlanningTotal: 0 } },
    progressDeliverable: { deliverables: [], totalPaymentDue: 0 },
    changeOrder: [],
    programmeSchedule: [],
    earlyWarnings: [],
    lastMonthActions: [],
    currentMonthActions: [],
  },
  {
    id: 2,
    year: 2023,
    month: '2',
    projectId: 1,
    financialAndContractDetails: { net: 200, serviceTax: 10, feeTotal: 220, budgetOdcs: 60, budgetStaff: 60, budgetSubTotal: 120, contractType: 'timeAndExpense' },
    actualCost: { priorCumulativeOdc: 20, priorCumulativeStaff: 20, priorCumulativeTotal: 40, actualOdc: 10, actualStaff: 10, actualSubtotal: 20, totalCumulativeOdc: 30, totalCumulativeStaff: 30, totalCumulativeCost: 60 },
    ctcAndEac: { ctcODC: 20, ctcStaff: 20, ctcSubtotal: 40, actualCtcSubtotal: 40, eacOdc: 30, eacStaff: 30, totalEAC: 60, grossProfitPercentage: 60 },
    schedule: { dateOfIssueWOLOI: '2023-02-01', completionDateAsPerContract: '2024-01-31', completionDateAsPerExtension: '2024-02-29', expectedCompletionDate: '2024-02-29' },
    budgetTable: { originalBudget: { revenueFee: 200, cost: 100, profitPercentage: 50 }, currentBudgetInMIS: { revenueFee: 220, cost: 110, profitPercentage: 50 }, percentCompleteOnCosts: { revenueFee: 60, cost: 60 } },
    manpowerPlanning: { manpower: [], manpowerTotal: { plannedTotal: 0, consumedTotal: 0, balanceTotal: 0, nextMonthPlanningTotal: 0 } },
    progressDeliverable: { deliverables: [], totalPaymentDue: 0 },
    changeOrder: [],
    programmeSchedule: [],
    earlyWarnings: [],
    lastMonthActions: [],
    currentMonthActions: [],
  },
];

describe('MonthlyReports', () => {
  const mockProjectId = 'proj123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn() });
    mockGetMonthlyReports.mockResolvedValue(mockReports);
    mockGetMonthName.mockImplementation((month: string) => {
      const monthNames: { [key: string]: string } = {
        '1': 'January', '2': 'February', '3': 'March', '4': 'April',
        '5': 'May', '6': 'June', '7': 'July', '8': 'August',
        '9': 'September', '10': 'October', '11': 'November', '12': 'December'
      };
      return monthNames[month] || 'Unknown Month';
    });
  });

  it('should render correctly and load monthly reports', async () => {
    render(<MonthlyReports />);

    expect(screen.getByText('Monthly Reports')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Loading initially

    await waitFor(() => {
      expect(mockGetMonthlyReports).toHaveBeenCalledWith(mockProjectId);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('January 2023 Report')).toBeInTheDocument();
      expect(screen.getByText('February 2023 Report')).toBeInTheDocument();
      expect(screen.getAllByRole('button', { name: 'PDF' })).toHaveLength(2);
      expect(screen.getAllByRole('button', { name: 'Excel' })).toHaveLength(2);
    });
  });

  it('should display a loading spinner when reports are being fetched', () => {
    mockGetMonthlyReports.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockReports), 100)));
    render(<MonthlyReports />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should display an error message if fetching reports fails', async () => {
    mockGetMonthlyReports.mockRejectedValue(new Error('API Error'));
    render(<MonthlyReports />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch monthly reports.')).toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should display no reports message if no reports are returned', async () => {
    mockGetMonthlyReports.mockResolvedValue([]);
    render(<MonthlyReports />);

    await waitFor(() => {
      expect(screen.queryByText('January 2023 Report')).not.toBeInTheDocument();
      expect(screen.queryByText('February 2023 Report')).not.toBeInTheDocument();
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should open MonthlyReportDialog when PDF button is clicked', async () => {
    render(<MonthlyReports />);
    await waitFor(() => expect(mockGetMonthlyReports).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: 'PDF' })[0]);

    expect(mockMonthlyReportDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        report: mockReports[0],
      }),
      {}
    );
    expect(screen.getByText(`Monthly Report Dialog for ${mockReports[0].month}/${mockReports[0].year}`)).toBeInTheDocument();
  });

  it('should open MonthlyReportDialog when Excel button is clicked', async () => {
    render(<MonthlyReports />);
    await waitFor(() => expect(mockGetMonthlyReports).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: 'Excel' })[0]);

    expect(mockMonthlyReportDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        report: mockReports[0],
      }),
      {}
    );
    expect(screen.getByText(`Monthly Report Dialog for ${mockReports[0].month}/${mockReports[0].year}`)).toBeInTheDocument();
  });

  it('should close MonthlyReportDialog when onClose is called', async () => {
    render(<MonthlyReports />);
    await waitFor(() => expect(mockGetMonthlyReports).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: 'PDF' })[0]);
    expect(screen.getByText(`Monthly Report Dialog for ${mockReports[0].month}/${mockReports[0].year}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close Dialog' }));
    expect(screen.queryByText(`Monthly Report Dialog for ${mockReports[0].month}/${mockReports[0].year}`)).not.toBeInTheDocument();
  });

  it('should display a warning if no projectId is available', async () => {
    mockUseProject.mockReturnValue({ projectId: undefined, setProjectId: vi.fn() });
    render(<MonthlyReports />);

    await waitFor(() => {
      expect(screen.getByText('No project selected')).toBeInTheDocument();
    });
    expect(mockGetMonthlyReports).not.toHaveBeenCalled();
  });
});
