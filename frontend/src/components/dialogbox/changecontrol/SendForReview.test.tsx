import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import SendForReview from './SendForReview';
import { getUsersByRole, getUserById } from '../../../services/userApi';
import { projectApi } from '../../../services/projectApi';
import { changeControlApi } from '../../../services/changeControlApi';
import { AuthUser } from '../../../models/userModel';

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

vi.mock('../../../services/changeControlApi', () => ({
  changeControlApi: {
    sendToReview: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUsersByRole = vi.mocked(getUsersByRole);
const mockGetUserById = vi.mocked(getUserById);
const mockGetProjectById = vi.mocked(projectApi.getById);
const mockSendToReview = vi.mocked(changeControlApi.sendToReview);

const mockReviewers: AuthUser[] = [
  { id: 'spm1', name: 'SPM One', userName: 'spm1', email: 'spm1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
  { id: 'spm2', name: 'SPM Two', userName: 'spm2', email: 'spm2@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];

const mockProjectData = {
  id: 1,
  seniorProjectManagerId: 'spm1',
  // ... other project properties if needed
};

const mockManagerUserData = {
  id: 'spm1',
  name: 'SPM One',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  changeControlId: 101,
  projectId: 1,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
  onReviewSent: vi.fn(),
};

describe('SendForReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockResolvedValue(mockReviewers);
    mockGetProjectById.mockResolvedValue(mockProjectData as any);
    mockGetUserById.mockResolvedValue(mockManagerUserData as any);
    mockSendToReview.mockResolvedValue(undefined);
  });

  it('should render correctly with default props and display manager name if already assigned', async () => {
    render(<SendForReview {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Senior Project Manager' })).toBeInTheDocument();
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

    expect(screen.getByRole('heading', { name: 'Senior Project Manager' })).toBeInTheDocument();
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
    const user = userEvent.setup();
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Wait for listbox to open
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Find and click the option
    const options = screen.getAllByRole('option');
    const option = options.find(opt => opt.textContent?.includes('SPM One'));
    if (!option) throw new Error('Option not found');
    await user.click(option);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    });
  });

  it('should call sendToReview and onSubmit/onReviewSent on successful submission (manager assigned)', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        entityId: defaultProps.changeControlId,
        entityType: 'ChangeControl',
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
    const user = userEvent.setup();
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument());

    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Wait for listbox to open
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Find and click the option
    const options = screen.getAllByRole('option');
    const option = options.find(opt => opt.textContent?.includes('SPM Two'));
    if (!option) throw new Error('Option not found');
    await user.click(option);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        entityId: defaultProps.changeControlId,
        entityType: 'ChangeControl',
        assignedToId: 'spm2', // Should be SPM Two's ID
        action: 'Review',
        comments: `Sent for review by ${defaultProps.currentUser}`,
      });
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable OK button when no reviewer is selected (no manager assigned)', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByLabelText('Senior Project Manager')).toBeInTheDocument());

    // OK button should be disabled when no reviewer is selected
    const okButton = screen.getByRole('button', { name: 'OK' });
    expect(okButton).toBeDisabled();
    
    // Clicking disabled button should not trigger any actions
    fireEvent.click(okButton);
    expect(mockSendToReview).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if changeControlId is missing when OK is clicked', async () => {
    mockGetProjectById.mockResolvedValue({ id: 1, seniorProjectManagerId: undefined } as any);
    const user = userEvent.setup();
    render(<SendForReview {...defaultProps} changeControlId={undefined} />);
    
    // Wait for combobox to be available
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    // Select a reviewer to enable the OK button
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Wait for listbox to open
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Find and click the option
    const options = screen.getAllByRole('option');
    const option = options.find(opt => opt.textContent?.includes('SPM One'));
    if (!option) throw new Error('Option not found');
    await user.click(option);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    
    // Now OK button should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    });
    
    // Click OK button
    await user.click(screen.getByRole('button', { name: 'OK' }));
    
    // Should show error message
    await waitFor(() => {
      const helperText = screen.getByText('Change Control ID is missing');
      expect(helperText).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(mockSendToReview).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing when OK is clicked', async () => {
    const user = userEvent.setup();
    render(<SendForReview {...defaultProps} projectId={undefined} />);
    
    // Wait for combobox to be available
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    
    // The useEffect should not call getProjectById when projectId is undefined
    expect(mockGetProjectById).not.toHaveBeenCalled();
    
    // Select a reviewer to enable the OK button
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    
    // Wait for listbox to open
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    
    // Find and click the option
    const options = screen.getAllByRole('option');
    const option = options.find(opt => opt.textContent?.includes('SPM One'));
    if (!option) throw new Error('Option not found');
    await user.click(option);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
    
    // Now OK button should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
    });
    
    // Click OK button
    await user.click(screen.getByRole('button', { name: 'OK' }));
    
    // Should show error message
    await waitFor(() => {
      const helperText = screen.getByText('Project ID is missing');
      expect(helperText).toBeInTheDocument();
    }, { timeout: 5000 });
    
    expect(mockSendToReview).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<SendForReview {...defaultProps} currentUser={undefined} />);
    // The component should return null and not render anything
    await waitFor(() => {
      expect(screen.queryByText('Senior Project Manager')).not.toBeInTheDocument();
    });
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

  it('should display error if changeControlApi.sendToReview fails', async () => {
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
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetProjectById).toHaveBeenCalled());
    
    const dialog = screen.getByRole('dialog');

    // Test that the dialog has onClick handler
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    dialog.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();

    // Test that the dialog has onKeyDown handler
    const keyEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    const keyStopPropagationSpy = vi.spyOn(keyEvent, 'stopPropagation');
    dialog.dispatchEvent(keyEvent);
    expect(keyStopPropagationSpy).toHaveBeenCalled();
  });
});
