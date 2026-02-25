// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import CheckReviewForm from './CheckReviewForm';
import { } from './CheckReviewcomponents/CheckReviewDialog';
import {
  createCheckReview,
  getCheckReviewsByProject,
  deleteCheckReview,
  updateCheckReview
} from '../../api/checkReviewApi';
import { useProject } from '../../context/ProjectContext';

// Mock external dependencies
vi.mock('../../api/checkReviewApi');
vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('./CheckReviewcomponents/CheckReviewDialog', () => ({
  CheckReviewDialog: vi.fn(({ open, onClose, onSave, editData, nextActivityNo }) => (
    <div data-testid="check-review-dialog">
      {open && (
        <div>
          <span>Check Review Dialog</span>
          <button onClick={() => {
            const dataToSave = editData || { 
              activityNo: nextActivityNo, 
              activityName: 'New Activity',
              documentNumber: 'D-001',
              documentName: 'Doc Name',
              objective: 'Obj',
              references: 'Ref',
              fileName: 'file.pdf',
              qualityIssues: 'None',
              completion: 'Y',
              checkedBy: '2023-01-10T00:00:00Z',
              approvedBy: '2023-01-15T00:00:00Z',
              actionTaken: 'Action',
              maker: 'Maker',
              checker: 'Checker'
             };
            onSave(dataToSave);
          }}>Save</button>
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
    documentNumber: 'D-001',
    documentName: 'Design Spec',
    maker: 'Maker1',
    checker: 'Checker1',
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
    documentNumber: 'C-001',
    documentName: 'Code Spec',
    maker: 'Maker2',
    checker: 'Checker2',
  },
];

describe('CheckReviewForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn(), programId: 'prog1', setProgramId: vi.fn() } as any);
    mockGetCheckReviewsByProject.mockImplementation((id) => {
      console.log('MOCK getCheckReviewsByProject CALLED for project:', id);
      return Promise.resolve(mockReviews);
    });
    mockCreateCheckReview.mockResolvedValue(undefined as any);
    mockUpdateCheckReview.mockResolvedValue(undefined as any);
    mockDeleteCheckReview.mockResolvedValue(undefined as any);
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm for delete tests
  });

  it('should render correctly and load reviews', async () => {
    render(<CheckReviewForm />);

    expect(screen.getByText(/PMD5\. Check and Review Form/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Review/i })).toBeInTheDocument();

    expect(await screen.findByText(/#1/, {}, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText(/Design Review/)).toBeInTheDocument();
    expect(screen.getByText(/design_review\.pdf/)).toBeInTheDocument();
    expect(screen.getAllByText(/Completion/)).toHaveLength(2);
    expect(screen.getByText(/#2/)).toBeInTheDocument();
    expect(screen.getByText(/Code Review/)).toBeInTheDocument();
    expect(screen.getByText(/code_review\.pdf/)).toBeInTheDocument();
  }, 15000);

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined as any, setProjectId: vi.fn(), programId: 'prog1', setProgramId: vi.fn() } as any);
    render(<CheckReviewForm />);
    expect(screen.getByText(/Please select a project/i)).toBeInTheDocument();
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

    await waitFor(() => {
      expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
    });
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
    });
    await waitFor(() => {
      expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
    });
    expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(2); // Initial load + after save
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
          activityName: 'Design Review', // Mock doesn't change it
        })
      );
    });
    await waitFor(() => {
      expect(screen.queryByText('Check Review Dialog')).not.toBeInTheDocument();
    });
    expect(mockGetCheckReviewsByProject).toHaveBeenCalledTimes(2); // Initial load + after save
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
    }, { timeout: 5000 });
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
    }, { timeout: 5000 });
  });

  it('should display error message if loading reviews fails', async () => {
    mockGetCheckReviewsByProject.mockRejectedValue(new Error('Failed to fetch reviews'));
    render(<CheckReviewForm />);

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to load/i);
      expect(alert).toHaveTextContent(/fetch reviews/i);
    }, { timeout: 10000 });
  });

  it('should display error message if saving review fails', async () => {
    mockCreateCheckReview.mockRejectedValue(new Error('Failed to save'));
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: /Add Review/i }));
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to save review/i);
      expect(alert).toHaveTextContent(/Failed to save/i);
    }, { timeout: 10000 });
  });

  it('should display error message if deleting review fails', async () => {
    mockDeleteCheckReview.mockRejectedValue(new Error('Failed to delete'));
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText(/delete review/i)[0]);

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to delete review/i);
      expect(alert).toHaveTextContent(/Failed to delete/i);
    }, { timeout: 10000 });
  });

  it('should show loading spinner when data is being fetched', async () => {
    mockGetCheckReviewsByProject.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockReviews as any), 100)));
    render(<CheckReviewForm />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display "No reviews found" message when no data is returned', async () => {
    mockGetCheckReviewsByProject.mockResolvedValue([]);
    render(<CheckReviewForm />);

    await waitFor(() => {
      expect(screen.getByText('No reviews found for this project. Click "Add Review" to create one.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should format dates correctly', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const summary = await screen.findByText(/Design Review/, {}, { timeout: 10000 });
    const accordionHeader = summary.closest('.MuiAccordionSummary-root');
    fireEvent.click(accordionHeader!);

    await waitFor(() => {
      expect(screen.getByText(/1\/10\/2023/)).toBeInTheDocument();
      expect(screen.getByText(/1\/15\/2023/)).toBeInTheDocument();
    });
  });

  it('should expand and collapse accordion', async () => {
    render(<CheckReviewForm />);

    const summary = await screen.findByText(/Design Review/, {}, { timeout: 10000 });
    const accordionHeader = summary.closest('.MuiAccordionSummary-root');
    const accordion = summary.closest('.MuiAccordion-root');

    expect(accordion).not.toHaveClass('Mui-expanded');

    fireEvent.click(accordionHeader!);
    expect(accordion).toHaveClass('Mui-expanded');

    fireEvent.click(accordionHeader!);
    expect(accordion).not.toHaveClass('Mui-expanded');
  });

  it('should render StatusChip correctly for completion "Y"', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const completionChip = screen.getAllByText(/Completion/)[0];
    expect(completionChip).toBeInTheDocument();
    expect(completionChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(within(completionChip.closest('.MuiChip-root') as HTMLElement).getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });

  it('should render StatusChip correctly for completion "N"', async () => {
    render(<CheckReviewForm />);
    await waitFor(() => expect(mockGetCheckReviewsByProject).toHaveBeenCalled());

    const completionChip = screen.getAllByText(/Completion/)[1];
    expect(completionChip).toBeInTheDocument();
    expect(completionChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    expect(within(completionChip.closest('.MuiChip-root') as HTMLElement).getByTestId('CancelIcon')).toBeInTheDocument();
  });
});







