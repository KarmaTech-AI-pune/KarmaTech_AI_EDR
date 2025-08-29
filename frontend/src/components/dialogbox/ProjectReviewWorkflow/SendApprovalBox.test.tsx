import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendApprovalBox from './SendApprovalBox';
import { projectManagementAppContext } from '../../../App';
import { Project } from '../../../models';
import { AuthUser } from '../../../models/userModel';
import { TaskType } from '../../../types/wbs';
import { ProjectStatus } from '../../../types'; // Import ProjectStatus

// Mock the context
const mockContext = {
  selectedProject: {
    id: '1',
    name: 'Test Project',
    projectManagerId: 'pm1',
    seniorProjectManagerId: 'spm123',
    regionalManagerId: 'rm456',
    status: ProjectStatus.InProgress, // Changed to enum value
    projectNo: 'TP-001',
    typeOfJob: 'Development',
    sector: 'IT',
    clientName: 'Test Client',
    typeOfClient: 'Enterprise',
    estimatedProjectCost: 100000,
    estimatedProjectFee: 20000,
    feeType: 'Fixed',
    currency: 'USD',
    letterOfAcceptance: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    priority: 'High',
    region: 'North',
    office: 'Main',
    details: 'Project details',
    startDate: '2023-01-01T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    opportunityId: 123,
    opportunityTrackingId: 456,
  } as Project,
  currentUser: {
    id: 'user1',
    name: 'Test User',
    userName: 'testuser',
    email: 'test@example.com',
    standardRate: 0,
    isConsultant: false,
    createdAt: '2023-01-01T00:00:00Z',
    roles: [],
    password: 'password123',
  } as AuthUser,
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  entityId: 101,
  entityType: 'Project',
  formType: TaskType.Manpower,
};

describe('ProjectReviewWorkflow/SendApprovalBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    defaultProps.onSubmit.mockImplementation(vi.fn());
  });

  it('should render correctly for "Decide Review" status', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Review" />
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByText('Decide Review')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
    expect(screen.queryByLabelText('Comments')).not.toBeInTheDocument(); // Comments not required initially for review
  });

  it('should render correctly for "Decide Approval" status', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Approval" />
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByText('Decide Approval')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument();
    expect(screen.getByLabelText('Comments')).toBeInTheDocument(); // Comments required for approval
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should enable Submit button when decision and comments are provided for approval status', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Approval" />
      </projectManagementAppContext.Provider>
    );

    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by manager' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });
  });

  it('should enable Submit button when decision is reject and comments are provided for review status', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Review" />
      </projectManagementAppContext.Provider>
    );

    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Reject'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs changes' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });
  });

  it('should show error if no decision is selected on submit', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Approval" />
      </projectManagementAppContext.Provider>
    );
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Please select a decision')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should show error if comments are empty for approval status', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Approval" />
      </projectManagementAppContext.Provider>
    );
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Comments are required')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should show error if comments are empty for rejection in review status', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Review" />
      </projectManagementAppContext.Provider>
    );
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Reject'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Please provide comments for rejection')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should not require comments for approval in review status', async () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Review" />
      </projectManagementAppContext.Provider>
    );
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          statusId: 4,
          Action: 'Approval',
          comments: '',
          AssignedTo: mockContext.selectedProject.regionalManagerId,
        })
      );
    });
  });

  it('should show error if current user is missing from context', async () => {
    const contextWithoutUser = { ...mockContext, currentUser: undefined };
    render(
      <projectManagementAppContext.Provider value={contextWithoutUser as any}>
        <SendApprovalBox {...defaultProps} status="Sent for Approval" />
      </projectManagementAppContext.Provider>
    );
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('User information is missing')).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  describe('Review Status (Sent for Review)', () => {
    it('should submit with correct payload for approve decision', async () => {
      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Review" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            statusId: 4,
            Action: 'Approval',
            comments: '',
            AssignedBy: mockContext.currentUser.id,
            AssignedTo: mockContext.selectedProject.regionalManagerId,
            entityId: defaultProps.entityId,
            entityType: defaultProps.entityType,
            formType: defaultProps.formType,
          })
        );
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should submit with correct payload for reject decision with comments', async () => {
      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Review" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs more details' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            statusId: 3,
            Action: 'Reject',
            comments: 'Needs more details',
            AssignedBy: mockContext.currentUser.id,
            AssignedTo: mockContext.selectedProject.projectManagerId,
            entityId: defaultProps.entityId,
            entityType: defaultProps.entityType,
            formType: defaultProps.formType,
          })
        );
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show error if no Regional Manager assigned for approval', async () => {
      const projectWithoutRM = { ...mockContext.selectedProject, regionalManagerId: undefined };
      const contextWithoutRM = { ...mockContext, selectedProject: projectWithoutRM };
      render(
        <projectManagementAppContext.Provider value={contextWithoutRM as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Review" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText('No Regional Manager assigned to this project')).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should show error if no Project Manager assigned for rejection', async () => {
      const projectWithoutPM = { ...mockContext.selectedProject, projectManagerId: undefined };
      const contextWithoutPM = { ...mockContext, selectedProject: projectWithoutPM };
      render(
        <projectManagementAppContext.Provider value={contextWithoutPM as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Review" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs changes' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText('No Project Manager assigned to this project')).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Approval Status (Sent for Approval)', () => {
    it('should submit with correct payload for approve decision with comments', async () => {
      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Approval" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Final approval' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            statusId: 6,
            Action: 'Approved',
            comments: 'Final approval',
            AssignedBy: mockContext.currentUser.id,
            AssignedTo: mockContext.currentUser.id, // Assigned to current user for final approval
            entityId: defaultProps.entityId,
            entityType: defaultProps.entityType,
            formType: defaultProps.formType,
          })
        );
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should submit with correct payload for reject decision with comments', async () => {
      render(
        <projectManagementAppContext.Provider value={mockContext as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Approval" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Rejection comments' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            statusId: 5,
            Action: 'Reject',
            comments: 'Rejection comments',
            AssignedBy: mockContext.currentUser.id,
            AssignedTo: mockContext.selectedProject.seniorProjectManagerId,
            entityId: defaultProps.entityId,
            entityType: defaultProps.entityType,
            formType: defaultProps.formType,
          })
        );
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should show error if no Senior Project Manager assigned for rejection', async () => {
      const projectWithoutSPM = { ...mockContext.selectedProject, seniorProjectManagerId: undefined };
      const contextWithoutSPM = { ...mockContext, selectedProject: projectWithoutSPM };
      render(
        <projectManagementAppContext.Provider value={contextWithoutSPM as any}>
          <SendApprovalBox {...defaultProps} status="Sent for Approval" />
        </projectManagementAppContext.Provider>
      );
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Rejection comments' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText('No Senior Project Manager assigned to this project')).toBeInTheDocument();
      });
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <SendApprovalBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    const dialog = screen.getByRole('dialog');

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    fireEvent.click(dialog, mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const mockKeyEvent = { stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
    fireEvent.keyDown(dialog, mockKeyEvent);
    expect(mockKeyEvent.stopPropagation).toHaveBeenCalledTimes(1);
  });
});
