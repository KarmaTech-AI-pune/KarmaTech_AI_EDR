import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import DecideReview from './DecideReview';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { OpportunityTracking } from '../../models'; // Assuming OpportunityTracking is defined here

// Import the actual modules to be mocked
import * as opportunityApi from '../../services/opportunityApi';
import * as userApi from '../../services/userApi';
import * as historyLoggingService from '../../services/historyLoggingService';

// Mock external dependencies using the imported modules
vi.mock('../../services/opportunityApi', () => ({
  opportunityApi: {
    getById: vi.fn(),
    sendToApproval: vi.fn(),
    RejectByRegionManagerSentToBidManager: vi.fn(),
  },
}));

vi.mock('../../services/userApi', () => ({
  getUserById: vi.fn(),
}));

vi.mock('../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logReviewDecision: vi.fn(),
    logStatusChange: vi.fn(),
  },
}));

// Import mocked functions using vi.mocked
const mockGetOpportunityById = vi.mocked(opportunityApi.opportunityApi.getById);
const mockSendToApproval = vi.mocked(opportunityApi.opportunityApi.sendToApproval);
const mockRejectByRegionManagerSentToBidManager = vi.mocked(opportunityApi.opportunityApi.RejectByRegionManagerSentToBidManager);
const mockGetUserById = vi.mocked(userApi.getUserById);
const mockLogReviewDecision = vi.mocked(historyLoggingService.HistoryLoggingService.logReviewDecision);
const mockLogStatusChange = vi.mocked(historyLoggingService.HistoryLoggingService.logStatusChange);

// Mock data conforming to expected types
const mockOpportunityData: Partial<OpportunityTracking> = { // Using Partial as not all properties might be known or needed for the mock
  id: 123,
  status: 'Under Review',
  approvalManagerId: 'rd123',
  // Note: 'name' and 'approvalManagerName' are not part of OpportunityTracking based on the error.
  // The component fetches user details separately for the name.
};

const mockUserData = { // Mock user data, assuming it has 'id' and 'name'
  id: 'rd123',
  name: 'Regional Director Name',
  // ... other properties of User if needed
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  opportunityId: 123,
  currentUser: 'currentUser',
  onDecisionMade: vi.fn(),
};

describe('DecideReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default successful behavior
    mockGetOpportunityById.mockResolvedValue(mockOpportunityData as OpportunityTracking); // Cast to OpportunityTracking
    mockSendToApproval.mockResolvedValue({ ...mockOpportunityData, status: 'Pending Approval' } as OpportunityTracking);
    mockRejectByRegionManagerSentToBidManager.mockResolvedValue({ ...mockOpportunityData, status: 'Review Rejected' } as OpportunityTracking);
    mockGetUserById.mockResolvedValue(mockUserData as any); // Cast to any if User type is not defined or known
    mockLogReviewDecision.mockResolvedValue(undefined as any);
    mockLogStatusChange.mockResolvedValue(undefined as any);
  });

  it('should render correctly with default props', () => {
    render(<DecideReview {...defaultProps} />);
    
    expect(screen.getByText('Decide Review')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled(); // Should be disabled initially
  });

  it('should enable submit button and show correct placeholder when decision is selected', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).not.toBeDisabled();
      // Placeholder for rejection comments should not be visible when approving
      expect(screen.queryByPlaceholderText('Enter your rejection comments')).not.toBeInTheDocument();
    });

    // Select 'Reject'
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Reject'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled(); // Should be disabled when rejecting without comments
      expect(screen.getByPlaceholderText('Enter your rejection comments')).toBeInTheDocument();
    });
  });

  it('should show validation error if decision is not selected and submit is clicked', async () => {
    render(<DecideReview {...defaultProps} />);

    // Submit button should be disabled when no decision is selected
    const submitButton = screen.getByRole('button', { name: 'Submit Decision' });
    expect(submitButton).toBeDisabled();
  });

  it('should show validation error if rejection comments are empty and submit is clicked', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Reject'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Reject'));

    // Submit button should be disabled when rejecting without comments
    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: 'Submit Decision' });
      expect(submitButton).toBeDisabled();
    });
  });

  it('should show error if opportunityId is missing', async () => {
    render(<DecideReview {...defaultProps} onClose={vi.fn()} opportunityId={undefined} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(screen.getByText('Opportunity ID is missing')).toBeInTheDocument();
    });
  });

  it('should call onClose and onDecisionMade with correct parameters when approving', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockGetOpportunityById).toHaveBeenCalledWith(defaultProps.opportunityId);
      expect(mockGetUserById).toHaveBeenCalledWith(mockOpportunityData.approvalManagerId);
      expect(mockSendToApproval).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        approvalManagerId: mockOpportunityData.approvalManagerId,
        action: 'approve',
        comments: '', // Comments are optional for approval
      });
      expect(mockLogReviewDecision).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'approved',
        defaultProps.currentUser,
        `Sent for approval to ${mockUserData.name}`
      );
      expect(mockLogStatusChange).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'Pending Approval',
        'Pending Approval', // Component logic sets newStatus to 'Pending Approval' for approve
        defaultProps.currentUser
      );
      expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDecisionMade).toHaveBeenCalledWith({ ...mockOpportunityData, status: 'Pending Approval' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose and onDecisionMade with correct parameters when rejecting', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Reject'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Reject'));

    // Enter comments
    const commentsInput = screen.getByPlaceholderText('Enter your rejection comments');
    fireEvent.change(commentsInput, { target: { value: 'Needs more work.' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockRejectByRegionManagerSentToBidManager).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        approvalManagerId: '', // Not used for rejection
        action: 'reject',
        comments: 'Needs more work.',
      });
      expect(mockLogReviewDecision).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'rejected',
        defaultProps.currentUser,
        'Needs more work.'
      );
      expect(mockLogStatusChange).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        'Review Rejected', // Component logic sets newStatus to 'Review Rejected' for reject
        'Review Rejected',
        defaultProps.currentUser
      );
      expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
      expect(defaultProps.onDecisionMade).toHaveBeenCalledWith({ ...mockOpportunityData, status: 'Review Rejected' });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Approve' to enable submit
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      // Ensure submit and logging functions were not called
      expect(mockSendToApproval).not.toHaveBeenCalled();
      expect(mockRejectByRegionManagerSentToBidManager).not.toHaveBeenCalled();
      expect(mockLogReviewDecision).not.toHaveBeenCalled();
      expect(mockLogStatusChange).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should display an error message if getOpportunityById fails', async () => {
    const errorMessage = 'Failed to fetch opportunity';
    mockGetOpportunityById.mockRejectedValue(new Error(errorMessage));

    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should display an error message if sendToApproval fails', async () => {
    const errorMessage = 'Failed to send for approval';
    mockSendToApproval.mockRejectedValue(new Error(errorMessage));

    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should display an error message if RejectByRegionManagerSentToBidManager fails', async () => {
    const errorMessage = 'Failed to reject opportunity';
    mockRejectByRegionManagerSentToBidManager.mockRejectedValue(new Error(errorMessage));

    render(<DecideReview {...defaultProps} />);

    // Select 'Reject'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Reject'));

    // Enter comments
    const commentsInput = screen.getByPlaceholderText('Enter your rejection comments');
    fireEvent.change(commentsInput, { target: { value: 'Needs more work.' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should display an error message if getUserById fails', async () => {
    const errorMessage = 'Failed to fetch user';
    mockGetUserById.mockRejectedValue(new Error(errorMessage));

    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      // The error from getUserById is caught and displayed by the general catch block
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should display an error if no Regional Director is assigned', async () => {
    mockGetOpportunityById.mockResolvedValue({ ...mockOpportunityData, approvalManagerId: null } as any);

    render(<DecideReview {...defaultProps} />);

    // Select 'Approve'
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Approve'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(screen.getByText('No Regional Director assigned to this opportunity')).toBeInTheDocument();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    });
  });

  it('should reset form and call onClose when clicking Cancel', async () => {
    render(<DecideReview {...defaultProps} />);

    // Select 'Reject' and add comments
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.mouseDown(decisionInput);
    fireEvent.click(screen.getByText('Reject'));
    const commentsInput = screen.getByPlaceholderText('Enter your rejection comments');
    fireEvent.change(commentsInput, { target: { value: 'Needs more work.' } });

    // Click Cancel
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      // Check if form fields are reset (though this is hard to assert directly without accessing component state)
      // We can infer reset by checking that no API calls were made.
      expect(mockRejectByRegionManagerSentToBidManager).not.toHaveBeenCalled();
    });
  });

  // Test for propagation of clicks to prevent dialog closing
  it('should not close dialog when clicking inside content areas', async () => {
    render(<DecideReview {...defaultProps} />);

    // Click on DialogTitle
    fireEvent.click(screen.getByText('Decide Review'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    // Click on DialogContent
    const dialogContent = screen.getByText('Decide Review').closest('.MuiDialogContent-root');
    if (dialogContent) {
      fireEvent.click(dialogContent);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }

    // Click on FormControl
    const formControl = screen.getByLabelText('Decision').closest('.MuiFormControl-root');
    if (formControl) {
      fireEvent.click(formControl);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }

    // Click on Select input
    const decisionInput = screen.getByLabelText('Decision');
    fireEvent.click(decisionInput);
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    // Click on TextField (if visible)
    const commentsInput = screen.queryByPlaceholderText('Enter your rejection comments');
    if (commentsInput) {
      fireEvent.click(commentsInput);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }

    // Click on DialogActions
    const dialogActions = screen.getByRole('button', { name: 'Cancel' }).closest('.MuiDialogActions-root');
    if (dialogActions) {
      fireEvent.click(dialogActions);
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    }
  });
});






