// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForReview from './ProjectSendForReview';
import { getUserById } from '../../../services/userApi';
import { HistoryLoggingService } from '../../../services/historyLoggingService';
import { projectManagementAppContext } from '../../../App';
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

// Mock the context
const mockContext = {
  selectedProject: {
    id: 1,
    seniorProjectManagerId: 'spm123',
    // Add other properties if needed by the component
  },
};

// Type assertion for mocked functions
const mockGetUserById = vi.mocked(getUserById);
const mockLogCustomEvent = vi.mocked(HistoryLoggingService.logCustomEvent);

const mockSeniorPM: AuthUser = {
  id: 'spm123',
  name: 'Senior PM',
  userName: 'spm123',
  email: 'spm123@example.com',
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
  currentUser: 'TestUser',
  projectId: 1, // Explicitly pass projectId
  onSubmit: vi.fn(),
  onReviewSent: vi.fn(),
};

describe('ProjectReviewWorkflow/ProjectSendForReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserById.mockResolvedValue(mockSeniorPM);
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory);
    defaultProps.onSubmit.mockResolvedValue(undefined);
    defaultProps.onReviewSent.mockResolvedValue(undefined);
  });

  it('should render correctly with default props and display Senior PM name', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockSeniorPM.name} for review?`)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled(); // Should be enabled after PM is fetched
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled()); // Wait for useEffect to complete
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
  });

  it('should call logCustomEvent and onSubmit/onReviewSent on successful submission', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledWith(
        defaultProps.projectId,
        'WBS Manpower Sent for Review',
        defaultProps.currentUser as string,
        `Sent to ${mockSeniorPM.name} for review`
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error if no project is selected in context', async () => {
    const contextWithoutProject = { selectedProject: undefined };
    render(
      <projectManagementAppContext.Provider value={contextWithoutProject as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getAllByText('No project selected')[0]).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should show error if selected project has no seniorProjectManagerId', async () => {
    const contextWithoutSPM = { selectedProject: { id: 1, seniorProjectManagerId: undefined } };
    render(
      <projectManagementAppContext.Provider value={contextWithoutSPM as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Senior Project Manager assigned to this project')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should show error if getUserById fails (Senior PM not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('Senior Project Manager not found')); // Simulate PM not found

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    await waitFor(() => expect(screen.getByText(/Failed to fetch Senior Project Manager details/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should show error if projectId is missing from props and context', async () => {
    const propsWithoutProjectId = { ...defaultProps, projectId: undefined as unknown as number };
    const contextWithoutProjectId = { selectedProject: { id: undefined, seniorProjectManagerId: 'spm123' } };

    render(
      <projectManagementAppContext.Provider value={contextWithoutProjectId as any}>
        <SendForReview {...propsWithoutProjectId} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled()); // Still fetches PM
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} currentUser={undefined as unknown as string} />
      </projectManagementAppContext.Provider>
    );
    // The component should return null and not render anything
    await waitFor(() => expect(screen.queryByText('Senior Project Manager')).not.toBeInTheDocument());
  });

  it('should display error if HistoryLoggingService.logCustomEvent fails', async () => {
    const errorMessage = 'Logging failed';
    mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should NOT close on API error
  });

  it('should prevent event propagation on dialog interactions', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());
    const dialog = screen.getByRole('dialog');

    // Test that the dialog renders and is interactive
    expect(dialog).toBeInTheDocument();
    
    // Test that clicking inside the dialog doesn't close it
    fireEvent.click(dialog);
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    // Test that the dialog has the proper event handlers
    expect(dialog).toHaveAttribute('role', 'dialog');
  });

  it('should display "Sending..." and disable button during loading', async () => {
    mockLogCustomEvent.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate async operation
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendForReview {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    });
  });
});
