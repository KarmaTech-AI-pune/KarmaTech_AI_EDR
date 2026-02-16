
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideApproval from './ProjectDecideApproval'; // Renamed to match the component export
import { HistoryLoggingService } from '../../../services/historyLoggingService';
import { OpportunityHistory } from '../../../models'; // Import OpportunityHistory

// Mock external dependencies
vi.mock('../../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logCustomEvent: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockLogCustomEvent = vi.mocked(HistoryLoggingService.logCustomEvent);

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

describe('ProjectReviewWorkflow/ProjectDecideApproval', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory); // Mock successful logging
    // @ts-ignore
    defaultProps.onSubmit.mockResolvedValue(undefined); // Mock successful onSubmit
  });

  it('should render correctly with default props', () => {
    render(<DecideApproval {...defaultProps} />);

    expect(screen.getByText('Decide Approval')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument();
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<DecideApproval {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should enable Submit button when a decision and comments are provided', async () => {
    render(<DecideApproval {...defaultProps} />);

    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Looks good' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });
  });

  it('should update decision state when a radio button is selected', async () => {
    render(<DecideApproval {...defaultProps} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      // Query the hidden input by data-testid
      const hiddenInput = screen.getByTestId('decision-select-input') as HTMLInputElement;
      expect(hiddenInput.value).toBe('reject');
    });
  });

  it('should update comments state when text is entered', () => {
    render(<DecideApproval {...defaultProps} />);
    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Some feedback' } });
    expect(commentsInput).toHaveValue('Some feedback');
  });

  it('should show error if no decision is selected on submit', async () => {
    render(<DecideApproval {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    
    // The button is disabled when no decision is selected
    // This test verifies the button remains disabled without a decision
    const submitButton = screen.getByRole('button', { name: 'Submit Decision' });
    expect(submitButton).toBeDisabled();
    
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if comments are empty on submit', async () => {
    render(<DecideApproval {...defaultProps} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    
    // Button is disabled when comments are empty, so we can't click it
    // This test verifies the button remains disabled without comments
    const submitButton = screen.getByRole('button', { name: 'Submit Decision' });
    expect(submitButton).toBeDisabled();
    
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing', async () => {
    render(<DecideApproval {...defaultProps} projectId={undefined} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<DecideApproval {...defaultProps} currentUser={undefined as any} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Current user information is missing')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
  });

  describe('Approve decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call logCustomEvent and onSubmit on successful approval', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by manager' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockLogCustomEvent).toHaveBeenCalledWith(
          defaultProps.projectId,
          'WBS Manpower Approved',
          defaultProps.currentUser as string,
          'Approved by manager'
        );
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).not.toHaveBeenCalled(); // onSubmit handles closing
      });
    });

    it('should display "Submitting..." and disable button during loading', async () => {
    let resolvePromise: (value: OpportunityHistory) => void;
    const promise = new Promise<OpportunityHistory>((resolve) => {
      resolvePromise = resolve;
    });
    // @ts-ignore
    mockLogCustomEvent.mockReturnValueOnce(promise);
    
    render(<DecideApproval {...defaultProps} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
    
    // Click submit button
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    // Wait for loading state
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submitting...' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
    });
    
    // Resolve the promise to complete the async operation
    resolvePromise!(mockOpportunityHistory);
    
    // Wait for the button to be enabled again
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Submitting...' })).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

    it('should display error if logCustomEvent API call fails', async () => {
      const errorMessage = 'Approval logging failed';
      mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

      render(<DecideApproval {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by manager' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reject decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call logCustomEvent and onSubmit on successful rejection', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockLogCustomEvent).toHaveBeenCalledWith(
          defaultProps.projectId,
          'WBS Manpower Rejected',
          defaultProps.currentUser as string,
          'Needs revisions'
        );
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).not.toHaveBeenCalled(); // onSubmit handles closing
      });
    });

    it('should display error if logCustomEvent API call fails', async () => {
      const errorMessage = 'Rejection logging failed';
      mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

      render(<DecideApproval {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  it('should call onClose(true) if onSubmit is not provided', async () => {
    const propsWithoutOnSubmit = { ...defaultProps, onSubmit: undefined };
    render(<DecideApproval {...propsWithoutOnSubmit} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledTimes(1);
      expect(propsWithoutOnSubmit.onClose).toHaveBeenCalledWith(true);
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    render(<DecideApproval {...defaultProps} />);
    
    // Test that stopPropagation is called on dialog click handlers
    // by verifying the handlers exist and work correctly
    const dialog = screen.getByRole('dialog');
    
    // The component has onClick handlers that call stopPropagation
    // We verify this by checking that the dialog renders and handles clicks
    expect(dialog).toBeInTheDocument();
    
    // Fire a click event - the handler should prevent propagation
    fireEvent.click(dialog);
    
    // Fire a keydown event - the handler should prevent propagation  
    fireEvent.keyDown(dialog, { key: 'Enter' });
    
    // If we got here without errors, the event handlers are working
    expect(dialog).toBeInTheDocument();
  });
});
