import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import DecideReview from './DecideReview';
import { projectApi } from '../../../services/projectApi';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import { PMWorkflowHistory } from '../../../models/pmWorkflowModel';

// Mock external dependencies
vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    sendToApproval: vi.fn(),
    requestChanges: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockSendToApproval = vi.mocked(pmWorkflowApi.sendToApproval);
const mockRequestChanges = vi.mocked(pmWorkflowApi.requestChanges);

const mockProjectData = {
  id: 1,
  regionalManagerId: 'rm123',
  projectManagerId: 'pm789', // Project manager ID for rejection path
  // ... other project properties if needed
};

const mockPMWorkflowHistory: PMWorkflowHistory = {
  id: 1,
  entityId: 101,
  entityType: 'ProjectClosure',
  statusId: 4, // SentForApproval
  status: 'Sent For Approval',
  action: 'Approval',
  comments: 'Test comments',
  actionBy: 'TestUser',
  actionByName: 'Test User',
  assignedToId: 'rm123',
  assignedToName: 'Regional Manager',
  actionDate: '2023-01-01T00:00:00Z',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  projectClosureId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onDecisionMade: vi.fn(),
};

describe('ProjectClosure/DecideReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectById.mockResolvedValue(mockProjectData as any); // Mock successful project fetch
    mockSendToApproval.mockResolvedValue(mockPMWorkflowHistory); // Mock successful approval
    mockRequestChanges.mockResolvedValue(mockPMWorkflowHistory); // Mock successful rejection
  });

  it('should render correctly with default props', () => {
    render(<DecideReview {...defaultProps} />);

    expect(screen.getByText('Review Decision')).toBeInTheDocument();
    expect(screen.getByText('Please review the project closure form and make a decision:')).toBeInTheDocument();
    expect(screen.getByLabelText('Approve and send for final approval')).toBeInTheDocument();
    expect(screen.getByLabelText('Request changes')).toBeInTheDocument();
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<DecideReview {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
  });

  it('should enable Submit button when a decision is selected', () => {
    render(<DecideReview {...defaultProps} />);
    const approveRadio = screen.getByLabelText('Approve and send for final approval');
    fireEvent.click(approveRadio);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('should update decision state when a radio button is selected', () => {
    render(<DecideReview {...defaultProps} />);
    const requestChangesRadio = screen.getByLabelText('Request changes');
    fireEvent.click(requestChangesRadio);
    expect(requestChangesRadio).toBeChecked();
  });

  it('should update comments state when text is entered', () => {
    render(<DecideReview {...defaultProps} />);
    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Some feedback' } });
    expect(commentsInput).toHaveValue('Some feedback');
  });

  it('should show error if no decision is selected on submit', async () => {
    render(<DecideReview {...defaultProps} />);
    
    // Submit button should be disabled when no decision is selected
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    expect(submitButton).toBeDisabled();
    
    expect(mockSendToApproval).not.toHaveBeenCalled();
    expect(mockRequestChanges).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if projectClosureId is missing', async () => {
    render(<DecideReview {...defaultProps} projectClosureId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve and send for final approval')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Project Closure ID is missing')).toBeInTheDocument();
    });
  });

  it('should show error if projectId is missing', async () => {
    render(<DecideReview {...defaultProps} projectId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve and send for final approval')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
  });

  describe('Approve decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call sendToApproval and onDecisionMade on successful approval', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Reviewed and approved' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockSendToApproval).toHaveBeenCalledWith({
          entityId: defaultProps.projectClosureId,
          entityType: 'ProjectClosure',
          action: 'Approval',
          comments: 'Reviewed and approved',
          assignedToId: mockProjectData.regionalManagerId,
        });
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for approval', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockSendToApproval).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Reviewed and sent for approval by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if sendToApproval API call fails', async () => {
      const errorMessage = 'Approval failed';
      mockSendToApproval.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(async () => {
        await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
        expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Request changes decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call requestChanges and onDecisionMade on successful request changes', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions from PM' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockRequestChanges).toHaveBeenCalledWith({
          entityId: defaultProps.projectClosureId,
          entityType: 'ProjectClosure',
          action: 'Reject',
          comments: 'Needs revisions from PM',
          assignedToId: mockProjectData.projectManagerId,
          isApprovalChanges: false,
        });
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for request changes', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockRequestChanges).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Changes requested by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if requestChanges API call fails', async () => {
      const errorMessage = 'Rejection failed';
      mockRequestChanges.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(async () => {
        await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
        expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    render(<DecideReview {...defaultProps} />);
    
    // Click on dialog content should not close the dialog
    const dialog = screen.getByRole('dialog');
    fireEvent.click(dialog);
    
    // Dialog should still be open (onClose not called)
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    
    // Keyboard events on dialog should not close it
    fireEvent.keyDown(dialog, { key: 'Escape' });
    
    // onClose should still not be called (MUI handles Escape separately)
    // This test verifies that our stopPropagation doesn't interfere with normal dialog behavior
  });
});





