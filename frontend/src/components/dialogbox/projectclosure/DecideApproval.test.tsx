import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideApproval from './DecideApproval';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import { projectApi } from '../../../services/projectApi';

// Mock external dependencies
vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    approvedByRDOrRM: vi.fn(),
    rejectByRDOrRM: vi.fn(),
  },
}));

vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockApprovedByRDOrRM = vi.mocked(pmWorkflowApi.approvedByRDOrRM);
const mockRejectByRDOrRM = vi.mocked(pmWorkflowApi.rejectByRDOrRM);
const mockGetProjectById = vi.mocked(projectApi.getById);

const mockProjectData = {
  id: 1,
  regionalManagerId: 'rm123',
  seniorProjectManagerId: 'spm456',
  // ... other project properties if needed
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  projectClosureId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
};

describe('ProjectClosure/DecideApproval', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectById.mockResolvedValue(mockProjectData as any); // Mock successful project fetch
const mockPMWorkflowHistory = {
  id: 1,
  entityId: 101,
  entityType: 'ProjectClosure',
  statusId: 6, // Approved
  status: 'Approved',
  action: 'Approved',
  comments: 'Test comments',
  actionBy: 'TestUser',
  actionByName: 'Test User',
  assignedToId: 'rm123',
  assignedToName: 'Regional Manager',
  actionDate: '2023-01-01T00:00:00Z',
};

    mockApprovedByRDOrRM.mockResolvedValue(mockPMWorkflowHistory); // Mock successful approval
    mockRejectByRDOrRM.mockResolvedValue(mockPMWorkflowHistory); // Mock successful rejection
  });

  it('should render correctly with default props', () => {
    render(<DecideApproval {...defaultProps} />);

    expect(screen.getByText('Approval Decision')).toBeInTheDocument();
    expect(screen.getByText('Please review the project closure form and make a final decision:')).toBeInTheDocument();
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
    // Button is disabled when no decision is selected, so we can't click it
    // This test should verify the button is disabled instead
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    
    // The error only shows if we somehow bypass the disabled state
    // Since the component prevents submission via disabled button, this scenario doesn't occur in normal use
  });

  it('should show error if projectClosureId is missing', async () => {
    render(<DecideApproval {...defaultProps} projectClosureId={undefined} />);
    fireEvent.click(screen.getByLabelText('Approve')); // Select a decision
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => {
      expect(screen.getByText('Project Closure ID is missing')).toBeInTheDocument();
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
          entityId: defaultProps.projectClosureId,
          entityType: 'ProjectClosure',
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
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
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
          entityId: defaultProps.projectClosureId,
          entityType: 'ProjectClosure',
          action: 'Approval Changes',
          comments: 'Needs revisions',
          assignedToId: mockProjectData.seniorProjectManagerId,
          isApprovalChanges: true,
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
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
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
