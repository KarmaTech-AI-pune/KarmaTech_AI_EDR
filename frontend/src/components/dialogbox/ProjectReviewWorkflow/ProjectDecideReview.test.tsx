import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogCustomEvent.mockResolvedValue(mockOpportunityHistory); // Mock successful logging
    defaultProps.onDecisionMade.mockResolvedValue(undefined); // Mock successful onDecisionMade
  });

  it('should render correctly with default props', () => {
    render(<DecideReview {...defaultProps} />);

    expect(screen.getByText('Decide Review')).toBeInTheDocument();
    expect(screen.getByLabelText('Decision')).toBeInTheDocument();
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

    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Looks good' } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
    });
  });

  it('should update decision state when a radio button is selected', async () => {
    render(<DecideReview {...defaultProps} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Reject'));
    await waitFor(() => {
      expect(screen.getByLabelText('Decision')).toHaveValue('reject');
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
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Please select a decision')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
        expect(defaultProps.onClose).not.toHaveBeenCalled(); // onDecisionMade handles closing
  });

  it('should show error if comments are empty on submit', async () => {
    render(<DecideReview {...defaultProps} />);
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));
    await waitFor(() => {
      expect(screen.getByText('Comments are required')).toBeInTheDocument();
    });
    expect(mockLogCustomEvent).not.toHaveBeenCalled();
    expect(defaultProps.onDecisionMade).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if projectId is missing', async () => {
    render(<DecideReview {...defaultProps} projectId={undefined} />);
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
    render(<DecideReview {...defaultProps} currentUser={undefined} />);
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
    it('should call logCustomEvent and onDecisionMade on successful approval', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
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
      mockLogCustomEvent.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100))); // Simulate async operation
      render(<DecideReview {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
      fireEvent.click(screen.getByText('Approve'));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

      expect(screen.getByRole('button', { name: 'Submitting...' })).toBeDisabled();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Submit Decision' })).toBeEnabled();
      });
    });

    it('should display error if logCustomEvent API call fails', async () => {
      const errorMessage = 'Review logging failed';
      mockLogCustomEvent.mockRejectedValue(new Error(errorMessage));

      render(<DecideReview {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
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
    it('should call logCustomEvent and onDecisionMade on successful rejection', async () => {
      render(<DecideReview {...defaultProps} />);
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
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
      fireEvent.mouseDown(screen.getByLabelText('Decision'));
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
    fireEvent.mouseDown(screen.getByLabelText('Decision'));
    fireEvent.click(screen.getByText('Approve'));
    fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockLogCustomEvent).toHaveBeenCalledTimes(1);
      expect(propsWithoutOnDecisionMade.onClose).toHaveBeenCalledWith(true);
    });
  });

  it('should prevent event propagation on dialog interactions', () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    render(<DecideReview {...defaultProps} />);
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
