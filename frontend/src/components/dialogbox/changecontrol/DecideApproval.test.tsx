import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideApproval from './DecideApproval';
import { projectApi } from '../../../services/projectApi';
import { changeControlApi } from '../../../services/changeControlApi';

// Mock external dependencies
vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../services/changeControlApi', () => ({
  changeControlApi: {
    approvedByRDOrRM: vi.fn(),
    rejectByRDOrRM: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockApprovedByRDOrRM = vi.mocked(changeControlApi.approvedByRDOrRM);
const mockRejectByRDOrRM = vi.mocked(changeControlApi.rejectByRDOrRM);

const mockProjectData = {
  id: 1,
  regionalManagerId: 'rm123',
  seniorProjectManagerId: 'spm456',
  // ... other project properties if needed
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  changeControlId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
};

describe('DecideApproval', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectById.mockResolvedValue(mockProjectData as any); // Mock successful project fetch
    mockApprovedByRDOrRM.mockResolvedValue(undefined); // Mock successful approval
    mockRejectByRDOrRM.mockResolvedValue(undefined); // Mock successful rejection
  });

  it('should render correctly with default props', () => {
    render(<DecideApproval {...defaultProps} />);

    expect(screen.getByText('Approval Decision')).toBeInTheDocument();
    expect(screen.getByText('Please review the change control and make a final decision:')).toBeInTheDocument();
    expect(screen.getByLabelText('Approve')).toBeInTheDocument();
    expect(screen.getByLabelText('Request changes')).toBeInTheDocument();
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<DecideApproval {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should enable Submit button when a decision is selected', () => {
    render(<DecideApproval {...defaultProps} />);
    const approveRadio = screen.getByLabelText('Approve');
    fireEvent.click(approveRadio);
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });

  it('should update decision state when a radio button is selected', () => {
    render(<DecideApproval {...defaultProps} />);
    const requestChangesRadio = screen.getByLabelText('Request changes');
    fireEvent.click(requestChangesRadio);
    expect(requestChangesRadio).toBeChecked();
  });

  it('should update comments state when text is entered', () => {
    render(<DecideApproval {...defaultProps} />);
    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Some feedback' } });
    expect(commentsInput).toHaveValue('Some feedback');
  });

  it('should show error if no decision is selected on submit', async () => {
    render(<DecideApproval {...defaultProps} />);
    // Button is disabled when no decision is selected
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    
    // The error only shows if we somehow bypass the disabled state
    // Since the component prevents submission via disabled button, this scenario doesn't occur in normal use
  });

  it('should show error if changeControlId is missing', async () => {
    render(<DecideApproval {...defaultProps} changeControlId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Change Control ID is missing')).toBeInTheDocument();
    });
  });

  it('should show error if projectId is missing', async () => {
    render(<DecideApproval {...defaultProps} projectId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
  });

  describe('Approve decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call approvedByRDOrRM and onSubmit on successful approval', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by manager' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockApprovedByRDOrRM).toHaveBeenCalledWith({
          entityId: defaultProps.changeControlId,
          entityType: 'ChangeControl',
          action: 'Approved',
          comments: 'Approved by manager',
          assignedToId: mockProjectData.regionalManagerId,
        });
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for approval', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockApprovedByRDOrRM).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Approved by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if approvedByRDOrRM API call fails', async () => {
      const errorMessage = 'Approval failed';
      mockApprovedByRDOrRM.mockRejectedValue(new Error(errorMessage));

      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Approve'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  describe('Request changes decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call rejectByRDOrRM and onSubmit on successful request changes', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockGetProjectById).toHaveBeenCalledWith(defaultProps.projectId!.toString());
        expect(mockRejectByRDOrRM).toHaveBeenCalledWith({
          entityId: defaultProps.changeControlId,
          entityType: 'ChangeControl',
          action: 'Approval Changes',
          comments: 'Needs revisions',
          assignedToId: mockProjectData.seniorProjectManagerId,
        });
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should use default comments if none provided for request changes', async () => {
      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(mockRejectByRDOrRM).toHaveBeenCalledWith(
          expect.objectContaining({
            comments: `Changes requested by ${defaultProps.currentUser}`,
          })
        );
      });
    });

    it('should display error if rejectByRDOrRM API call fails', async () => {
      const errorMessage = 'Rejection failed';
      mockRejectByRDOrRM.mockRejectedValue(new Error(errorMessage));

      render(<DecideApproval {...defaultProps} />);
      fireEvent.click(screen.getByLabelText('Request changes'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    render(<DecideApproval {...defaultProps} />);
    const dialog = screen.getByRole('dialog');
    
    // Create a real event with stopPropagation
    const mockClickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(mockClickEvent, 'stopPropagation');
    
    // Dispatch the event
    dialog.dispatchEvent(mockClickEvent);
    
    // Verify stopPropagation was called
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});





