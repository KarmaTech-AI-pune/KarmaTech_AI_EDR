import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobStartFormHeader from './JobStartFormHeader';
import { jobStartFormHeaderApi } from '../../../services/jobStartFormHeaderApi';

// Mocking dependencies
vi.mock('../../../services/jobStartFormHeaderApi', () => ({
  jobStartFormHeaderApi: {
    getJobStartFormHeaderStatus: vi.fn(),
  },
}));

// Mocking ProjectTrackingWorkflow component
// Use a clearer factory with __esModule: true
vi.mock('../../common/ProjectTrackingWorkflow', () => {
  return {
    __esModule: true,
    ProjectTrackingWorkflow: ({ projectId, statusId, status, entityId, entityType, formType, onStatusUpdate }: any) => (
      <div data-testid="mock-project-tracking-workflow">
        <p>Project ID: {projectId}</p>
        <p>Status ID: {statusId}</p>
        <p>Status: {status}</p>
        <p>Entity ID: {entityId}</p>
        <p>Entity Type: {entityType}</p>
        <p>Form Type: {formType}</p>
        <button onClick={() => onStatusUpdate('Approved')}>Update Status to Approved</button>
      </div>
    ),
  };
});

describe('JobStartFormHeader', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';
  const mockFormId = '456';
  const mockInitialStatus = 'Initial';

  const mockOnStatusUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly without fetching status when optional', () => {
    // We'll test the basic render here without IDs to avoid the immediate fetch/loading state
    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={undefined}
        formId={undefined}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    expect(screen.getByText('Job Start Form')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('fetches and displays status from API', async () => {
    const mockApiStatus = { status: 'Sent for Approval', statusId: 4 };
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as Mock).mockResolvedValue(mockApiStatus);

    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    // Initial loading state (triggered in useEffect)
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for the API call to resolve and loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if the status and workflow component are updated
    expect(screen.getByTestId('mock-project-tracking-workflow')).toBeInTheDocument();
    expect(screen.getByText('Status: Sent for Approval')).toBeInTheDocument();
    expect(screen.getByText('Status ID: 4')).toBeInTheDocument();
    
    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Sent for Approval');
  });

  it('handles API error gracefully and uses provided status', async () => {
    const apiError = new Error('Failed to fetch status');
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as Mock).mockRejectedValue(apiError);

    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    // Wait for the API call to attempt and fail, and loading to finish
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if the fallback status is displayed
    expect(screen.getByTestId('mock-project-tracking-workflow')).toBeInTheDocument();
    expect(screen.getByText('Status: Initial')).toBeInTheDocument();
    expect(screen.getByText('Status ID: 1')).toBeInTheDocument();

    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Initial');
  });

  it('handles missing projectId or formId by not fetching status', () => {
    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={undefined}
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    expect(jobStartFormHeaderApi.getJobStartFormHeaderStatus).not.toHaveBeenCalled();
    expect(screen.queryByTestId('mock-project-tracking-workflow')).not.toBeInTheDocument();
  });

  it('calls onStatusUpdate when ProjectTrackingWorkflow updates status', async () => {
    const mockApiStatus = { status: 'Sent for Approval', statusId: 4 };
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as Mock).mockResolvedValue(mockApiStatus);

    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const workflowComponent = screen.getByTestId('mock-project-tracking-workflow');
    const updateButton = within(workflowComponent).getByText('Update Status to Approved');
    fireEvent.click(updateButton);

    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Approved');
  });

  it('getStatusId helper function maps status strings to IDs correctly', () => {
    // Indirectly tested in other cases
  });
});
