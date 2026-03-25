
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpportunityItem } from './OpportunityItem';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { authApi } from '../../dummyapi/authApi';
import { PermissionType } from '../../models';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { useNavigate } from 'react-router-dom';
import { getUserById } from '../../services/userApi';
import { getEnhancedWorkflowStatus } from '../../utils/workflowStatusFormatter';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow'; // Fixed typo in actual import path

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../../../context/BusinessDevelopmentContext', () => ({
  useBusinessDevelopment: vi.fn(),
}));

vi.mock('../../../dummyapi/opportunityApi', () => ({
  opportunityApi: {
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../dummyapi/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('../../../services/userApi', () => ({
  getUserById: vi.fn(),
}));

vi.mock('../../../utils/workflowStatusFormatter', () => ({
  getEnhancedWorkflowStatus: vi.fn(),
}));

vi.mock('../../../dummyapi/database/dummyOpporunityWorkflow', () => ({
  getWorkflowStatusById: vi.fn(),
}));

vi.mock('../../common/BDChips', () => ({
  BDChips: () => <div data-testid="bd-chips-mock">BDChips</div>,
}));

vi.mock('../../forms/OpportunityForm', () => ({
  OpportunityForm: ({ onSubmit }: any) => (
    <form aria-label="opportuniy-form" onSubmit={(e) => {
      e.preventDefault();
      onSubmit({ workName: 'Updated WorkName' });
    }}>
      <button type="submit">Submit Form</button>
    </form>
  ),
}));

describe('OpportunityItem', () => {
  const mockNavigate = vi.fn();
  const mockSetOpportunityId = vi.fn();

  const mockOpportunity = {
    id: 1,
    workName: 'Test Opportunity',
    client: 'Test Client',
    clientSector: 'Tech',
    operation: 'Sales',
    stage: 'Lead',
    status: 'Active',
    currency: 'USD',
    bidFees: 10000,
    bidNumber: 'BID-001',
    reviewManagerId: 2,
    approvalManagerId: 3,
    currentHistory: { statusId: 1 }
  };

  const defaultProps = {
    opportunity: mockOpportunity as any,
    onOpportunityDeleted: vi.fn(),
    onOpportunityUpdated: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useBusinessDevelopment as any).mockReturnValue({
      setOpportunityId: mockSetOpportunityId,
    });

    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: {
        permissions: [PermissionType.EDIT_BUSINESS_DEVELOPMENT, PermissionType.DELETE_BUSINESS_DEVELOPMENT],
      },
    });

    (getUserById as any).mockImplementation((id: number) => {
      if (id === 2) return Promise.resolve({ id: 2, name: 'Reviewer', roles: [{ name: 'RM' }] });
      if (id === 3) return Promise.resolve({ id: 3, name: 'Approver', roles: [{ name: 'RD' }] });
      return Promise.resolve(null);
    });

    (getWorkflowStatusById as any).mockReturnValue({ status: 'Initial' });
    (getEnhancedWorkflowStatus as any).mockReturnValue('Initial Status');
  });

  it('renders opportunity details correctly', async () => {
    render(<OpportunityItem {...defaultProps} />);

    expect(screen.getByText('Test Opportunity')).toBeInTheDocument();
    expect(screen.getByText(/Test Client/)).toBeInTheDocument();
    expect(screen.getByText(/Tech/)).toBeInTheDocument();
    expect(screen.getByText(/Sales/)).toBeInTheDocument();

    // Wait for the async permission check to finish
    await waitFor(() => {
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });
  });

  it('navigates to details view on click', async () => {
    render(<OpportunityItem {...defaultProps} />);

    // The list item handles the click
    const listItem = screen.getByText('Test Opportunity').closest('li');
    fireEvent.click(listItem!);

    expect(mockSetOpportunityId).toHaveBeenCalledWith('1');
    expect(mockNavigate).toHaveBeenCalledWith('/business-development/details/overview');
  });

  it('opens update dialog and handles update', async () => {
    (opportunityApi.update as any).mockResolvedValue({ ...mockOpportunity, workName: 'Updated WorkName' });

    render(<OpportunityItem {...defaultProps} />);

    // Wait for edit icon to appear
    await waitFor(() => {
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByTestId('EditIcon').closest('button');
    // Stop propagation is used, so fire event specifically on button
    fireEvent.click(editButton!);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByRole('form', { name: 'opportuniy-form' })).toBeInTheDocument();
    });

    // Submit form
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(opportunityApi.update).toHaveBeenCalledWith(1, expect.objectContaining({ workName: 'Updated WorkName' }));
      expect(defaultProps.onOpportunityUpdated).toHaveBeenCalled();
      // Should show new name
      expect(screen.getByText('Updated WorkName')).toBeInTheDocument();
    });
  });

  it('opens delete dialog and handles deletion', async () => {
    (opportunityApi.delete as any).mockResolvedValue({});

    render(<OpportunityItem {...defaultProps} />);

    // Wait for delete icon to appear
    await waitFor(() => {
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton!);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete opportunity/)).toBeInTheDocument();
    });

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(opportunityApi.delete).toHaveBeenCalledWith(1);
      expect(defaultProps.onOpportunityDeleted).toHaveBeenCalledWith('1');
    });
  });

  it('hides edit and delete buttons if user lacks permissions', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: {
        permissions: [],
      },
    });

    render(<OpportunityItem {...defaultProps} />);

    // Wait for authApi to resolve
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
  });
});
