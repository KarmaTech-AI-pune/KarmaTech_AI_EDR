
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SendForReviewDialog from '../SendForReviewDialog';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import * as userApi from '../../../services/userApi';

// Mock Dependencies
vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    sendToReview: vi.fn(),
  },
}));

vi.mock('../../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
}));

describe('SendForReviewDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    entityId: 1,
    entityType: 'project',
    onWorkflowUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (userApi.getUsersByRole as any).mockResolvedValue([
      { id: 'spm1', name: 'SPM User One' },
      { id: 'spm2', name: 'SPM User Two' },
    ]);
  });

  it('renders correctly and loads SPM users', async () => {
    render(<SendForReviewDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: 'Send for Review' })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(userApi.getUsersByRole).toHaveBeenCalledWith('SeniorProjectManager');
    });

    expect(screen.getByText('Send this form to a Senior Project Manager for review.')).toBeInTheDocument();
    expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Comments' })).toBeInTheDocument();
  });

  it('auto-selects SPM if there is only one', async () => {
    (userApi.getUsersByRole as any).mockResolvedValue([{ id: 'spm1', name: 'SPM User One' }]);

    render(<SendForReviewDialog {...defaultProps} />);

    await waitFor(() => {
      expect(userApi.getUsersByRole).toHaveBeenCalledWith('SeniorProjectManager');
    });

    // We can't easily see the selected value of MUI Select without checking input role,
    // but we can submit and verify it uses the auto-selected ID.
    const submitBtn = screen.getByRole('button', { name: 'Send for Review' });
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(pmWorkflowApi.sendToReview).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'project',
        assignedToId: 'spm1',
        comments: '',
        action: ''
      });
    });
  });

  it('handles submitting a review request', async () => {
    window.alert = vi.fn(); // Alert is used in the component for errors
    (pmWorkflowApi.sendToReview as any).mockResolvedValue({});

    render(<SendForReviewDialog {...defaultProps} />);

    await waitFor(() => {
      expect(userApi.getUsersByRole).toHaveBeenCalledWith('SeniorProjectManager');
    });

    // Open dropdown and select first option
    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const option = await screen.findByText('SPM User One');
    fireEvent.click(option);

    // Add comment
    fireEvent.change(screen.getByRole('textbox', { name: 'Comments' }), { target: { value: 'Please review' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Send for Review' }));

    await waitFor(() => {
      expect(pmWorkflowApi.sendToReview).toHaveBeenCalledWith({
        entityId: 1,
        entityType: 'project',
        assignedToId: 'spm1',
        comments: 'Please review',
        action: ''
      });
      expect(defaultProps.onWorkflowUpdated).toHaveBeenCalled();
      // Component doesn't auto close on success in code (only on user clicking Cancel),
      // wait, actually looking at code it doesn't call onClose on success. Let's just verify the rest.
    });
  });

  it('handles missing SPM selection', async () => {
    window.alert = vi.fn();

    render(<SendForReviewDialog {...defaultProps} />);

    await waitFor(() => {
      expect(userApi.getUsersByRole).toHaveBeenCalledWith('SeniorProjectManager');
    });

    // Component actually disables button if !assignedToId, but we can test logic if we bypass UI 
    // Wait, the button is disabled, so we can't click it.
    // Let's assert the button is disabled.
    const submitBtn = screen.getByRole('button', { name: 'Send for Review' });
    expect(submitBtn).toBeDisabled();
  });

  it('handles API errors', async () => {
    window.alert = vi.fn();
    (pmWorkflowApi.sendToReview as any).mockRejectedValue(new Error('Network error'));

    render(<SendForReviewDialog {...defaultProps} />);

    await waitFor(() => {
      expect(userApi.getUsersByRole).toHaveBeenCalledWith('SeniorProjectManager');
    });

    fireEvent.mouseDown(screen.getByRole('combobox'));
    const option = await screen.findByText('SPM User Two');
    fireEvent.click(option);

    fireEvent.click(screen.getByRole('button', { name: 'Send for Review' }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to send for review. Please try again.');
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(<SendForReviewDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
