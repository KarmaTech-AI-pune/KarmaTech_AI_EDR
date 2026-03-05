
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideReview from './DecideReview';
import { projectApi } from '../../../services/projectApi';
import { changeControlApi } from '../../../services/changeControlApi';
import { ChangeControl } from '../../../models'; // Assuming ChangeControl model is defined

// Mock external dependencies
vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../services/changeControlApi', () => ({
  changeControlApi: {
    sendToApprovalBySPM: vi.fn(),
    rejectBySPM: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockSendToApprovalBySPM = vi.mocked(changeControlApi.sendToApprovalBySPM);
const mockRejectBySPM = vi.mocked(changeControlApi.rejectBySPM);

const mockProjectData = {
  id: 1,
  regionalManagerId: 'rm123',
  projectManagerId: 'pm789', // Project manager ID for rejection path
  // ... other project properties if needed
};

const mockChangeControlData: ChangeControl = {
  id: 101,
  projectId: 1,
  srNo: 1,
  dateLogged: '2023-01-01T10:00:00Z',
  originator: 'Test Originator',
  description: 'Test Change Control Description',
  reason: 'Test Reason',
  impact: 'Test Impact',
  status: 'Pending Review',
  currentStage: 'Review',
  costImpact: 'Low',
  timeImpact: 'None',
  resourcesImpact: 'None',
  qualityImpact: 'None',
  approvalDate: null,
  approvedBy: null,
  rejectionReason: null,
  changeOrderStatus: 'Pending',
  clientApprovalStatus: 'Pending',
  claimSituation: 'None',
  // Add other required properties for ChangeControl if any
} as ChangeControl; // Cast to ChangeControl

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  changeControlId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onDecisionMade: vi.fn(),
};

describe('DecideReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectById.mockResolvedValue(mockProjectData as any); // Mock successful project fetch
    mockSendToApprovalBySPM.mockResolvedValue({ data: mockChangeControlData } as any); // Mock successful approval
    mockRejectBySPM.mockResolvedValue({ data: mockChangeControlData } as any); // Mock successful rejection
  });

  it('should render correctly with default props', () => {
    render(<DecideReview {...defaultProps} />);

    expect(screen.getByText('Review Decision')).toBeInTheDocument();
    expect(screen.getByText('Please review the change control and make a decision:')).toBeInTheDocument();
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
    
    expect(mockSendToApprovalBySPM).not.toHaveBeenCalled();
    expect(mockRejectBySPM).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if changeControlId is missing', async () => {
    render(<DecideReview {...defaultProps} changeControlId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve and send for final approval')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Change Control ID is missing')).toBeInTheDocument();
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

    it('should call sendToApprovalBySPM and onDecisionMade on successful approval', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Reviewed and approved' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockSendToApprovalBySPM).toHaveBeenCalledWith({
          entityId: defaultProps.changeControlId,
          entityType: 'ChangeControl',
          action: 'Approval',
          comments: 'Reviewed and approved',
          assignedToId: mockProjectData.regionalManagerId,
        });
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onDecisionMade).toHaveBeenCalledWith(mockChangeControlData);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for approval', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockSendToApprovalBySPM).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Reviewed and sent for approval by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if sendToApprovalBySPM API call fails', async () => {
      const errorMessage = 'Approval failed';
      mockSendToApprovalBySPM.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve and send for final approval'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Request changes decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call rejectBySPM and onDecisionMade on successful request changes', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions from PM' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockRejectBySPM).toHaveBeenCalledWith({
          entityId: defaultProps.changeControlId,
          entityType: 'ChangeControl',
          action: 'Reject',
          comments: 'Needs revisions from PM',
          assignedToId: mockProjectData.projectManagerId,
          decisionType: 'Review'
        });
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onDecisionMade).toHaveBeenCalledWith(mockChangeControlData);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for request changes', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockRejectBySPM).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Changes requested by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if rejectBySPM API call fails', async () => {
      const errorMessage = 'Rejection failed';
      mockRejectBySPM.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
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
    fireEvent.keyDown(dialog, { key: 'Enter' });
    
    // onClose should still not be called
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });
});
