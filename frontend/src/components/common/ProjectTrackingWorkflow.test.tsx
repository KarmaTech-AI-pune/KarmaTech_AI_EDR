import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { ProjectTrackingWorkflow } from './ProjectTrackingWorkflow';
import { projectManagementAppContext } from '../../App';
import { wbsWorkflowApi } from '../../services/wbsWorkflowApi';
import { PermissionType } from '../../models/permissionTypeModel';
import { PMWorkflowHistory } from '../../models/pmWorkflowModel';
import { ProjectTrackingWorkflowProps } from './ProjectTrackingWorkflow'; // Import the props interface
import { TaskType } from '../../features/wbs/types/wbs'; // Fixed import path

// Mock dialog components
vi.mock('../dialogbox/ProjectReviewWorkflow/ReviewBox', () => ({
  default: ({ open, onClose, onSubmit, entityId, entityType, formType }: any) =>
    open ? (
      <div data-testid="review-box-dialog">
        <button onClick={onClose} data-testid="review-box-close-button">Close</button>
        <button onClick={() => onSubmit({ Action: 'Review', AssignedTo: 'reviewer1', comments: 'Review comments' })} data-testid="review-box-submit-review-button">
          Submit Review
        </button>
        <button onClick={() => onSubmit({ Action: 'Reject', AssignedTo: 'originator1', comments: 'Reject comments' })} data-testid="review-box-reject-review-button">
          Reject Review
        </button>
      </div>
    ) : null
}));

vi.mock('../dialogbox/ProjectReviewWorkflow/SendApprovalBox', () => ({
  default: ({ open, onClose, onSubmit, status, projectId, entityId, entityType, formType }: any) =>
    open ? (
      <div data-testid="send-approval-box-dialog">
        <button onClick={onClose} data-testid="send-approval-box-close-button">Close</button>
        <button onClick={() => onSubmit({ Action: 'Approval', AssignedTo: 'approver1', comments: 'Approval comments' })} data-testid="send-approval-box-submit-approval-button">
          Submit Approval
        </button>
        <button onClick={() => onSubmit({ Action: 'Approved', AssignedTo: 'approver1', comments: 'Approved comments' })} data-testid="send-approval-box-approve-button">
          Approve
        </button>
        <button onClick={() => onSubmit({ Action: 'Reject', AssignedTo: 'originator1', comments: 'Reject comments' })} data-testid="send-approval-box-reject-approval-button">
          Reject Approval
        </button>
      </div>
    ) : null
}));

// Mock wbsWorkflowApi
vi.mock('../../services/wbsWorkflowApi', () => ({
  wbsWorkflowApi: {
    sendToReview: vi.fn(() => Promise.resolve({ status: 'Sent for Review' } as PMWorkflowHistory)),
    sendToApproval: vi.fn(() => Promise.resolve({ status: 'Sent for Approval' } as PMWorkflowHistory)),
    requestChanges: vi.fn(() => Promise.resolve({ status: 'Review Changes' } as PMWorkflowHistory)),
    approve: vi.fn(() => Promise.resolve({ status: 'Approved' } as PMWorkflowHistory)),
  },
}));

const mockContext = {
  currentUser: {
    id: 'user1',
    name: 'Test User',
    userName: 'testuser',
    email: 'test@example.com',
    roles: [],
    standardRate: 100,
    isConsultant: false,
    createdAt: new Date().toISOString(),
    roleDetails: {
      id: 'role1',
      name: 'Test Role',
      permissions: [] as PermissionType[], // Explicitly type permissions as PermissionType[]
    },
  },
  // Add other context properties if needed, matching the structure in App.tsx
  screenState: 'project',
  setScreenState: vi.fn(),
  isAuthenticated: true,
  setIsAuthenticated: vi.fn(),
  user: {} as any, // Mock user object
  setUser: vi.fn(),
  handleLogout: vi.fn(),
  selectedProject: null,
  setSelectedProject: vi.fn(),
  currentGoNoGoDecision: null,
  setCurrentGoNoGoDecision: vi.fn(),
  goNoGoDecisionStatus: null,
  setGoNoGoDecisionStatus: vi.fn(),
  goNoGoVersionNumber: null,
  setGoNoGoVersionNumber: vi.fn(),
  setCurrentUser: vi.fn(),
  canEditOpportunity: false,
  setCanEditOpportunity: vi.fn(),
  canDeleteOpportunity: false,
  setCanDeleteOpportunity: vi.fn(),
  canSubmitForReview: false,
  setCanSubmitForReview: vi.fn(),
  canReviewBD: false,
  setCanReviewBD: vi.fn(),
  canApproveBD: false,
  setCanApproveBD: vi.fn(),
  canSubmitForApproval: false,
  setCanSubmitForApproval: vi.fn(),
  canProjectSubmitForReview: false,
  setProjectCanSubmitForReview: vi.fn(),
  canProjectSubmitForApproval: false,
  setProjectCanSubmitForApproval: vi.fn(),
  canProjectCanApprove: false,
  setProjectCanApprove: vi.fn(),
};

describe('ProjectTrackingWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers(); // Move here to run before each test
    vi.setSystemTime(new Date('2025-03-15T10:00:00Z')); // Set a fixed time for consistent date mocks
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks(); // Clear all mocks including API mocks
    cleanup(); // Clean up the DOM after each test
  });

  const renderComponent = (
    props: Partial<ProjectTrackingWorkflowProps>,
    contextOverrides?: Partial<typeof mockContext>
  ) => {
    const mergedProps: ProjectTrackingWorkflowProps = {
      projectId: 'proj123',
      statusId: 1,
      status: 'Initial',
      entityId: 1,
      entityType: 'Project',
      formType: TaskType.Manpower, // Use TaskType enum member
      onStatusUpdate: vi.fn(),
      ...props,
    };

    return render(
      <projectManagementAppContext.Provider value={{ ...mockContext, ...contextOverrides }}>
        <ProjectTrackingWorkflow {...mergedProps} />
      </projectManagementAppContext.Provider>
    );
  };

  // Test Case 1: Renders Chip when entityId is undefined
  it('renders Chip when entityId is undefined', () => {
    renderComponent({ entityId: undefined });
    expect(screen.getByText('Initial')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send for Review/i })).not.toBeInTheDocument();
  });

  // Test Case 2: Renders Chip when no permissions to show button
  it('renders Chip when no permissions to show button for Initial status', () => {
    renderComponent({ status: 'Initial' }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [] } }
    });
    expect(screen.getByText('Initial')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // Test Case 3: Renders "Send for Review" button for Initial status with SUBMIT_PROJECT_FOR_REVIEW permission
  it('renders "Send for Review" button for Initial status with SUBMIT_PROJECT_FOR_REVIEW permission', async () => {
    renderComponent({ status: 'Initial' }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });
    expect(screen.getByRole('button', { name: /Send for Review/i })).toBeInTheDocument();
    // await waitFor(() => expect(screen.queryByText('Initial')).not.toBeInTheDocument());
  });

  // Test Case 4: Renders "Decide Review" button for Sent for Review status with SUBMIT_PROJECT_FOR_APPROVAL permission
  it('renders "Decide Review" button for Sent for Review status with SUBMIT_PROJECT_FOR_APPROVAL permission', async () => {
    renderComponent({ status: 'Sent for Review' }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_APPROVAL] } }
    });
    expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    // await waitFor(() => expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument());
  });

  // Test Case 5: Renders "Decide Approval" button for Sent for Approval status with APPROVE_PROJECT permission
  it('renders "Decide Approval" button for Sent for Approval status with APPROVE_PROJECT permission', async () => {
    renderComponent({ status: 'Sent for Approval' }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.APPROVE_PROJECT] } }
    });
    expect(screen.getByRole('button', { name: /Decide Approval/i })).toBeInTheDocument();
    // await waitFor(() => expect(screen.queryByText('Sent for Approval')).not.toBeInTheDocument());
  });

  // Test Case 6: Renders Chip for Approved status
  it('renders Chip for Approved status regardless of permissions', () => {
    renderComponent({ status: 'Approved', statusId: 6 }, { // statusId 6 = Approved
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.APPROVE_PROJECT] } }
    });
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // Test Case 7: Clicking "Send for Review" opens ReviewBox
  it('clicking "Send for Review" opens ReviewBox', async () => {
    renderComponent({ status: 'Initial' }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });
    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    expect(screen.getByTestId('review-box-dialog')).toBeInTheDocument();
  });

  // Test Case 8: Submitting "Review" action calls sendToReview and onStatusUpdate
  it('submitting "Review" action calls sendToReview and onStatusUpdate', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Initial', statusId: 1, onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    });
    
    // Wait for dialog to appear
    await waitFor(() => {
      expect(screen.getByTestId('review-box-dialog')).toBeInTheDocument();
    });
    
    await act(async () => {
      const submitButton = screen.getByTestId('review-box-submit-review-button');
      fireEvent.click(submitButton);
    });

    // Wait for the setTimeout (1000ms) and API call to complete
    await waitFor(() => {
      expect(wbsWorkflowApi.sendToReview).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'Project',
        assignedToId: 'reviewer1',
        comments: 'Review comments',
        action: 'Review',
      });
      expect(onStatusUpdateMock).toHaveBeenCalledWith('Sent for Review');
      expect(screen.queryByTestId('review-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 9: Submitting "Approval" action calls sendToApproval and onStatusUpdate
  it('submitting "Approval" action calls sendToApproval and onStatusUpdate', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Sent for Review', statusId: 2, onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_APPROVAL] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Decide Review/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('send-approval-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('send-approval-box-submit-approval-button'));

    await waitFor(() => {
      expect(wbsWorkflowApi.sendToApproval).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'Project',
        assignedToId: 'approver1',
        comments: 'Approval comments',
        action: 'Approval',
      });
      expect(onStatusUpdateMock).toHaveBeenCalledWith('Sent for Approval');
      expect(screen.queryByTestId('send-approval-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 10: Submitting "Approved" action calls approve and onStatusUpdate
  it('submitting "Approved" action calls approve and onStatusUpdate', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Sent for Approval', statusId: 4, onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.APPROVE_PROJECT] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Decide Approval/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('send-approval-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('send-approval-box-approve-button'));

    await waitFor(() => {
      expect(wbsWorkflowApi.approve).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'Project',
        assignedToId: 'approver1',
        comments: 'Approved comments',
        action: 'Approved',
      });
      expect(onStatusUpdateMock).toHaveBeenCalledWith('Approved');
      expect(screen.queryByTestId('send-approval-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 11: Submitting "Reject" action from Sent for Review calls requestChanges and onStatusUpdate
  it('submitting "Reject" action from Sent for Review calls requestChanges and onStatusUpdate', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Sent for Review', statusId: 2, onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_APPROVAL] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Decide Review/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('send-approval-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('send-approval-box-reject-approval-button'));

    await waitFor(() => {
      expect(wbsWorkflowApi.requestChanges).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'Project',
        comments: 'Reject comments',
        assignedToId: 'originator1',
        isApprovalChanges: false,
        action: 'Reject',
      });
      expect(onStatusUpdateMock).toHaveBeenCalledWith('Review Changes');
      expect(screen.queryByTestId('send-approval-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 12: Submitting "Reject" action from Sent for Approval calls requestChanges and onStatusUpdate
  it('submitting "Reject" action from Sent for Approval calls requestChanges and onStatusUpdate', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Sent for Approval', statusId: 4, onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.APPROVE_PROJECT] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Decide Approval/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('send-approval-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('send-approval-box-reject-approval-button'));

    await waitFor(() => {
      expect(wbsWorkflowApi.requestChanges).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'Project',
        comments: 'Reject comments',
        assignedToId: 'originator1',
        isApprovalChanges: true,
        action: 'Reject',
      });
      expect(onStatusUpdateMock).toHaveBeenCalledWith('Approval Changes');
      expect(screen.queryByTestId('send-approval-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 13: Dialog close without submit
  it('dialog closes without submitting and does not call onStatusUpdate', async () => {
    const onStatusUpdateMock = vi.fn();
    renderComponent({ status: 'Initial', onStatusUpdate: onStatusUpdateMock }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByTestId('review-box-dialog')).not.toBeInTheDocument();
    expect(onStatusUpdateMock).not.toHaveBeenCalled();
    expect(wbsWorkflowApi.sendToReview).not.toHaveBeenCalled();
  });

  // Test Case 14: API error handling during submission
  it('handles API errors during submission', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.mocked(wbsWorkflowApi.sendToReview).mockRejectedValueOnce(new Error('API Error'));

    renderComponent({ status: 'Initial', statusId: 1 }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    
    await waitFor(() => {
      expect(screen.getByTestId('review-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('review-box-submit-review-button'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error in workflow action:', expect.any(Error));
      expect(alertSpy).toHaveBeenCalledWith('An error occurred while processing your request. Please try again.');
      expect(screen.queryByTestId('review-box-dialog')).not.toBeInTheDocument();
    }, { timeout: 2000 });
    
    consoleErrorSpy.mockRestore();
    alertSpy.mockRestore();
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 15: isSubmitting state management
  it('manages isSubmitting state correctly', async () => {
    // Use real timers for this test since we need promises to resolve
    vi.useRealTimers();
    
    vi.mocked(wbsWorkflowApi.sendToReview).mockImplementationOnce(() => {
      return new Promise(resolve => setTimeout(() => resolve({ status: 'Sent for Review' } as PMWorkflowHistory), 50));
    });

    renderComponent({ status: 'Initial', statusId: 1 }, {
      currentUser: { ...mockContext.currentUser, roleDetails: { ...mockContext.currentUser.roleDetails, permissions: [PermissionType.SUBMIT_PROJECT_FOR_REVIEW] } }
    });

    const button = screen.getByRole('button', { name: /Send for Review/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByTestId('review-box-dialog')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: 'Submit Review' }));

    // Button should be disabled while submitting
    await waitFor(() => expect(button).toBeDisabled());
    
    // Wait for submission to complete
    await waitFor(() => expect(button).not.toBeDisabled(), { timeout: 2000 });
    
    // Restore fake timers for other tests
    vi.useFakeTimers();
  });

  // Test Case 16: No entityId for handleSubmit logs error and closes dialog (Removed as redundant, covered by Test Case 1)
  // The UI prevents calling handleSubmit if entityId is undefined, so this test is not necessary.
});



