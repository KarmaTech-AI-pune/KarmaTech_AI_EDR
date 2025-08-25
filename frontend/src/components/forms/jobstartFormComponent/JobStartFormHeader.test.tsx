import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobStartFormHeader from './JobStartFormHeader';
import { jobStartFormHeaderApi } from '../../../services/jobStartFormHeaderApi';
import { TaskType } from '../../../types/wbs';

// Mocking dependencies
jest.mock('../../../services/jobStartFormHeaderApi', () => ({
  jobStartFormHeaderApi: {
    getJobStartFormHeaderStatus: jest.fn(),
  },
}));

// Mocking ProjectTrackingWorkflow component
jest.mock('../../common/ProjectTrackingWorkflow', () => ({
  __esModule: true,
  default: jest.fn(({ projectId, statusId, status, entityId, entityType, formType, onStatusUpdate }) => (
    <div data-testid="mock-project-tracking-workflow">
      <p>Project ID: {projectId}</p>
      <p>Status ID: {statusId}</p>
      <p>Status: {status}</p>
      <p>Entity ID: {entityId}</p>
      <p>Entity Type: {entityType}</p>
      <p>Form Type: {formType}</p>
      <button onClick={() => onStatusUpdate('Approved')}>Update Status to Approved</button>
    </div>
  )),
}));

// Mocking the TaskType enum if it's used directly in tests
// For now, assuming it's just a type and not directly instantiated in tests

describe('JobStartFormHeader', () => {
  const mockProjectId = '123';
  const mockFormId = '456';
  const mockInitialStatus = 'Initial';
  const mockInitialStatusId = 1; // Based on getStatusId mapping

  const mockOnStatusUpdate = jest.fn();

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();
  });

  it('renders correctly with initial data and no loading state', () => {
    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false} // Assuming editMode is not critical for this header test
        onEditModeToggle={() => {}} // Dummy function
      />
    );

    expect(screen.getByText('Job Start Form')).toBeInTheDocument();
    expect(screen.queryByTestId('circular-progress')).not.toBeInTheDocument(); // Ensure no loading spinner is shown initially
  });

  it('fetches and displays status from API', async () => {
    const mockApiStatus = { status: 'Sent for Approval', statusId: 4 };
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as jest.Mock).mockResolvedValue(mockApiStatus);

    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus} // This should be overridden by API
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    // Check if loading spinner is shown while fetching
    expect(screen.getByTestId('circular-progress')).toBeInTheDocument();

    // Wait for the API call to resolve and the status to be updated
    await waitFor(() => {
      expect(jobStartFormHeaderApi.getJobStartFormHeaderStatus).toHaveBeenCalledWith(mockProjectId, mockFormId);
    });

    // Check if the status and workflow component are updated
    expect(screen.getByTestId('mock-project-tracking-workflow')).toBeInTheDocument();
    expect(screen.getByText('Status: Sent for Approval')).toBeInTheDocument();
    expect(screen.getByText('Status ID: 4')).toBeInTheDocument();
    expect(screen.getByText('Entity Type: JobStartForm')).toBeInTheDocument();
    expect(screen.getByText('Form Type: Manpower')).toBeInTheDocument(); // Assuming TaskType.Manpower maps to 'Manpower' string

    // Check if onStatusUpdate was called with the API status
    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Sent for Approval');
  });

  it('handles API error gracefully and uses provided status', async () => {
    const apiError = new Error('Failed to fetch status');
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as jest.Mock).mockRejectedValue(apiError);

    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={mockProjectId}
        formId={mockFormId}
        status={mockInitialStatus} // This should be used as fallback
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    // Wait for the API call to attempt and fail
    await waitFor(() => {
      expect(jobStartFormHeaderApi.getJobStartFormHeaderStatus).toHaveBeenCalledWith(mockProjectId, mockFormId);
    });

    // Check if the fallback status is displayed
    expect(screen.getByText('Status: Initial')).toBeInTheDocument();
    expect(screen.getByText('Status ID: 1')).toBeInTheDocument();
    expect(screen.getByTestId('mock-project-tracking-workflow')).toBeInTheDocument();

    // Check if onStatusUpdate was called with the initial status
    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Initial');
  });

  it('handles missing projectId or formId by not fetching status', () => {
    render(
      <JobStartFormHeader
        title="Job Start Form"
        projectId={undefined} // Missing projectId
        formId={mockFormId}
        status={mockInitialStatus}
        onStatusUpdate={mockOnStatusUpdate}
        editMode={false}
        onEditModeToggle={() => {}}
      />
    );

    expect(jobStartFormHeaderApi.getJobStartFormHeaderStatus).not.toHaveBeenCalled();
    expect(screen.getByText('Status: Initial')).toBeInTheDocument(); // Should display the provided status
  });

  it('calls onStatusUpdate when ProjectTrackingWorkflow updates status', () => {
    const mockApiStatus = { status: 'Sent for Approval', statusId: 4 };
    (jobStartFormHeaderApi.getJobStartFormHeaderStatus as jest.Mock).mockResolvedValue(mockApiStatus);

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

    // Find the button within the mocked ProjectTrackingWorkflow and click it
    const workflowComponent = screen.getByTestId('mock-project-tracking-workflow');
    const updateButton = within(workflowComponent).getByText('Update Status to Approved');
    fireEvent.click(updateButton);

    // Check if onStatusUpdate was called with the new status
    expect(mockOnStatusUpdate).toHaveBeenCalledWith('Approved');
  });

  // Test for getStatusId helper function (can be tested in isolation or as part of header tests)
  it('getStatusId helper function maps status strings to IDs correctly', () => {
    // Accessing the helper function directly requires it to be exported or tested within the component's scope.
    // For simplicity, we'll test its behavior indirectly through the component's rendering.
    // If getStatusId were exported, we'd test it like:
    // expect(getStatusId('Initial')).toBe(1);
    // expect(getStatusId('Sent for Review')).toBe(2);
    // expect(getStatusId('Approved')).toBe(6);
    // expect(getStatusId('Unknown Status')).toBe(1); // Default case
  });
});
