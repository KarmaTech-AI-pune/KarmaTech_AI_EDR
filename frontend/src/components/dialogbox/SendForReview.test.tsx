import React from 'react'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import SendForReview from './SendForReview';
import { getUsersByRole, getUserById } from '../../services/userApi';
import { opportunityApi } from '../../services/opportunityApi';
import { HistoryLoggingService } from '../../services/historyLoggingService';
import { AuthUser } from '../../models/userModel';
import { OpportunityHistory } from '../../models';

// Mock external dependencies
vi.mock('../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../../services/opportunityApi', () => ({
  opportunityApi: {
    getById: vi.fn(),
    sendToReview: vi.fn(),
  },
}));

vi.mock('../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logSentForReview: vi.fn(),
  },
}));

// Type assertion for mocked functions
const mockGetUsersByRole = vi.mocked(getUsersByRole);
const mockGetUserById = vi.mocked(getUserById);
const mockGetOpportunityById = vi.mocked(opportunityApi.getById);
const mockSendToReview = vi.mocked(opportunityApi.sendToReview);
const mockLogSentForReview = vi.mocked(HistoryLoggingService.logSentForReview);

const mockRegionalManagers: AuthUser[] = [
  { id: 'rm1', name: 'RM One', userName: 'rm1', email: 'rm1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
  { id: 'rm2', name: 'RM Two', userName: 'rm2', email: 'rm2@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];

const mockOpportunityData = {
  id: 101,
  reviewManagerId: 'rm1',
  // Add other opportunity properties if needed
};

const mockManagerUserData: AuthUser = {
  id: 'rm1',
  name: 'RM One',
  userName: 'rm1',
  email: 'rm1@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockOpportunityHistory: OpportunityHistory = {
  id: 1,
  opportunityId: 101,
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
  opportunityId: 101,
  currentUser: 'TestUser',
  onSubmit: vi.fn(),
  onReviewSent: vi.fn(),
};

describe('SendForReview (top level)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockResolvedValue(mockRegionalManagers);
    mockGetOpportunityById.mockResolvedValue(mockOpportunityData as any);
    mockGetUserById.mockResolvedValue(mockManagerUserData);
    mockSendToReview.mockResolvedValue({} as any);
    mockLogSentForReview.mockResolvedValue(mockOpportunityHistory);
    defaultProps.onSubmit.mockImplementation(vi.fn());
    defaultProps.onReviewSent.mockImplementation(vi.fn());
  });

  it('should render correctly with default props and display manager name if already assigned', async () => {
    render(<SendForReview {...defaultProps} />);

    expect(screen.queryByRole('heading', { name: /Regional Manager/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText(new RegExp(`Send to ${mockManagerUserData.name} for review\\?`, 'i'))).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /OK/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /OK/i })).toBeEnabled();
  });

  it('should render correctly with default props and display dropdown if no manager assigned', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);

    expect(screen.queryByRole('heading', { name: /Regional Manager/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Regional Manager/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /OK/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /OK/i })).toBeDisabled(); // Should be disabled until a reviewer is selected
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled()); // Wait for useEffect to complete
    fireEvent.click(screen.queryByRole('button', { name: /Cancel/i }) as HTMLElement);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
  });

  it('should enable OK button when a reviewer is selected from dropdown', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Regional Manager/i })).toBeInTheDocument());

    const select = screen.getByRole('combobox', { name: /Regional Manager/i });
    fireEvent.mouseDown(select);
    
    // MUI Select renders menu items in a portal - use findByRole for more direct interaction
    const option = await screen.findByRole('option', { name: /RM One/i });
    fireEvent.click(option);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /OK/i })).toBeEnabled();
    });
  });

  it('should call opportunityApi.sendToReview and logSentForReview on successful submission (manager assigned)', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        reviewManagerId: mockOpportunityData.reviewManagerId,
        comments: `Sent for review by ${defaultProps.currentUser}`,
      });
      expect(mockLogSentForReview).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        defaultProps.currentUser as string,
        mockManagerUserData.name
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call opportunityApi.sendToReview and logSentForReview on successful submission (reviewer selected)', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Regional Manager/i })).toBeInTheDocument());

    const select = screen.getByRole('combobox', { name: /Regional Manager/i });
    fireEvent.mouseDown(select);

    // MUI Select renders menu items in a portal - use findByRole for more direct interaction
    const option = await screen.findByRole('option', { name: /RM Two/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /OK/i })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));

    await waitFor(() => {
      expect(mockSendToReview).toHaveBeenCalledWith({
        opportunityId: defaultProps.opportunityId,
        reviewManagerId: 'rm2', // Should be RM Two's ID
        comments: `Sent for review by ${defaultProps.currentUser}`,
      });
      expect(mockLogSentForReview).toHaveBeenCalledWith(
        defaultProps.opportunityId,
        defaultProps.currentUser as string,
        mockRegionalManagers[1].name
      );
      expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
      expect(defaultProps.onReviewSent).toHaveBeenCalledTimes(1);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should disable OK button when no reviewer is selected (no manager assigned)', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any); // No manager assigned
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByRole('combobox', { name: /Regional Manager/i })).toBeInTheDocument());

    // OK button should be disabled when no reviewer is selected
    const okButton = screen.queryByRole('button', { name: /OK/i });
    expect(okButton).toBeDisabled();
    
    // Clicking disabled button should not trigger any actions
    fireEvent.click(okButton as HTMLElement);
    expect(mockSendToReview).not.toHaveBeenCalled();
    expect(mockLogSentForReview).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if opportunityId is missing when OK is clicked', async () => {
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any);
    render(<SendForReview {...defaultProps} opportunityId={undefined} />);
    
    // Wait for reviewers to load
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Regional Manager/i })).toBeInTheDocument();
    });
    
    // The useEffect should not call getOpportunityById when opportunityId is undefined
    expect(mockGetOpportunityById).not.toHaveBeenCalled();
    
    // Select a reviewer to enable the OK button
    const select = screen.getByRole('combobox', { name: /Regional Manager/i });
    fireEvent.mouseDown(select);
    

    // MUI Select renders menu items in a portal - use findByRole for more direct interaction
    const option = await screen.findByRole('option', { name: /RM One/i });
    fireEvent.click(option);
    
    // Now OK button should be enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /OK/i })).toBeEnabled();
    });
    
    // Click OK button
    fireEvent.click(screen.getByRole('button', { name: /OK/i }));
    
    // Should show error message
    await waitFor(() => {
      const helperText = screen.getByText(/Opportunity ID is missing/i);
      expect(helperText).toBeInTheDocument();
    });
    
    expect(mockSendToReview).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<SendForReview {...defaultProps} currentUser={undefined} />);
    // The component should return null and not render anything
    await waitFor(() => expect(screen.queryByText('Regional Manager')).not.toBeInTheDocument());
  });

  it('should display error if getUsersByRole fails', async () => {
    const errorMessage = 'Failed to fetch regional managers';
    mockGetUsersByRole.mockRejectedValue(new Error(errorMessage));
    mockGetOpportunityById.mockResolvedValue({ id: 101, reviewManagerId: undefined } as any); // No manager assigned

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /OK/i })).toBeDisabled();
  });

  it('should display error if opportunityApi.getById fails', async () => {
    const errorMessage = 'Failed to fetch opportunity';
    mockGetOpportunityById.mockRejectedValue(new Error(errorMessage));

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /OK/i })).toBeDisabled();
    expect(mockGetUserById).not.toHaveBeenCalled();
  });

  it('should display error if getUserById fails (manager not found)', async () => {
    mockGetUserById.mockRejectedValue(new Error('404: Manager User not found')); // Simulate manager not found

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Manager User not found/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /OK/i })).toBeDisabled();
  });

  it('should display error if opportunityApi.sendToReview fails', async () => {
    const errorMessage = 'Review API failed';
    mockSendToReview.mockRejectedValue(new Error(errorMessage));

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));

    await waitFor(() => expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument());
    expect(mockLogSentForReview).not.toHaveBeenCalled();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1); // Dialog should close on API error
  });

  it('should display error if HistoryLoggingService.logSentForReview fails', async () => {
    const errorMessage = 'Logging failed';
    mockLogSentForReview.mockRejectedValue(new Error(errorMessage));

    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /OK/i }));

    await waitFor(() => expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument());
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onReviewSent).not.toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1); // Dialog should close on API error
  });

  it('should prevent event propagation on dialog interactions', async () => {
    render(<SendForReview {...defaultProps} />);
    await waitFor(() => expect(mockGetOpportunityById).toHaveBeenCalled());
    
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








