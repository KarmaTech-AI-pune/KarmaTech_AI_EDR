import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import BidPreparationForm from './BidPreparationForm';
import { bidPreparationApi, DocumentCategory } from '../../dummyapi/bidPreparationApi';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { getBidVersionHistory, BidVersionHistory as BidVersionHistoryType, BidPreparationStatus } from '../../dummyapi/bidVersionHistoryApi';
import { getStatusLabel } from '../../utils/statusUtils';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

// Mock external dependencies
vi.mock('../../dummyapi/bidPreparationApi', () => ({
  bidPreparationApi: {
    getBidPreparationData: vi.fn(),
    updateBidPreparationData: vi.fn(),
    submitForApproval: vi.fn(),
    approveOrReject: vi.fn(),
  },
  DocumentCategory: vi.fn(), // Mock DocumentCategory if it's used as a class/constructor
}));

vi.mock('../../context/BusinessDevelopmentContext', () => ({
  useBusinessDevelopment: vi.fn(),
}));

vi.mock('../../dummyapi/bidVersionHistoryApi', () => ({
  getBidVersionHistory: vi.fn(),
  BidPreparationStatus: {
    Draft: 'Draft',
    PendingApproval: 'Pending Approval',
    Approved: 'Approved',
    Rejected: 'Rejected',
  },
}));

vi.mock('../../utils/statusUtils', () => ({
  getStatusLabel: vi.fn((status: BidPreparationStatus) => status),
}));

vi.mock('./BidVersionHistory', () => ({
  default: vi.fn(() => <div data-testid="bid-version-history">Version History</div>),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Type assertions for mocked functions
const mockGetBidPreparationData = vi.mocked(bidPreparationApi.getBidPreparationData);
const mockUpdateBidPreparationData = vi.mocked(bidPreparationApi.updateBidPreparationData);
const mockSubmitForApproval = vi.mocked(bidPreparationApi.submitForApproval);
const mockApproveOrReject = vi.mocked(bidPreparationApi.approveOrReject);
const mockUseBusinessDevelopment = vi.mocked(useBusinessDevelopment);
const mockGetBidVersionHistory = vi.mocked(getBidVersionHistory);
const mockGetStatusLabel = vi.mocked(getStatusLabel);

const mockInitialCategories: DocumentCategory[] = [
  {
    id: '1',
    name: 'Earnest Money Deposit',
    level: 0,
    children: [],
    isRequired: true,
    isEnclosed: false,
    remarks: 'Initial remarks',
    date: new Date('2023-01-01'),
  },
  {
    id: '3',
    name: 'Company Information',
    level: 0,
    children: [
      {
        id: '3-1',
        name: 'Company registration certificate',
        level: 1,
        parentId: '3',
        children: [],
        isRequired: true,
        isEnclosed: false,
        remarks: 'Child remarks',
        date: new Date('2023-01-02'),
      },
    ],
    isRequired: true,
    isEnclosed: false,
  },
];

const mockVersionHistory: BidVersionHistoryType[] = [
  {
    id: 'v1',
    opportunityId: 1,
    version: 1,
    status: BidPreparationStatus.Draft,
    comments: 'Initial draft',
    timestamp: '2023-01-01T10:00:00Z',
  },
  {
    id: 'v2',
    opportunityId: 1,
    version: 2,
    status: BidPreparationStatus.PendingApproval,
    comments: 'Submitted for approval',
    timestamp: '2023-01-02T10:00:00Z',
  },
];

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {ui}
    </LocalizationProvider>
  );
};

describe('BidPreparationForm', () => {
  const mockOpportunityId = 1;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUseBusinessDevelopment.mockReturnValue({ opportunityId: mockOpportunityId });
    mockGetBidPreparationData.mockResolvedValue({
      id: 1, // Added missing property
      opportunityId: mockOpportunityId,
      documentCategoriesJson: JSON.stringify(mockInitialCategories),
      status: BidPreparationStatus.Draft,
      userId: 'user1', // Added missing property
      createdDate: new Date(), // Added missing property
      modifiedDate: new Date(), // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date(), // Added missing property
      createdBy: 'Test User', // Added missing property
      updatedBy: 'Test User', // Added missing property
      version: 1, // Added missing property
    });
    mockGetBidVersionHistory.mockResolvedValue(mockVersionHistory);
    mockSubmitForApproval.mockResolvedValue(undefined);
    mockUpdateBidPreparationData.mockResolvedValue(undefined);
    mockApproveOrReject.mockResolvedValue(undefined);

    localStorageMock.setItem('user', JSON.stringify({ roles: [{ name: 'Business Development Manager' }] }));
  });

  it('should render correctly in view mode for BDM', async () => {
    renderWithProviders(<BidPreparationForm />);

    await waitFor(() => {
      expect(screen.getByText(`Status: ${BidPreparationStatus.Draft} (Editor)`)).toBeInTheDocument();
      expect(screen.getByText('Earnest Money Deposit')).toBeInTheDocument();
      expect(screen.getByText('Company Information')).toBeInTheDocument();
      expect(screen.getByText('Company registration certificate')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Add Category' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Submit for Approval' })).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('bid-version-history')).toBeInTheDocument();
  });

  it('should toggle to edit mode for BDM', async () => {
    renderWithProviders(<BidPreparationForm />);

    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Edit Mode'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add Category' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit for Approval' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
      expect(screen.getAllByLabelText('text-field-name')).toHaveLength(mockInitialCategories.length + mockInitialCategories[1].children.length); // Assuming text fields for editable names
    });
  });

  it('should add a new top-level category in edit mode', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    await waitFor(() => {
      expect(screen.getAllByRole('textbox', { name: '' })).toHaveLength(mockInitialCategories.length + 1 + mockInitialCategories[1].children.length); // +1 for new category
    });
  });

  it('should update a category name in edit mode', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    const categoryNameInput = screen.getByDisplayValue('Earnest Money Deposit');
    fireEvent.change(categoryNameInput, { target: { value: 'Updated EMD' } });

    expect(categoryNameInput).toHaveValue('Updated EMD');
  });

  it('should delete a category in edit mode', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    const deleteButtons = screen.getAllByLabelText('delete');
    fireEvent.click(deleteButtons[0]); // Click delete for 'Earnest Money Deposit'

    await waitFor(() => {
      expect(screen.queryByText('Earnest Money Deposit')).not.toBeInTheDocument();
    });
  });

  it('should submit for approval as BDM', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));

    await waitFor(() => {
      expect(mockSubmitForApproval).toHaveBeenCalledWith(mockOpportunityId);
      expect(screen.getByText(`Status: ${BidPreparationStatus.PendingApproval} (Editor)`)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Submit for Approval' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    });
  });

  it('should save changes as BDM', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    const categoryNameInput = screen.getByDisplayValue('Earnest Money Deposit');
    fireEvent.change(categoryNameInput, { target: { value: 'Updated EMD for Save' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(mockUpdateBidPreparationData).toHaveBeenCalledTimes(1);
      const expectedCategories = JSON.parse(JSON.stringify(mockInitialCategories));
      expectedCategories[0].name = 'Updated EMD for Save';
      expect(mockUpdateBidPreparationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Updated EMD for Save' }),
          expect.objectContaining({ name: 'Company Information' }),
        ]),
        mockOpportunityId,
        '' // Empty comments for save
      );
      expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument();
    });
  });

  it('should display error if opportunityId is missing', async () => {
    mockUseBusinessDevelopment.mockReturnValue({ opportunityId: undefined });
    renderWithProviders(<BidPreparationForm />);

    await waitFor(() => {
      expect(screen.getByText('No project selected')).toBeInTheDocument();
    });
  });

  it('should display error if loading bid preparation data fails', async () => {
    mockGetBidPreparationData.mockRejectedValue(new Error('Failed to fetch'));
    renderWithProviders(<BidPreparationForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load bid preparation data')).toBeInTheDocument();
    });
  });

  it('should display error if submitting for approval fails', async () => {
    mockSubmitForApproval.mockRejectedValue(new Error('Submission failed'));
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit for approval')).toBeInTheDocument();
    });
  });

  it('should display error if saving changes fails', async () => {
    mockUpdateBidPreparationData.mockRejectedValue(new Error('Save failed'));
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());
    fireEvent.click(screen.getByLabelText('Edit Mode')); // Enter edit mode

    fireEvent.change(screen.getByDisplayValue('Earnest Money Deposit'), { target: { value: 'Temp' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save bid preparation data')).toBeInTheDocument();
    });
  });

  describe('Regional Director/Manager role', () => {
    beforeEach(() => {
      localStorageMock.setItem('user', JSON.stringify({ roles: [{ name: 'Regional Director' }] }));
      mockGetBidPreparationData.mockResolvedValue({
      id: 1, // Added missing property
      opportunityId: mockOpportunityId,
      documentCategoriesJson: JSON.stringify(mockInitialCategories),
      status: BidPreparationStatus.Draft,
      userId: 'user1', // Added missing property
      createdDate: new Date(), // Added missing property
      modifiedDate: new Date(), // Added missing property
      createdAt: new Date(), // Added missing property
      updatedAt: new Date(), // Added missing property
      createdBy: 'Test User', // Added missing property
      updatedBy: 'Test User', // Added missing property
      version: 1, // Added missing property
    });
    });

    it('should render with Approve/Reject buttons when status is Pending Approval', async () => {
      renderWithProviders(<BidPreparationForm />);

      await waitFor(() => {
        expect(screen.getByText(`Status: ${BidPreparationStatus.PendingApproval} (Reviewer)`)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument();
        expect(screen.queryByLabelText('Edit Mode')).not.toBeInTheDocument();
      });
    });

    it('should approve bid preparation with comments', async () => {
      renderWithProviders(<BidPreparationForm />);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
      expect(screen.getByText('Approve Bid Preparation')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Approved by RD' } });
      fireEvent.click(screen.getByRole('button', { name: 'Approve' })); // Click approve in dialog

      await waitFor(() => {
        expect(mockApproveOrReject).toHaveBeenCalledWith(mockOpportunityId, true, 'Approved by RD');
        expect(screen.getByText(`Status: ${BidPreparationStatus.Approved} (Reviewer)`)).toBeInTheDocument();
        expect(screen.queryByText('Approve Bid Preparation')).not.toBeInTheDocument();
      });
    });

    it('should reject bid preparation with comments', async () => {
      renderWithProviders(<BidPreparationForm />);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Reject' })).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Reject' }));
      expect(screen.getByText('Reject Bid Preparation')).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Rejected by RD' } });
      fireEvent.click(screen.getByRole('button', { name: 'Reject' })); // Click reject in dialog

      await waitFor(() => {
        expect(mockApproveOrReject).toHaveBeenCalledWith(mockOpportunityId, false, 'Rejected by RD');
        expect(screen.getByText(`Status: ${BidPreparationStatus.Rejected} (Reviewer)`)).toBeInTheDocument();
        expect(screen.queryByText('Reject Bid Preparation')).not.toBeInTheDocument();
      });
    });

    it('should display error if approval/rejection fails', async () => {
      mockApproveOrReject.mockRejectedValue(new Error('Approval failed'));
      renderWithProviders(<BidPreparationForm />);
      await waitFor(() => expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument());

      fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
      fireEvent.change(screen.getByLabelText('Comments'), { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to save bid preparation data')).toBeInTheDocument();
      });
    });
  });

  it('should display version history', async () => {
    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(mockGetBidVersionHistory).toHaveBeenCalledWith(mockOpportunityId));
    expect(screen.getByTestId('bid-version-history')).toBeInTheDocument();
  });

  it('should display error if loading version history fails', async () => {
    mockGetBidVersionHistory.mockRejectedValue(new Error('History fetch failed'));
    renderWithProviders(<BidPreparationForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load version history')).toBeInTheDocument();
    });
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const stopPropagationSpy = vi.spyOn(React, 'useCallback').mockImplementation((fn) => fn);

    renderWithProviders(<BidPreparationForm />);
    await waitFor(() => expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument());

    const dialog = screen.getByRole('dialog'); // Main dialog
    const mockEvent = { stopPropagation: vi.fn() } as unknown as React.MouseEvent;
    fireEvent.click(dialog, mockEvent);
    expect(mockEvent.stopPropagation).toHaveBeenCalledTimes(1);

    const mockKeyEvent = { stopPropagation: vi.fn() } as unknown as React.KeyboardEvent;
    fireEvent.keyDown(dialog, mockKeyEvent);
    expect(mockKeyEvent.stopPropagation).toHaveBeenCalledTimes(1);

    stopPropagationSpy.mockRestore();
  });
});
