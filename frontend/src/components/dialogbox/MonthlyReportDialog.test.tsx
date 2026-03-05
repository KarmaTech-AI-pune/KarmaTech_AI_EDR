// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import MonthlyReportDialog from './MonthlyReportDialog';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
// Import the actual modules to be mocked
import { exportToExcel } from '../../services/excelExportService';
import { useProject} from '../../context/ProjectContext'; // Corrected import for ProjectContext
import { MonthlyProgressAPI, MonthlyReport } from '../../services/monthlyProgressApi';
import { getMonthName } from '../../utils/dateUtils';

// Mock external dependencies using the imported modules
vi.mock('../../services/excelExportService', () => ({
  exportToExcel: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('../../services/monthlyProgressApi', () => ({
  MonthlyProgressAPI: {
    getMonthlyReportByYearMonth: vi.fn(),
  },
}));

vi.mock('../../utils/dateUtils', () => ({
  getMonthName: vi.fn(),
}));

// Import mocked functions using vi.mocked
const mockExportToExcel = vi.mocked(exportToExcel);
const mockUseProject = vi.mocked(useProject);
const mockGetMonthlyReportByYearMonth = vi.mocked(MonthlyProgressAPI.getMonthlyReportByYearMonth);
const mockGetMonthName = vi.mocked(getMonthName);

// Mock data
// Providing a more complete mock for MonthlyReport to satisfy the type requirements.
// Corrected properties based on TypeScript errors.
const mockReportData = {
  year: 2023,
  month: '07', // July
  financialAndContractDetails: {
    net: 10000,
    serviceTax: 1800,
    feeTotal: 11800,
    budgetOdcs: 5000,
    budgetStaff: 6000,
    budgetSubTotal: 11000,
    contractType: 'lumpsum',
    // ... other properties of financialAndContractDetails if needed
  },
  actualCost: { // Corrected type for actualCost
    priorCumulativeTotal: 0,
    actualSubtotal: 7000,
    totalCumulativeOdc: 1000,
    totalCumulativeStaff: 2000,
    totalCumulativeCost: 3000,
    priorCumulativeOdc: 0,
    priorCumulativeStaff: 0,
    actualOdc: 1500,
    actualStaff: 2500,
  },
  ctcAndEac: { // Corrected properties for ctcAndEac
    ctcODC: 5000,
    ctcStaff: 6000,
    ctcSubtotal: 11000,
    actualCtcSubtotal: 7000,
    eacOdc: 5500,
    eacStaff: 6500,
    totalEAC: 12000,
    grossProfitPercentage: 10,
    actualctcODC: 5200,
    actualCtcStaff: 6200,
  },
  schedule: { // Corrected properties for schedule
    dateOfIssueWOLOI: '2023-01-01',
    completionDateAsPerContract: '2023-12-31',
    completionDateAsPerExtension: null,
    expectedCompletionDate: '2023-11-30',
  },

  currentMonthActions: [],
  lastMonthActions: [],
  risks: [],
  issues: [],
  keyDecisions: [],
  changeRequests: [],
  // Add any other required properties for MonthlyReport
} as unknown as MonthlyReport;

const mockBlob = new Blob(['excel content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
const mockUrl = 'blob:http://localhost/mock-url';

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  report: mockReportData,
};

describe('MonthlyReportDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useProject context with required properties
    mockUseProject.mockReturnValue({
      projectId: 'mock-project-id',
      setProjectId: vi.fn(), // Mock the required setProjectId function
    } as any); // Cast to any because ProjectContext is a value, not a type

    // Mock getMonthName
    mockGetMonthName.mockReturnValue('July');

    // Mock exportToExcel to return a Blob
    mockExportToExcel.mockReturnValue(mockBlob);

    // Mock MonthlyProgressAPI.getMonthlyReportByYearMonth
    mockGetMonthlyReportByYearMonth.mockResolvedValue(mockReportData);

    // Mock window.URL.createObjectURL and document.createElement for download simulation
    vi.spyOn(window.URL, 'createObjectURL').mockReturnValue(mockUrl);
    vi.spyOn(document.body, 'appendChild');
    vi.spyOn(document.body, 'removeChild');
    vi.spyOn(window.URL, 'revokeObjectURL');
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  it('should render correctly with provided report data', () => {
    render(<MonthlyReportDialog {...defaultProps} />);
    
    expect(screen.getByText('July 2023 Report')).toBeInTheDocument();
    expect(screen.getByText('Please choose an action for the July 2023 report.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Preview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download' })).not.toBeDisabled();
  });

  it('should not render if report prop is null', async () => {
    render(<MonthlyReportDialog {...defaultProps} report={null} />);
    await waitFor(() => expect(screen.queryByText('July 2023 Report')).not.toBeInTheDocument());
  });

  it('should call onClose when the close button is clicked', () => {
    render(<MonthlyReportDialog {...defaultProps} />);
    
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when the Preview button is clicked', () => {
    render(<MonthlyReportDialog {...defaultProps} />);
    
    const previewButton = screen.getByRole('button', { name: 'Preview' });
    fireEvent.click(previewButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(mockGetMonthlyReportByYearMonth).not.toHaveBeenCalled(); // Preview doesn't fetch data
  });

  it('should handle download successfully', async () => {
    render(<MonthlyReportDialog {...defaultProps} />);
    
    const downloadButton = screen.getByRole('button', { name: 'Download' });
    fireEvent.click(downloadButton);
    
    // Check if loading state is shown
    expect(screen.getByRole('button', { name: 'Downloading...' })).toBeInTheDocument();
    expect(downloadButton).toBeDisabled();

    await waitFor(() => {
      expect(mockGetMonthlyReportByYearMonth).toHaveBeenCalledWith('mock-project-id', 2023, 7);
      expect(mockExportToExcel).toHaveBeenCalledWith(mockReportData);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1); // Dialog should close on successful download
      expect(screen.queryByText('Downloading...')).not.toBeInTheDocument(); // Loading state removed
    }, { timeout: 5000 });
  });

  it('should display error message if download fails', async () => {
    const errorMessage = 'Download failed';
    mockGetMonthlyReportByYearMonth.mockRejectedValue(new Error(errorMessage));

    render(<MonthlyReportDialog {...defaultProps} />);
    
    const downloadButton = screen.getByRole('button', { name: 'Download' });
    fireEvent.click(downloadButton);
    
    await waitFor(() => {
      expect(screen.getByText('Download failed. Please try again.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download' })).not.toBeDisabled(); // Button should be re-enabled
      expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on error
    });
  });

  it('should disable buttons and prevent closing when downloading', async () => {
    // Delay resolution to keep isDownloading true
    mockGetMonthlyReportByYearMonth.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockReportData), 1000)));

    render(<MonthlyReportDialog {...defaultProps} />);
    
    const downloadButton = screen.getByRole('button', { name: 'Download' });
    fireEvent.click(downloadButton);

    // Wait for the download to start (button becomes disabled)
    await waitFor(() => expect(downloadButton).toBeDisabled());

    // Try to close the dialog using the close button
    const closeButton = screen.getByLabelText(/close/i);
    fireEvent.click(closeButton);
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Should not close due to disableEscapeKeyDown and check in handleClose

    // Wait for download to finish (optional, but clean up potentially)
    // await waitFor(() => expect(defaultProps.onClose).toHaveBeenCalled());
  });
});








