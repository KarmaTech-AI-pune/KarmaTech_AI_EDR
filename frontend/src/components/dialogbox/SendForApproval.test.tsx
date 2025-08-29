import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForApproval from './SendForApproval';
import { getUsersByRole, getUserById } from '../../services/userApi';
import { opportunityApi } from '../../services/opportunityApi';
import { updateWorkflow } from '../../dummyapi/opportunityWorkflowApi';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { AuthUser } from '../../models/userModel';
import { OpportunityHistory } from '../../models';

// Mock external dependencies
vi.mock('../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../../services/opportunityApi', () => ({
  opportunityApi: {
    getById: vi.fn(),
    sendToApproval: vi.fn(),
  },
}));

vi.mock('../../dummyapi/opportunityWorkflowApi', () => ({
  updateWorkflow: vi.fn(),
}));

vi.mock('../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logCustomEvent: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUsersByRole = vi.mocked(getUsersByRole);
const mockGetUserById = vi.mocked(getUserById);
const mockGetOpportunityById = vi.mocked(opportunityApi.getById);
const mockSendToApproval = vi.mocked(opportunityApi.sendToApproval);
const mockUpdateWorkflow = vi.mocked(updateWorkflow);
const mockLogCustomEvent = vi.mocked(HistoryLoggingService.logCustomEvent);

const mockRegionalDirectors: AuthUser[] = [
  { id: 'rd1', name: 'RD One', userName: 'rd1', email: 'rd1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
  { id: 'rd2', name: 'RD Two', userName: 'rd2', email: 'rd2@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];

const mockOpportunityData = {
  id: 101,
  approvalManagerId: 'rd1',
  // Add other opportunity properties if needed
};

const mockDirectorUserData: AuthUser = {
  id: 'rd1',
  name: 'RD One',
  userName: 'rd1',
  email: 'rd1@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockOpportunityHistory: OpportunityHistory = {
  id: 1,
  opportunityId: 101,
  date: '2023-01-01T00:00:00Z',
  description: 'Test event',
  statusId: 0,
  status: 'Created',
  action: 'Created',
  assignedToId: '',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  opportunityId: 101,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
};

describe('SendForApproval (top level)', () => {
const mockWorkflowEntry = {
  id: '4',
  opportunityId: 101,
  formStage: 'opportunityTracking',
  workflowId: '4',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockResolvedValue(mockRegionalDirectors);
    mockGetOpportunityById.mockResolvedValue(mockOpportunityData as any);
    mockGetUserById.mockResolvedValue(mockDirectorUserData);
    mockSendToApproval.mockResolvedValue(undefined);
    mockUpdateWorkflow.mockResolvedValue(mockWorkflowEntry); // Mock with a WorkflowEntry
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory);
    defaultProps.onSubmit.mockImplementation(vi.fn());
  });

  it('should render correctly with default props and display director name if already assigned', async () => {
    render(<SendForApproval {...defaultProps} />);

    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockDirectorUserData.name} for approval?`)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeEnabled(); // Should be enabled because selectedApprover is set in useEffect
  });

  it('should render correctly with default props and display dropdown if no director assigned', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, approvalManagerId: undefined } as any); // No director assigned
    render(<SendForApproval {...defaultProps} />);

    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Regional Director')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeDisabled(); // Should be disabled until an approver is selected
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled()); // Wait for useEffect to complete
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should enable Send for Approval button when an approver is selected from dropdown', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, approvalManagerId: undefined } as any); // No director assigned
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Regional Director')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText('Regional Director'));
    fireEvent.click(screen.getByText('RD One'));
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeEnabled();
  });

  it('should call opportunityApi.sendToApproval, updateWorkflow, and logCustomEvent on successful submission (director assigned)', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(mockSendToApproval).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        approvalManagerId: mockOpportunityData.approvalManagerId,
        action: 'Send to Approvel',
        comments: 'Send to Approvel',
      });
      expect(mockUpdateWorkflow).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        '4',
        { approvalManagerId: mockOpportunityData.approvalManagerId, status: 'Pending Approval' }
      );
      expect(mockLogCustomEvent).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'Sent for Approval',
        defaultProps.currentUser as string,
        `Sent to ${mockDirectorUserData.name} for approval`
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call opportunityApi.sendToApproval, updateWorkflow, and logCustomEvent on successful submission (approver selected)', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, approvalManagerId: undefined } as any); // No director assigned
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Regional Director')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText('Regional Director'));
    fireEvent.click(screen.getByText('RD Two')); // Select RD Two

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(mockSendToApproval).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        approvalManagerId: 'rd2', // Should be RD Two's ID
        action: 'Send to Approvel',
        comments: 'Send to Approvel',
      });
      expect(mockUpdateWorkflow).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        '4',
        { approvalManagerId: 'rd2', status: 'Pending Approval' }
      );
      expect(mockLogCustomEvent).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'Sent for Approval',
        defaultProps.currentUser as string,
        `Sent to ${mockRegionalDirectors[1].name} for approval`
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error if no approver is selected on submit (no director assigned)', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, approvalManagerId: undefined } as any); // No director assigned
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Regional Director')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));
    await waitFor(() => {
      expect(screen.getByText('Please select a Regional Director')).toBeInTheDocument();
    });
    expect(mockSendToApproval).not.toHaveBeenCalled();
    expect(mockUpdateWorkflow).not.toHaveBeenCalled();
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on validation error
  });

  it('should show error if opportunityId is missing', async () => {
    render(<SendForApproval {...defaultProps} opportunityId={undefined as any} />); // Cast to any to bypass TS error for test
    await waitFor(() => expect(mockGetOpportunityById).not.toHaveBeenCalled()); // useEffect should not run fully
    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));
    await waitFor(() => {
      expect(screen.getByText('No ID set for opp')).toBeInTheDocument(); // Error from console.error in component
    });
    expect(mockSendToApproval).not.toHaveBeenCalled();
  });

  it('should display error if getUsersByRole fails', async () => {
    const errorMessage = 'Failed to fetch roles';
    mockGetUsersByRole.mockRejectedValue(new Error(errorMessage));
    mockGetOpportunityById.mockResolvedValue({ id: 101, approvalManagerId: undefined } as any); // No director assigned

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeDisabled();
  });

  it('should display error if opportunityApi.getById fails', async () => {
    const errorMessage = 'Failed to fetch opportunity';
    mockGetOpportunityById.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should display error if getUserById fails (director not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('404: DirectorUser not found')); // Simulate director not found

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('404: DirectorUser not found')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeDisabled();
  });

  it('should display error if opportunityApi.sendToApproval fails', async () => {
    const errorMessage = 'Approval API failed';
    mockSendToApproval.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockUpdateWorkflow).not.toHaveBeenCalled();
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on API error
  });

  it('should display error if updateWorkflow fails', async () => {
    const errorMessage = 'Workflow update failed';
    mockUpdateWorkflow.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on API error
  });

  it('should display error if HistoryLoggingService.logCustomEvent fails', async () => {
    const errorMessage = 'Logging failed';
    mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on API error
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());
    const dialog = screen.getByRole('dialog');

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    fireEvent.click(dialog, mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const mockKeyEvent = { stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
    fireEvent.keyDown(dialog, mockKeyEvent);
    expect(mockKeyEvent.stopPropagation).toHaveBeenCalledTimes(1);

    stopPropagationSpy.mockRestore();
  });
});
