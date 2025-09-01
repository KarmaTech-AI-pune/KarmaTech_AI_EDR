import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CheckReviewForm from './CheckReviewForm';
import { CheckReviewDialog } from './CheckReviewcomponents/CheckReviewDialog';
import {
  createCheckReview,
  getCheckReviewsByProject,
  deleteCheckReview,
  updateCheckReview
} from '../../api/checkReviewApi';
import { useProject } from '../../context/ProjectContext';

// Mock external dependencies
vi.mock('../../api/checkReviewApi', () => ({
  createCheckReview: vi.fn(),
  getCheckReviewsByProject: vi.fn(),
  deleteCheckReview: vi.fn(),
  updateCheckReview: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('./CheckReviewcomponents/CheckReviewDialog', () => ({
  CheckReviewDialog: vi.fn(({ open, onClose, onSave, editData, nextActivityNo }) => (
    <div data-testid="check-review-dialog">
      {open && (
        <div>
          <span>Check Review Dialog</span>
          <button onClick={() => onSave(editData || { activityNo: nextActivityNo, activityName: 'New Activity', documentNumber: 'D-001', documentName: 'Doc Name', objective: 'Obj', references: 'Ref', fileName: 'file.pdf', qualityIssues: 'None', completion: 'Y', checkedBy: 'Checker', approvedBy: 'Approver', actionTaken: 'Action', maker: 'Maker', checker: 'Checker' })}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )),
}));

// Type assertions for mocked functions
const mockCreateCheckReview = vi.mocked(createCheckReview);
const mockGetCheckReviewsByProject = vi.mocked(getCheckReviewsByProject);
const mockDeleteCheckReview = vi.mocked(deleteCheckReview);
const mockUpdateCheckReview = vi.mocked(updateCheckReview);
const mockUseProject = vi.mocked(useProject);

const mockReviews = [
  {
    id: '1',
    projectId: '123',
    activityNo: '1',
    activityName: 'Design Review',
    objective: 'Review design documents',
    references: 'Design Spec v1.0',
    fileName: 'design_review.pdf',
    completion: 'Y',
    qualityIssues: 'None',
    checkedBy: '2023-01-10T00:00:00Z',
    approvedBy: '2023-01-15T00:00:00Z',
    actionTaken: 'Approved',
    createdBy: 'user1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedBy: 'user1',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    projectId: '123',
    activityNo: '2',
    activityName: 'Code Review',
    objective: 'Review code quality',
    references: 'Code Spec v1.0',
    fileName: 'code_review.pdf',
    completion: 'N',
    qualityIssues: 'Minor issues',
    checkedBy: '2023-01-20T00:00:00Z',
    approvedBy: '2023-01-25T00:00:00Z',
    actionTaken: 'Changes requested',
    createdBy: 'user2',
    createdAt: '2023-01-05T00:00:00Z',
    updatedBy: 'user2',
    updatedAt: '2023-01-05T00:00:00Z',
  },
];

describe('CheckReviewForm', () => {
  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn() });
    mockGetCheckReviewsByProject.mockResolvedValue(mockReviews);
    mockCreateCheckReview.mockResolvedValue(undefined);
    mockUpdateCheckReview.mockResolvedValue(undefined);
    mockDeleteCheckReview.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm for delete tests
  });

  it('should render correctly and load reviews', async () => {
    render(<CheckReviewForm />);

    expect(screen.getByText('PMD5. Check and Review Form')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Review' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetCheckReviewsByProject).toHaveBeenCalledWith(mockProjectId);
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Design Review')).toBeInTheDocument();
      expect(screen.getByText('design_review.pdf')).toBeInTheDocument();
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('Code Review')).toBeInTheDocument();
      expect(screen.getByText('code_review.pdf')).toBeInTheDocument();
    });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined, setProjectId: vi.fn() });
    render(<CheckReviewForm />);
    expect(screen.getByText('Please select a project to view the check and review form.')).toBeInTheDocument();
    expect(mockGetCheckReviewsByProject).not.toHaveBeenCalled();
  });

  it('should open the dialog when "Add Review" is clicked', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Review' }));

    expect(screen.getByTestId('check-review-dialog')).toBeInTheDocument();
    expect(screen.getByText('Check Review Dialog')).toBeInTheDocument();
  });

  it('should close the dialog when "Close" is clicked in the dialog', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
  });

  it('should create a new review', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving new data

    await waitFor(() => {
      expect(mockCreateCheckReview).toHaveBeenCalledTimes(1);
      expect(mockCreateCheckReview).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: mockProjectId,
          activityNo: '3', // Expect next activityNo
          activityName: 'New Activity',
        })
      );
      expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
      expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(2); // Initial load + after save
    });
  });

  it('should edit an existing review', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('edit')[0]); // Click edit for the first item (id: 1)

    expect(screen.getByTestId('check-review-dialog')).toBeInTheDocument();
    expect(screen.getByText('Check Review Dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving updated data

    await waitFor(() => {
      expect(mockUpdateCheckReview).toHaveBeenCalledTimes(1);
      expect(mockUpdateCheckReview).toHaveBeenCalledWith(
        '1', // Expect id '1' to be updated
        expect.objectContaining({
          id: '1',
          projectId: '123',
          activityNo: '1',
          activityName: 'New Activity', // Updated name from dialog mock
        })
      );
      expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
      expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(2); // Initial load + after save
    });
  });

  it('should delete a review with confirmation', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('delete review')[0]); // Click delete for the first item (id: 1)

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this review?');
      expect(mockDeleteCheckReview).toHaveBeenCalledTimes(1);
      expect(mockDeleteCheckReview).toHaveBeenCalledWith('1');
      expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(2); // Initial load + after delete
    });
  });

  it('should not delete a review if confirmation is cancelled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false); // Mock window.confirm to return false
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('delete review')[0]);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(mockDeleteCheckReview).not.toHaveBeenCalled();
      expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(1); // Only initial load
    });
  });

  it('should display error message if loading reviews fails', async () => {
    mockGetCheckReviewsByProject.mockRejectedValue(new Error('Failed to fetch reviews'));
    render(<CheckReviewForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load check review data: Failed to fetch reviews')).toBeInTheDocument();
    });
  });

  it('should display error message if saving review fails', async () => {
    mockCreateCheckReview.mockRejectedValue(new Error('Failed to save'));
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save review: Failed to save')).toBeInTheDocument();
    });
  });

  it('should display error message if deleting review fails', async () => {
    mockDeleteCheckReview.mockRejectedValue(new Error('Failed to delete'));
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('delete review')[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete review: Failed to delete')).toBeInTheDocument();
    });
  });

  it('should show loading spinner when data is being fetched', async () => {
    mockGetCheckReviewsByProject.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockReviews), 100)));
    render(<CheckReviewForm />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('should display "No reviews found" message when no data is returned', async () => {
    mockGetCheckReviewsByProject.mockResolvedValue([]);
    render(<CheckReviewForm />);

    await waitFor(() => {
      expect(screen.getByText('No reviews found for this project. Click "Add Review" to create one.')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    // Assuming toLocaleDateString() formats '2023-01-10T00:00:00Z' to '1/10/2023' in a US locale
    expect(screen.getByText('1/10/2023')).toBeInTheDocument();
    expect(screen.getByText('1/15/2023')).toBeInTheDocument();
  });

  it('should render StatusChip correctly for completion "Y"', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const completionChip = screen.getAllByText('Completion')[0];
    expect(completionChip).toBeInTheDocument();
    expect(completionChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(completionChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CheckCircleIcon"]');
  });

  it('should render StatusChip correctly for completion "N"', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const completionChip = screen.getAllByText('Completion')[1];
    expect(completionChip).toBeInTheDocument();
    expect(completionChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    expect(completionChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CancelIcon"]');
  });

  it('should expand and collapse accordion details', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const firstAccordionSummary = screen.getByText('Design Review').closest('.MuiAccordionSummary-root');
    expect(firstAccordionSummary).toBeInTheDocument();

    // Initially collapsed, details should not be visible
    expect(screen.queryByText('Review design documents')).not.toBeVisible();

    // Expand
    fireEvent.click(firstAccordionSummary!);
    expect(screen.getByText('Review design documents')).toBeVisible();

    // Collapse
    fireEvent.click(firstAccordionSummary!);
    expect(screen.queryByText('Review design documents')).not.toBeVisible();
  });
});
