import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForReview from './SendForReview';
import { getUsersByRole, getUserById } from '../../../services/userApi';
import { projectApi } from '../../../services/projectApi';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import { AuthUser } from '../../../models/userModel';
import { PMWorkflowHistory } from '../../../models/pmWorkflowModel';

// Mock external dependencies
vi.mock('../../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    getById: vi.fn(),
  },
}));

vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    sendToReview: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUsersByRole = vi.mocked(getUsersByRole);
const mockGetUserById = vi.mocked(getUserById);
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockSendToReview = vi.mocked(pmWorkflowApi.sendToReview);

const mockReviewers: AuthUser[] = [
  { id: 'spm1', name: 'SPM One', userName: 'spm1', email: 'spm1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
  { id: 'spm2', name: 'SPM Two', userName: 'spm2', email: 'spm2@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];

const mockProjectData = {
  id: 1,
  seniorProjectManagerId: 'spm1',
  // ... other project properties if needed
};

const mockManagerUserData: AuthUser = {
  id: 'spm1',
  name: 'SPM One',
  userName: 'spm1',
  email: 'spm1@example.com',
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
  statusId: 2, // SentForReview
  status: 'Sent For Review',
  action: 'Review',
  comments: 'Test comments',
  actionBy: 'TestUser',
  actionByName: 'Test User',
  assignedToId: 'spm1',
  assignedToName: 'SPM One',
  actionDate: '2023-01-01T00:00:00Z',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  projectClosureId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
  onReviewSent: vi.fn(),
};

describe('ProjectClosure/SendForReview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockResolvedValue(mockReviewers);
    mockGetProjectById.mockResolvedValue(mockProjectData as any);
    mockGetUserById.mockResolvedValue(mockManagerUserData);
    mockSendToReview.mockResolvedValue(mockPMWorkflowHistory);
  });

  it('should render correctly with default props and display manager name if already assigned', async () => {
    render(<SendForReview {...defaultProps} />);

    expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockManagerUserData.name} for review?`)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled(); // Should be enabled because selectedReviewer is set in useEffect
  });

  it('should render correctly with default props and display dropdown if no manager assigned', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);

    expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByLabelText('Senior Project Manager')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled(); // Should be disabled until a reviewer is selected
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
  });

  it('should enable OK button when a reviewer is selected from dropdown', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Senior Project Manager')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText('Senior Project Manager'));
    fireEvent.click(screen.getByText('SPM One'));
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
  });

  it('should call sendToReview and onSubmit/onReviewSent on successful submission (manager assigned)', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        entityId: defaultProps.projectClosureId,
        entityType: 'ProjectClosure',
        assignedToId: mockProjectData.seniorProjectManagerId,
        action: 'Review',
        comments: `Sent for review by ${defaultProps.currentUser}`,
      });
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call sendToReview and onSubmit/onReviewSent on successful submission (reviewer selected)', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Senior Project Manager')).toBeInTheDocument());

    fireEvent.mouseDown(screen.getByLabelText('Senior Project Manager'));
    fireEvent.click(screen.getByText('SPM Two')); // Select SPM Two

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        entityId: defaultProps.projectClosureId,
        entityType: 'ProjectClosure',
        assignedToId: 'spm2', // Should be SPM Two's ID
        action: 'Review',
        comments: `Sent for review by ${defaultProps.currentUser}`,
      });
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error if no reviewer is selected on submit (no manager assigned)', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Senior Project Manager')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.getByText('Please select a Senior Project Manager')).toBeInTheDocument();
    });
    expect(mockSendToReview).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled(); // Dialog should not close on validation error
  });

  it('should show error if projectClosureId is missing', async () => {
    render(<SendForReview {...defaultProps} projectClosureId={undefined} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.getByText('Project Closure ID is missing')).toBeInTheDocument();
    });
    expect(mockSendToReview).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing', async () => {
    render(<SendForReview {...defaultProps} projectId={undefined} />);
    await waitFor(() => expect(mockGetProjectById).not.toHaveBeenCalled()); // useEffect should not run fully
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockSendToReview).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<SendForReview {...defaultProps} currentUser={undefined} />);
    // The component should return null and not render anything
    expect(screen.queryByText('Senior Project Manager')).not.toBeInTheDocument();
  });

  it('should display error if getUsersByRole fails', async () => {
    const errorMessage = 'Failed to fetch roles';
    mockGetUsersByRole.mockRejectedValue(new Error(errorMessage));
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should display error if projectApi.getById fails', async () => {
    const errorMessage = 'Failed to fetch project';
    mockGetProjectById.mockRejectedValue(new Error(errorMessage));

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should display error if getUserById fails (manager not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('404: Manager User not found')); // Simulate manager not found

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('404: Manager User not found')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should display error if pmWorkflowApi.sendToReview fails', async () => {
    const errorMessage = 'Review API failed';
    mockSendToReview.mockRejectedValue(new Error(errorMessage));

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1); // Dialog should close on API error
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    render(<SendForReview {...defaultProps} />);
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
