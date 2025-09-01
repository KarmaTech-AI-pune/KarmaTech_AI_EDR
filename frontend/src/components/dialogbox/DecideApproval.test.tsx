import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import DecideApproval from './DecideApproval';

// Mock Material UI components
vi.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: ({ children, onClose, open, maxWidth, fullWidth, onClick, slotProps, sx }: any) => (
    <div
      data-testid="mock-dialog"
      onClick={onClick}
      style={{ display: open ? 'block' : 'none', zIndex: sx?.zIndex }}
    >
      {children}
      <button onClick={() => onClose({}, 'backdropClick')}>Close</button> {/* Simulate backdrop click */}
    </div>
  ),
}));
vi.mock('@mui/material/DialogTitle', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => <h2 data-testid="mock-dialog-title" onClick={onClick}>{children}</h2>,
}));
vi.mock('@mui/material/DialogContent', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => <div data-testid="mock-dialog-content" onClick={onClick}>{children}</div>,
}));
vi.mock('@mui/material/DialogActions', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => <div data-testid="mock-dialog-actions" onClick={onClick}>{children}</div>,
}));
vi.mock('@mui/material/TextField', () => ({
  __esModule: true,
  default: (props: any) => (
    <input
      data-testid="mock-textfield"
      {...props}
      value={props.value || ''}
      onChange={(e) => props.onChange(e)}
      onClick={(e) => e.stopPropagation()}
    />
  ),
}));
vi.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: (props: any) => (
    <button
      data-testid={`mock-button-${props.children?.toLowerCase().replace(' ', '-')}`}
      {...props}
      onClick={(e) => {
        props.onClick(e);
        e.stopPropagation(); // Prevent propagation for buttons within dialog
      }}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  ),
}));
vi.mock('@mui/material/FormControl', () => ({
  __esModule: true,
  default: ({ children, error, onClick }: any) => (
    <div data-testid="mock-form-control" style={{ border: error ? '1px solid red' : 'none' }} onClick={onClick}>
      {children}
    </div>
  ),
}));
vi.mock('@mui/material/InputLabel', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => <label data-testid="mock-input-label" onClick={onClick}>{children}</label>,
}));
vi.mock('@mui/material/Select', () => ({
  __esModule: true,
  default: ({ children, value, onChange, label, onClick }: any) => (
    <div data-testid="mock-select-container" onClick={onClick}>
      <select
        data-testid="mock-select"
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } } as any)}
        aria-label={label}
      >
        {children}
      </select>
    </div>
  ),
}));
vi.mock('@mui/material/MenuItem', () => ({
  __esModule: true,
  default: ({ children, onClick }: any) => (
    <div data-testid="mock-menu-item" onClick={(e) => { onClick(e); e.stopPropagation(); }}>{children}</div>
  ),
}));
vi.mock('@mui/material/FormHelperText', () => ({
  __esModule: true,
  default: ({ children }: any) => <span data-testid="mock-form-helper-text">{children}</span>,
}));


// Mock services
const mockLogApprovalDecision = vi.fn();
const mockLogStatusChange = vi.fn();
vi.mock('../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logApprovalDecision: mockLogApprovalDecision,
    logStatusChange: mockLogStatusChange,
  },
}));

const mockUpdateWorkflow = vi.fn();
vi.mock('../../dummyapi/opportunityWorkflowApi', () => ({
  updateWorkflow: mockUpdateWorkflow,
}));

const mockSendToApprove = vi.fn();
const mockRejectOpportunityByRegionalDirector = vi.fn();
vi.mock('../../services/opportunityApi', () => ({
  opportunityApi: {
    sendToApprove: mockSendToApprove,
    rejectOpportunityByRegionalDirector: mockRejectOpportunityByRegionalDirector,
  },
}));

// Default props and state for tests
const defaultProps = {
  open: true,
  onClose: vi.fn(),
  opportunityId: 1,
  currentUser: 'testuser',
  onSubmit: vi.fn(),
};

const defaultAuthState = { // Assuming useAuth might be used elsewhere, but not directly in this component's logic for testing
  user: { id: 1, name: 'John Doe' },
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn()
};

describe('DecideApproval', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default successful behavior
    mockLogApprovalDecision.mockResolvedValue(undefined);
    mockLogStatusChange.mockResolvedValue(undefined);
    mockUpdateWorkflow.mockResolvedValue(undefined);
    mockSendToApprove.mockResolvedValue(undefined);
    mockRejectOpportunityByRegionalDirector.mockResolvedValue(undefined);
  });

  describe('when component loads', () => {
    it('should render correctly with default props', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      expect(screen.getByTestId('mock-dialog-title')).toHaveTextContent('Decide Approval');
      expect(screen.getByLabelText('Decision')).toBeInTheDocument();
      expect(screen.getByLabelText('Comments')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
    });

    it('should close the dialog when cancel button is clicked', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should close the dialog when backdrop is clicked', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      // Simulate a click on the backdrop by clicking the mock dialog's close button
      fireEvent.click(screen.getByText('Close')); 
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('when user interacts', () => {
    it('should enable submit button and allow comments when decision is selected', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      
      // Select 'Approve'
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'approve' } });
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled(); // Still disabled because comments are missing

      // Add comments
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Looks good' } });
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });

    it('should display error if submitting without selecting a decision', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
      
      expect(screen.getByText('Please select a decision')).toBeVisible();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should display error if submitting without comments', () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'approve' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
      
      expect(screen.getByText('Comments are required')).toBeVisible();
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('when submitting decision', () => {
    it('should call api functions correctly when approving', async () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'approve' } });
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved for next stage' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockSendToApprove).toHaveBeenCalledTimes(1);
        expect(mockSendToApprove).toHaveBeenCalledWith({
          opportunityId: defaultProps.opportunityId,
          action: 'Approve',
          comments: 'Approved for next stage',
          approvalRegionalDirectorId: ''
        });

        expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
        expect(mockUpdateWorkflow).toHaveBeenCalledWith(defaultProps.opportunityId, '6', {
          status: 'Approved',
          approvalComments: 'Approved for next stage',
        });

        expect(mockLogApprovalDecision).toHaveBeenCalledTimes(1);
        expect(mockLogApprovalDecision).toHaveBeenCalledWith(
          defaultProps.opportunityId,
          'approved',
          defaultProps.currentUser,
          'Approved for next stage'
        );

        expect(mockLogStatusChange).toHaveBeenCalledTimes(1);
        expect(mockLogStatusChange).toHaveBeenCalledWith(
          defaultProps.opportunityId,
          'Pending Approval',
          'Approved',
          defaultProps.currentUser
        );

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should call api functions correctly when rejecting', async () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'reject' } });
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Not approved due to missing info' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockRejectOpportunityByRegionalDirector).toHaveBeenCalledTimes(1);
        expect(mockRejectOpportunityByRegionalDirector).toHaveBeenCalledWith({
          opportunityId: defaultProps.opportunityId,
          action: 'Reject',
          comments: 'Not approved due to missing info',
          approvalRegionalDirectorId: ''
        });

        expect(mockUpdateWorkflow).toHaveBeenCalledTimes(1);
        expect(mockUpdateWorkflow).toHaveBeenCalledWith(defaultProps.opportunityId, '5', {
          status: 'Approval Rejected',
          approvalComments: 'Not approved due to missing info',
        });

        expect(mockLogApprovalDecision).toHaveBeenCalledTimes(1);
        expect(mockLogApprovalDecision).toHaveBeenCalledWith(
          defaultProps.opportunityId,
          'rejected',
          defaultProps.currentUser,
          'Not approved due to missing info'
        );

        expect(mockLogStatusChange).toHaveBeenCalledTimes(1);
        expect(mockLogStatusChange).toHaveBeenCalledWith(
          defaultProps.opportunityId,
          'Pending Approval', // Assuming this is the state before rejection
          'Approval Rejected',
          defaultProps.currentUser
        );

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should display an error message if API call fails', async () => {
      const apiError = new Error('Network error during submission');
      mockSendToApprove.mockRejectedValue(apiError); // Simulate an error for approval
      mockUpdateWorkflow.mockRejectedValue(apiError); // Simulate an error for workflow update

      render(<DecideApproval {...defaultProps} open={true} />);
      
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'approve' } });
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Test error' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText('Network error during submission')).toBeVisible();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  // Error Handling Tests
  describe('when handling errors', () => {
    it('should display error for missing decision on submit', async () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
      await waitFor(() => {
        expect(screen.getByText('Please select a decision')).toBeVisible();
      });
    });

    it('should display error for missing comments on submit', async () => {
      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'approve' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
      await waitFor(() => {
        expect(screen.getByText('Comments are required')).toBeVisible();
      });
    });

    it('should handle API rejection error gracefully', async () => {
      const rejectionError = new Error('Failed to reject opportunity');
      mockRejectOpportunityByRegionalDirector.mockRejectedValue(rejectionError);

      render(<DecideApproval {...defaultProps} open={true} />);
      fireEvent.change(screen.getByLabelText('Decision'), { target: { value: 'reject' } });
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Rejection comments' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to reject opportunity')).toBeVisible();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });
})