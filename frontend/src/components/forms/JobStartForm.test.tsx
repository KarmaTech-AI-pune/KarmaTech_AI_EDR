import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import JobStartForm from './JobStartForm';
import JobstartTime from './jobstartFormComponent/JobstartTime';
import EstimatedExpenses from './jobstartFormComponent/EstimatedExpenses';
import JobstartGrandTotal from './jobstartFormComponent/JobstartGrandTotal';
import JobstartSummary from './jobstartFormComponent/JobstartSummary';
import JobStartFormHeader from './jobstartFormComponent/JobStartFormHeader';
import LoadingButton from '../common/LoadingButton';
import { getWBSResourceData, submitJobStartForm, updateJobStartForm, getJobStartFormByProjectId } from '../../services/jobStartFormApi';
import { projectApi } from '../../services/projectApi';
import { useProject } from '../../context/ProjectContext';
import { WBSResource } from '../../types/jobStartFormTypes';
import { Project } from '../../models/projectModel';
import { SimpleJobStartFormData } from '../../services/jobStartFormApi'; // Import SimpleJobStartFormData

// Mock external dependencies
vi.mock('../../services/jobStartFormApi', () => ({
  getWBSResourceData: vi.fn(),
  submitJobStartForm: vi.fn(),
  updateJobStartForm: vi.fn(),
  getJobStartFormByProjectId: vi.fn(),
}));

vi.mock('../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('./jobstartFormComponent/JobstartTime', () => ({
  default: vi.fn(({ onTotalCostChange }) => (
    <div data-testid="jobstart-time">
      Jobstart Time
      <button onClick={() => onTotalCostChange({ resources: [], customRows: [{ id: 'time-subtotal', budgetedCost: 100 }, { id: 'time-contingencies', budgetedCost: 10 }] })}>Update Time Cost</button>
    </div>
  )),
}));

vi.mock('./jobstartFormComponent/EstimatedExpenses', () => ({
  default: vi.fn(({ onTotalCostChange }) => (
    <div data-testid="estimated-expenses">
      Estimated Expenses
      <button onClick={() => onTotalCostChange({ resources: [], customRows: [{ id: 'expenses-subtotal', budgetedCost: 50 }, { id: 'expenses-contingencies', budgetedCost: 5 }, { id: 'expenses-expense-contingencies', budgetedCost: 2 }] })}>Update Expenses Cost</button>
    </div>
  )),
}));

vi.mock('./jobstartFormComponent/JobstartGrandTotal', () => ({
  default: vi.fn(({ timeCost, odcExpensesCost }) => (
    <div data-testid="jobstart-grand-total">Grand Total: {timeCost + odcExpensesCost}</div>
  )),
}));

vi.mock('./jobstartFormComponent/JobstartSummary', () => ({
  default: vi.fn(({ onDataChange }) => (
    <div data-testid="jobstart-summary">
      Jobstart Summary
      <button onClick={() => onDataChange({ projectFees: 1000, serviceTaxPercentage: 18, serviceTaxAmount: 180, totalProjectFees: 1180, profit: 100, profitPercentage: 10 })}>Update Summary</button>
    </div>
  )),
}));

vi.mock('./jobstartFormComponent/JobStartFormHeader', () => ({
  default: vi.fn(({ title, status, editMode, onEditModeToggle, onStatusUpdate }) => (
    <div data-testid="jobstart-form-header">
      {title} - Status: {status} - Edit Mode: {editMode ? 'On' : 'Off'}
      <button onClick={onEditModeToggle}>Toggle Edit Mode</button>
      <button onClick={() => onStatusUpdate('Sent for Review')}>Update Status</button>
    </div>
  )),
}));

vi.mock('../common/LoadingButton', () => ({
  default: vi.fn(({ onClick, disabled, loading, text, loadingText }) => (
    <button onClick={onClick} disabled={disabled} data-testid="loading-button">
      {loading ? loadingText : text}
    </button>
  )),
}));

// Type assertions for mocked functions
const mockGetWBSResourceData = vi.mocked(getWBSResourceData);
const mockSubmitJobStartForm = vi.mocked(submitJobStartForm);
const mockUpdateJobStartForm = vi.mocked(updateJobStartForm);
const mockGetJobStartFormByProjectId = vi.mocked(getJobStartFormByProjectId);
const mockProjectApiGetById = vi.mocked(projectApi.getById);
const mockUseProject = vi.mocked(useProject);

const mockWBSResources: WBSResource[] = [
  { id: '1', taskType: 0, description: 'Task A', rate: 10, units: 10, budgetedCost: 100, remarks: '', employeeName: 'Emp A', name: 'Emp A' },
  { id: '2', taskType: 1, description: 'ODC B', rate: 5, units: 20, budgetedCost: 100, remarks: '', employeeName: null, name: 'ODC B' },
];

const mockProjectData: Project = {
  id: '123',
  name: 'Test Project',
  estimatedProjectFee: 5000,
  projectManagerId: 'pm1',
  seniorProjectManagerId: 'spm1',
  regionalManagerId: 'rm1',
  status: 0,
  projectNo: 'P-001',
  typeOfJob: 'Development',
  sector: 'IT',
  clientName: 'Client A',
  typeOfClient: 'Enterprise',
  estimatedProjectCost: 10000,
  currency: 'USD',
  letterOfAcceptance: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  feeType: 'Fixed',
};

const mockExistingFormData: SimpleJobStartFormData = {
  formId: 1,
  projectId: '123',
  time: { totalTimeCost: 110 },
  expenses: { totalExpenses: 57 },
  grandTotal: 167,
  projectFees: 1000,
  serviceTax: { percentage: 18, amount: 180 },
  serviceTaxPercentage: 18,
  serviceTaxAmount: 180,
  totalProjectFees: 1180,
  profit: 100,
  profitPercentage: 10,
  status: 'Approved',
  formTitle: 'Existing Job Start Form',
  description: 'Description of existing form',
  startDate: '2023-01-01T00:00:00Z',
  preparedBy: 'Existing User',
  selections: [],
  resources: [
    { wbsTaskId: null, name: 'time-subtotal', remarks: 'Existing time subtotal remarks', taskType: 0, description: 'Sub-Total', rate: 0, units: 0, budgetedCost: 0 },
    { wbsTaskId: null, name: 'time-contingencies', units: 15, remarks: 'Existing time contingencies remarks', taskType: 0, description: 'Time Contingencies (LS)', rate: 0, budgetedCost: 0 },
    { wbsTaskId: null, name: 'expenses-subtotal', remarks: 'Existing expenses subtotal remarks', taskType: 1, description: 'Sub-Total', rate: 0, units: 0, budgetedCost: 0 },
    { wbsTaskId: null, name: 'expenses-contingencies', units: 10, remarks: 'Existing expenses contingencies remarks', taskType: 1, description: 'Contingencies (LS)', rate: 0, budgetedCost: 0 },
    { wbsTaskId: null, name: 'expenses-expense-contingencies', units: 5, remarks: 'Existing expense contingencies remarks', taskType: 1, description: 'Expense Contingencies (LS)', rate: 0, budgetedCost: 0 },
  ],
};

describe('JobStartForm', () => {
  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn() });
    mockGetWBSResourceData.mockResolvedValue({ resourceAllocations: mockWBSResources });
    mockProjectApiGetById.mockResolvedValue(mockProjectData);
    mockGetJobStartFormByProjectId.mockResolvedValue([]); // Default: no existing form
    mockSubmitJobStartForm.mockResolvedValue({ formId: 1 });
    mockUpdateJobStartForm.mockResolvedValue(undefined);

    // Mock console.error to prevent test output pollution
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should render correctly and load WBS resources', async () => {
    render(<JobStartForm />);

    expect(screen.getByText('PMD1. Job Start Form')).toBeInTheDocument();
    expect(screen.getByText('Jobstart Time')).toBeInTheDocument();
    expect(screen.getByText('Estimated Expenses')).toBeInTheDocument();
    expect(screen.getByText('Jobstart Summary')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetWBSResourceData).toHaveBeenCalledWith(mockProjectId);
      expect(mockProjectApiGetById).toHaveBeenCalledWith(mockProjectId);
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined, setProjectId: vi.fn() });
    render(<JobStartForm />);
    expect(screen.getByText('No project selected')).toBeInTheDocument();
    expect(mockGetWBSResourceData).not.toHaveBeenCalled();
  });

  it('should display error message if data fetching fails', async () => {
    mockGetWBSResourceData.mockRejectedValue(new Error('Failed to fetch WBS data'));
    render(<JobStartForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load data. Please try again later.')).toBeInTheDocument();
    });
  });

  it('should initialize project fees from projectApi if no existing form', async () => {
    render(<JobStartForm />);
    await waitFor(() => expect(mockProjectApiGetById).toHaveBeenCalledWith(mockProjectId));
    // The JobstartSummary mock will receive this initial value
    expect(JobstartSummary).toHaveBeenCalledWith(
      expect.objectContaining({ initialProjectFees: mockProjectData.estimatedProjectFee }),
      {}
    );
  });

  it('should load existing form data and set edit mode to false if status is approved', async () => {
    mockGetJobStartFormByProjectId.mockResolvedValue([mockExistingFormData]);
    render(<JobStartForm />);

    await waitFor(() => {
      expect(screen.getByText('PMD1. Job Start Form - Status: Approved - Edit Mode: Off')).toBeInTheDocument();
      expect(screen.getByTestId('loading-button')).toBeDisabled(); // Submit button disabled
    });
  });

  it('should update total costs from sub-components', async () => {
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Update Time Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Expenses Cost' }));

    await waitFor(() => {
      expect(screen.getByText('Grand Total: 167')).toBeInTheDocument(); // 100+10 + 50+5+2
    });
  });

  it('should handle form submission (create new form)', async () => {
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Update Time Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Expenses Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Summary' })); // Update summary data

    fireEvent.click(screen.getByTestId('loading-button')); // Click Submit Form

    await waitFor(() => {
      expect(mockSubmitJobStartForm).toHaveBeenCalledTimes(1);
      expect(mockSubmitJobStartForm).toHaveBeenCalledWith(
        mockProjectId,
        expect.objectContaining({
          projectId: Number(mockProjectId),
          grandTotal: 167,
          projectFees: 1000,
          resources: expect.arrayContaining([
            expect.objectContaining({ name: 'time-subtotal', budgetedCost: 100 }),
            expect.objectContaining({ name: 'expenses-contingencies', budgetedCost: 5 }),
          ]),
        })
      );
      expect(screen.getByText('Job Start Form submitted successfully')).toBeInTheDocument();
      expect(screen.getByTestId('loading-button')).toHaveTextContent('Update Form'); // Button text changes to Update
    });
  });

  it('should handle form submission (update existing form)', async () => {
    mockGetJobStartFormByProjectId.mockResolvedValue([mockExistingFormData]);
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Update Time Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Expenses Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Summary' }));

    fireEvent.click(screen.getByTestId('loading-button')); // Click Update Form

    await waitFor(() => {
      expect(mockUpdateJobStartForm).toHaveBeenCalledTimes(1);
      expect(mockUpdateJobStartForm).toHaveBeenCalledWith(
        mockProjectId,
        mockExistingFormData.formId,
        expect.objectContaining({
          projectId: Number(mockProjectId),
          grandTotal: 167,
          projectFees: 1000,
        })
      );
      expect(screen.getByText('Job Start Form updated successfully')).toBeInTheDocument();
    });
  });

  it('should display error snackbar if submission fails', async () => {
    mockSubmitJobStartForm.mockRejectedValue(new Error('Submission failed'));
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Update Time Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Expenses Cost' }));
    fireEvent.click(screen.getByRole('button', { name: 'Update Summary' }));

    fireEvent.click(screen.getByTestId('loading-button'));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit Job Start Form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should toggle edit mode via header button', async () => {
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    const toggleButton = screen.getByRole('button', { name: 'Toggle Edit Mode' });
    fireEvent.click(toggleButton);
    expect(screen.getByText('PMD1. Job Start Form - Status: Initial - Edit Mode: On')).toBeInTheDocument(); // Initial state is edit mode on
    fireEvent.click(toggleButton);
    expect(screen.getByText('PMD1. Job Start Form - Status: Initial - Edit Mode: Off')).toBeInTheDocument();
  });

  it('should update form status via header button', async () => {
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    const updateStatusButton = screen.getByRole('button', { name: 'Update Status' });
    fireEvent.click(updateStatusButton);
    expect(screen.getByText('PMD1. Job Start Form - Status: Sent for Review - Edit Mode: Off')).toBeInTheDocument();
  });

  it('should disable submit button if form status is Sent for Review', async () => {
    mockGetJobStartFormByProjectId.mockResolvedValue([{ ...mockExistingFormData, status: 'Sent for Review' }]);
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    expect(screen.getByTestId('loading-button')).toBeDisabled();
  });

  it('should disable submit button if form status is Sent for Approval', async () => {
    mockGetJobStartFormByProjectId.mockResolvedValue([{ ...mockExistingFormData, status: 'Sent for Approval' }]);
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    expect(screen.getByTestId('loading-button')).toBeDisabled();
  });

  it('should disable submit button if form status is Approved', async () => {
    mockGetJobStartFormByProjectId.mockResolvedValue([{ ...mockExistingFormData, status: 'Approved' }]);
    render(<JobStartForm />);
    await waitFor(() => expect(mockGetWBSResourceData).toHaveBeenCalled());

    expect(screen.getByTestId('loading-button')).toBeDisabled();
  });
});
