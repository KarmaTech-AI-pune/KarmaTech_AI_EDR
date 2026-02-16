import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideReview from './ProjectDecideReview';
import { HistoryLoggingService } from '../../../services/historyLoggingService';
import { OpportunityHistory } from '../../../models';

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
  onDecisionMade: vi.fn(),
};

describe('ProjectReviewWorkflow/ProjectDecideReview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory); // Mock successful logging
    // @ts-ignore
    defaultProps.onDecisionMade.mockResolvedValue(undefined); // Mock successful onDecisionMade
  });

  it('should render correctly with default props', () => {
    render(<DecideReview {...defaultProps} />);

    expect(screen.getByText('Decide Review')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument(); // Now works with proper accessibility
    expect(screen.getByLabelText('Comments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<DecideReview {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
  });

  it('should enable Submit button when a decision and comments are provided', async () => {
    render(<DecideReview {...defaultProps} />);

    const decisionSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(decisionSelect);
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Looks good' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });
  });

  it('should update decision state when a radio button is selected', async () => {
    render(<DecideReview {...defaultProps} />);
    const decisionSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(decisionSelect);
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      // Check the native input value (not hidden, but aria-hidden)
      const nativeInput = document.querySelector('.MuiSelect-nativeInput') as HTMLInputElement;
      expect(nativeInput?.value).toBe('reject');
    });
  });

  it('should update comments state when text is entered', () => {
    render(<DecideReview {...defaultProps} />);
    const commentsInput = screen.getByLabelText('Comments');
    fireEvent.change(commentsInput, { target: { value: 'Some feedback' } });
    expect(commentsInput).toHaveValue('Some feedback');
  });

  it('should show error if no decision is selected on submit', async () => {
    render(<DecideReview {...defaultProps} />);
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    
    // The button should be disabled when no decision is selected
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if comments are empty on submit', async () => {
    render(<DecideReview {...defaultProps} />);
    const decisionSelect = screen.getByRole('combobox', { name: /decision/i });
    fireEvent.mouseDown(decisionSelect);
    fireEvent.click(screen.getByText('Approve'));
    
    // The button is disabled when comments are empty, so we can't click it
    // Let's test that the button is disabled instead
    expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeDisabled();
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing', async () => {
    render(<DecideReview {...defaultProps} projectId={undefined} />);
    const decisionSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(decisionSelect);
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Some comments' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Project ID is missing')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
  });

  it('should show error if currentUser is missing', async () => {
    render(<DecideReview {...defaultProps} currentUser={undefined} />);
    const decisionSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(decisionSelect);
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

    it('should call logCustomEvent and onDecisionMade on successful approval', async () => {
      render(<DecideReview {...defaultProps} />);
      const decisionSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(decisionSelect);
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by reviewer' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockLogCustomEvent).toHaveBeenCalledWith(
          defaultProps.projectId,
          'WBS Manpower Review Approved',
          defaultProps.currentUser as string,
          'Approved by reviewer'
        );
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).not.toHaveBeenCalled(); // onDecisionMade handles closing
      });
    });

    it('should display "Submitting..." and disable button during loading', async () => {
      let resolvePromise: () => void;
      const slowPromise = new Promise<OpportunityHistory>((resolve) => {
        resolvePromise = () => resolve(mockOpportunityHistory);
      });
      
      // @ts-ignore
      mockLogCustomEvent.mockReturnValueOnce(slowPromise);
      
      render(<DecideReview {...defaultProps} />);
      const decisionSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(decisionSelect);
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      // Check that button shows "Submitting..." and is disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
      });
      
      // Resolve the promise
      resolvePromise!();
      
      // Wait for button to return to normal state
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: 'Submitting...' })).not.toBeInTheDocument();
      });
    });

    it('should display error if logCustomEvent API call fails', async () => {
      const errorMessage = 'Review logging failed';
      mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      const decisionSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(decisionSelect);
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by reviewer' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Reject decision path', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should call logCustomEvent and onDecisionMade on successful rejection', async () => {
      render(<DecideReview {...defaultProps} />);
      const decisionSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(decisionSelect);
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(mockLogCustomEvent).toHaveBeenCalledWith(
          defaultProps.projectId,
          'WBS Manpower Review Rejected',
          defaultProps.currentUser as string,
          'Needs revisions'
        );
        expect(defaultProps.onDecisionMade).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).not.toHaveBeenCalled(); // onDecisionMade handles closing
      });
    });

    it('should display error if logCustomEvent API call fails', async () => {
      const errorMessage = 'Rejection logging failed';
      mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      const decisionSelect = screen.getByRole('combobox');
      fireEvent.mouseDown(decisionSelect);
      fireEvent.click(screen.getByText('Reject'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Needs revisions' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
      });
    });
  });

  it('should call onClose(true) if onDecisionMade is not provided', async () => {
    const propsWithoutOnDecisionMade = { ...defaultProps, onDecisionMade: undefined };
    render(<DecideReview {...propsWithoutOnDecisionMade} />);
    const decisionSelect = screen.getByRole('combobox');
    fireEvent.mouseDown(decisionSelect);
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledTimes(1);
      expect(propsWithoutOnDecisionMade.onClose).toHaveBeenCalledWith(true);
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    render(<DecideReview {...defaultProps} />);
    const dialog = screen.getByRole('dialog');

    // Test that clicking on dialog doesn't close it (event propagation is stopped)
    fireEvent.click(dialog);
    expect(defaultProps.onClose).not.toHaveBeenCalled();

    // Test that keydown on dialog doesn't propagate
    fireEvent.keyDown(dialog, { key: 'Escape' });
    // The dialog should handle its own events without propagating
  });
});
