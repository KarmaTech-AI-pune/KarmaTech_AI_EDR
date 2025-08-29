import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForApproval from './ProjectSendForApproval';
import { getUserById } from '../../../services/userApi';
import { HistoryLoggingService } from '../../../services/historyLoggingService';
import { AuthUser } from '../../../models/userModel';
import { OpportunityHistory } from '../../../models';

// Mock external dependencies
vi.mock('../../../services/userApi', () => ({
  getUserById: vi.fn(),
}));

vi.mock('../../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logCustomEvent: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUserById = vi.mocked(getUserById);
const mockLogCustomEvent = vi.mocked(HistoryLoggingService.logCustomEvent);

const mockRegionalManager: AuthUser = {
  id: 'regional-manager-id',
  name: 'Regional Manager',
  userName: 'rm123',
  email: 'rm123@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockOpportunityHistory: OpportunityHistory = {
  id: 1,
  opportunityId: 1,
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
  projectId: 1,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
};

describe('ProjectReviewWorkflow/ProjectSendForApproval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserById.mockResolvedValue(mockRegionalManager);
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory);
    defaultProps.onSubmit.mockResolvedValue(undefined);
  });

  it('should render correctly with default props and display regional manager name', async () => {
    render(<SendForApproval {...defaultProps} />);

    expect(screen.getByText('Regional Manager/Director')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockRegionalManager.name} for approval?`)).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Comments (Optional)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeEnabled(); // Should be enabled after manager is fetched
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled()); // Wait for useEffect to complete
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should update comments state when text is entered', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());
    const commentsInput = screen.getByLabelText('Comments (Optional)');
    fireEvent.change(commentsInput, { target: { value: 'Some comments' } });
    expect(commentsInput).toHaveValue('Some comments');
  });

  it('should call logCustomEvent and onSubmit on successful submission with comments', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    const commentsInput = screen.getByLabelText('Comments (Optional)');
    fireEvent.change(commentsInput, { target: { value: 'Please approve this project.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledWith(
        defaultProps.projectId,
        'WBS Manpower Sent for Approval',
        defaultProps.currentUser as string,
        `Sent to ${mockRegionalManager.name} for approval: Please approve this project.`
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call logCustomEvent with default comments if none provided', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledWith(
        defaultProps.projectId,
        'WBS Manpower Sent for Approval',
        defaultProps.currentUser as string,
        `Sent to ${mockRegionalManager.name} for approval`
      );
    });
  });

  it('should show error if projectId is missing', async () => {
    render(<SendForApproval {...defaultProps} projectId={undefined} />);
    // No need to wait for getUserById as useEffect won't run fully
    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<SendForApproval {...defaultProps} currentUser={undefined} />);
    // The component should return null and not render anything
    expect(screen.queryByText('Regional Manager/Director')).not.toBeInTheDocument();
  });

  it('should display error if getUserById fails (manager not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('404: Regional Manager/Director not found')); // Simulate manager not found

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Regional Manager/Director not found')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeDisabled();
  });

  it('should display error if HistoryLoggingService.logCustomEvent fails', async () => {
    const errorMessage = 'Logging failed';
    mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());
    const dialog = screen.getByRole('dialog');

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    fireEvent.click(dialog, mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const mockKeyEvent = { stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
    fireEvent.keyDown(dialog, mockKeyEvent);
    expect(mockKeyEvent.stopPropagation).toHaveBeenCalledTimes(1);

    stopPropagationSpy.mockRestore();
  });

  it('should display "Sending..." and disable button during loading', async () => {
    mockLogCustomEvent.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate async operation
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send for Approval' })).toBeEnabled();
    });
  });
});
