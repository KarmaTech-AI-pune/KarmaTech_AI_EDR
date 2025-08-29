import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangeControlWorkflow } from './ChangeControlWorkflow';
import { projectManagementAppContext } from '../../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeControl } from '../../models';
import { WorkflowHistory } from '../../models/changeControlModel'; // Import specific WorkflowHistory

// Mock the dialog components
vi.mock('../dialogbox/changecontrol', () => ({
  DecideApproval: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="decide-approval-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
  DecideReview: vi.fn(({ open, onClose, onDecisionMade }) => (
    open ? <div data-testid="decide-review-dialog"><button onClick={onClose}>Close</button><button onClick={() => onDecisionMade()}>Submit</button></div> : null
  )),
  SendForReview: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="send-for-review-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
  SendForApproval: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="send-for-approval-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
}));

const mockChangeControl: ChangeControl = {
  id: 1,
  projectId: 101,
  srNo: 1,
  dateLogged: '2025-03-15',
  originator: 'Test User',
  description: 'Test Change Control Description',
  costImpact: 'Low',
  timeImpact: 'None',
  resourcesImpact: 'None',
  qualityImpact: 'None',
  changeOrderStatus: 'Open',
  clientApprovalStatus: 'Pending',
  claimSituation: 'No',
  workflowStatusId: 1,
  workflowHistory: {
    id: 1, // Ensure id is a number
    changeControlId: 1,
    actionDate: new Date('2025-03-15'),
    comments: 'Initial creation',
    statusId: 1,
    action: 'Create',
    actionBy: 'Test User',
    assignedToId: 'user1',
  } as WorkflowHistory, // Cast to the specific WorkflowHistory
};

const mockContext = {
  screenState: 'changeControl',
  setScreenState: vi.fn(),
  isAuthenticated: true,
  setIsAuthenticated: vi.fn(),
  user: {
    id: 'user1',
    name: 'Test User',
    userName: 'testuser',
    email: 'test@example.com',
    roles: [],
    standardRate: 100,
    isConsultant: false,
    createdAt: new Date().toISOString()
  },
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
  currentUser: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    userName: 'testuser',
    roles: [],
    standardRate: 100,
    isConsultant: false,
    createdAt: new Date().toISOString(),
    roleDetails: {
      id: 'role1',
      name: 'Test Role',
      permissions: []
    }
  },
  setCurrentUser: vi.fn(),
  canEditOpportunity: true,
  setCanEditOpportunity: vi.fn(),
  canDeleteOpportunity: true,
  setCanDeleteOpportunity: vi.fn(),
  canSubmitForReview: true,
  setCanSubmitForReview: vi.fn(),
  canReviewBD: true,
  setCanReviewBD: vi.fn(),
  canApproveBD: true,
  setCanApproveBD: vi.fn(),
  canSubmitForApproval: true,
  setCanSubmitForApproval: vi.fn(),
  canProjectSubmitForReview: false, // Will be overridden in specific tests
  setProjectCanSubmitForReview: vi.fn(),
  canProjectSubmitForApproval: false, // Will be overridden in specific tests
  setProjectCanSubmitForApproval: vi.fn(),
  canProjectCanApprove: false, // Will be overridden in specific tests
  setProjectCanApprove: vi.fn()
};

describe('ChangeControlWorkflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    changeControl: ChangeControl, // Removed { statusId?: number } as it's part of ChangeControl
    contextOverrides?: Partial<typeof mockContext>,
    onChangeControlUpdated?: () => Promise<void>
  ) => {
    return render(
      <projectManagementAppContext.Provider value={{ ...mockContext, ...contextOverrides }}>
        <ChangeControlWorkflow
          changeControl={changeControl}
          onChangeControlUpdated={onChangeControlUpdated}
        />
      </projectManagementAppContext.Provider>
    );
  };

  // Test Case 1: Initial render - Chip shown if no context or no permissions
  it('renders Chip with "Initial" status if no context or no permissions to show button', () => {
    renderComponent(mockChangeControl, { canProjectSubmitForReview: false });
    expect(screen.getByText('Initial')).toBeInTheDocument(); // Query by text content for Chip
    expect(screen.queryByRole('button', { name: /Send for Review/i })).not.toBeInTheDocument();
  });

  // Test Case 2: Initial render - Chip shown if status is "Approved"
  it('renders Chip with "Approved" status if workflow status is "Approved"', () => {
    const approvedCC: ChangeControl = {
      ...mockChangeControl,
      workflowStatusId: 6,
      workflowHistory: {
        ...mockChangeControl.workflowHistory!,
        id: mockChangeControl.workflowHistory!.id,
        changeControlId: mockChangeControl.workflowHistory!.changeControlId,
        statusId: 6,
        actionDate: new Date(),
        comments: 'Approved'
      } as WorkflowHistory,
    };
    renderComponent(approvedCC, { canProjectSubmitForReview: true });
    expect(screen.getByText('Approved')).toBeInTheDocument(); // Query by text content for Chip
    expect(screen.queryByRole('button', { name: /Send for Review/i })).not.toBeInTheDocument();
  });

  // Test Case 3: "Initial" status, canProjectSubmitForReview is true -> "Send for Review" button
  it('renders "Send for Review" button for "Initial" status if canProjectSubmitForReview', () => {
    renderComponent(mockChangeControl, { canProjectSubmitForReview: true });
    expect(screen.getByRole('button', { name: /Send for Review/i })).toBeInTheDocument();
    expect(screen.queryByText('Initial')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });

  // Test Case 4: "Sent for Review" status, canProjectSubmitForApproval is true -> "Decide Review" button
  it('renders "Decide Review" button for "Sent for Review" status if canProjectSubmitForApproval', () => {
    const sentForReviewCC: ChangeControl = {
      ...mockChangeControl,
      workflowStatusId: 2,
      workflowHistory: {
        ...mockChangeControl.workflowHistory!,
        id: mockChangeControl.workflowHistory!.id,
        changeControlId: mockChangeControl.workflowHistory!.changeControlId,
        statusId: 2,
        actionDate: new Date(),
        comments: 'Sent for Review'
      } as WorkflowHistory,
    };
    renderComponent(sentForReviewCC, { canProjectSubmitForApproval: true });
    expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });

  // Test Case 5: "Sent for Approval" status, canProjectCanApprove is true -> "Decide Approval" button
  it('renders "Decide Approval" button for "Sent for Approval" status if canProjectCanApprove', () => {
    const sentForApprovalCC: ChangeControl = {
      ...mockChangeControl,
      workflowStatusId: 4,
      workflowHistory: {
        ...mockChangeControl.workflowHistory!,
        id: mockChangeControl.workflowHistory!.id,
        changeControlId: mockChangeControl.workflowHistory!.changeControlId,
        statusId: 4,
        actionDate: new Date(),
        comments: 'Sent for Approval'
      } as WorkflowHistory,
    };
    renderComponent(sentForApprovalCC, { canProjectCanApprove: true });
    expect(screen.getByRole('button', { name: /Decide Approval/i })).toBeInTheDocument();
    expect(screen.queryByText('Sent for Approval')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });

  // Test Case 6: "Sent for Approval" status, canProjectCanApprove is false, canProjectSubmitForApproval is true -> Chip with "Sent for Approval"
  it('renders Chip with "Sent for Approval" status if canProjectSubmitForApproval but not canProjectCanApprove', () => {
    const sentForApprovalCC: ChangeControl = {
      ...mockChangeControl,
      workflowStatusId: 4,
      workflowHistory: {
        ...mockChangeControl.workflowHistory!,
        id: mockChangeControl.workflowHistory!.id,
        changeControlId: mockChangeControl.workflowHistory!.changeControlId,
        statusId: 4,
        actionDate: new Date(),
        comments: 'Sent for Approval'
      } as WorkflowHistory,
    };
    renderComponent(sentForApprovalCC, { canProjectCanApprove: false, canProjectSubmitForApproval: true });
    expect(screen.getByText('Sent for Approval')).toBeInTheDocument(); // Expect Chip
    expect(screen.queryByRole('button', { name: /Send for Approval/i })).not.toBeInTheDocument(); // Ensure Button is not rendered
  });

  // Test Case 7: Clicking "Send for Review" button opens SendForReview dialog
  it('clicking "Send for Review" button opens SendForReview dialog', async () => {
    renderComponent(mockChangeControl, { canProjectSubmitForReview: true });
    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();
  });

  // Test Case 8: Dialog close with success updates status and renders "Decide Review" button
  it('dialog close with success updates status and renders "Decide Review" button', async () => {
    const onChangeControlUpdated = vi.fn(() => Promise.resolve());
    renderComponent(mockChangeControl, { canProjectSubmitForReview: true, canProjectSubmitForApproval: true }, onChangeControlUpdated); // Add canProjectSubmitForApproval to show "Decide Review" button

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByText('Submit')); // Click the submit button in the mock dialog

    await waitFor(() => {
      expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();
    });
    expect(onChangeControlUpdated).toHaveBeenCalledTimes(1);
    // After successful update, status becomes "Sent for Review" (id 2).
    // With canProjectSubmitForApproval: true, it should show "Decide Review" button.
    expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });

  // Test Case 9: `onChangeControlUpdated` error handling
  it('logs error if onChangeControlUpdated fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onChangeControlUpdated = vi.fn(() => Promise.reject(new Error('Update failed')));
    renderComponent(mockChangeControl, { canProjectSubmitForReview: true, canProjectSubmitForApproval: true }, onChangeControlUpdated); // Add canProjectSubmitForApproval

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Update failed'));
    });
    consoleErrorSpy.mockRestore();
    // Even with error, localStatusId updates. With canProjectSubmitForApproval: true, it should show "Decide Review" button.
    expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });

  // Test Case 10: Dialog cancellation
  it('handles dialog cancellation correctly', async () => {
    const onChangeControlUpdated = vi.fn();
    renderComponent(mockChangeControl, { canProjectSubmitForReview: true }, onChangeControlUpdated);

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByText('Close')); // Click the close button in the mock dialog

    expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();
    expect(onChangeControlUpdated).not.toHaveBeenCalled();
    // Status remains "Initial". With canProjectSubmitForReview: true, it should still show "Send for Review" button.
    expect(screen.getByRole('button', { name: /Send for Review/i })).toBeInTheDocument();
    expect(screen.queryByText('Initial')).not.toBeInTheDocument(); // Ensure Chip is not rendered
  });
});
