import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForApproval from './SendForApproval';
import { getUserById } from '../../../services/userApi';
import { projectApi } from '../../../services/projectApi';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import { AuthUser } from '../../../models/userModel';
import { PMWorkflowHistory } from '../../../models/pmWorkflowModel';

// Mock external dependencies
vi.mock('../../../services/userApi', () => ({
  getUserById: vi.fn(),
}));

vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    sendToApproval: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUserById = vi.mocked(getUserById);
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockSendToApproval = vi.mocked(pmWorkflowApi.sendToApproval);

const mockProjectData = {
  id: 1,
  regionalManagerId: 'rm123',
  // ... other project properties if needed
};

const mockManagerUserData: AuthUser = {
  id: 'rm123',
  name: 'Regional Manager',
  userName: 'rm123',
  email: 'rm123@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
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
  onSubmit: vi.fn(),
};

describe('ProjectClosure/SendForApproval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProjectById.mockResolvedValue(mockProjectData as any);
    mockGetUserById.mockResolvedValue(mockManagerUserData);
    mockSendToApproval.mockResolvedValue(mockPMWorkflowHistory);
  });

  it('should render correctly with default props and display manager name', async () => {
    render(<SendForApproval {...defaultProps} />);

    expect(screen.getByText('Send for Approval')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockManagerUserData.name} for approval?`)).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeEnabled(); // Should be enabled because selectedApprover is set in useEffect
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled()); // Wait for useEffect to complete
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should update comments state when text is entered', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());
    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Some comments' } });
    expect(commentsInput).toHaveValue('Some comments');
  });

  it('should call sendToApproval and onSubmit on successful submission with comments', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Please approve this project closure.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(mockSendToApproval).toHaveBeenCalledWith({
        entityId: defaultProps.projectClosureId,
        entityType: 'ProjectClosure',
        action: 'Approval',
        assignedToId: mockProjectData.regionalManagerId,
        comments: 'Please approve this project closure.',
      });
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call sendToApproval with default comments if none provided', async () => {
    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(mockSendToApproval).toHaveBeenCalledWith(
        expect.objectContaining({
          comments: `Reviewed and sent for approval by ${defaultProps.currentUser}`,
        })
      );
    });
  });

  it('should show error if projectClosureId is missing', async () => {
    render(<SendForApproval {...defaultProps} projectClosureId={undefined} />);
    await waitFor(() => expect(mockGetProjectById).not.toHaveBeenCalled()); // useEffect should not run fully
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => {
      expect(screen.getByText('Project Closure ID is missing')).toBeInTheDocument();
    });
    expect(mockSendToApproval).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing', async () => {
    render(<SendForApproval {...defaultProps} projectId={undefined} />);
    await waitFor(() => expect(mockGetProjectById).not.toHaveBeenCalled()); // useEffect should not run fully
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockSendToApproval).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<SendForApproval {...defaultProps} currentUser={undefined} />);
    // The component should return null and not render anything
    expect(screen.queryByText('Send for Approval')).not.toBeInTheDocument();
  });

  it('should display error if projectApi.getById fails', async () => {
    const errorMessage = 'Failed to fetch project';
    mockGetProjectById.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should display error if getUserById fails (manager not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('404: Manager User not found')); // Simulate manager not found

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('404: Manager User not found')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('should display error if pmWorkflowApi.sendToApproval fails', async () => {
    const errorMessage = 'Approval API failed';
    mockSendToApproval.mockRejectedValue(new Error(errorMessage));

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    render(<SendForApproval {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());
    const dialog = screen.getByRole('dialog');

    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    fireEvent.click(dialog, mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const mockKeyEvent = { stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
    fireEvent.keyDown(dialog, mockKeyEvent);
    expect(mockKeyEvent.stopPropagation).toHaveBeenCalledTimes(1);

    stopPropagationSpy.mockRestore();
  });
});
