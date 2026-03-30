
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectItem } from './ProjectItem';
import { projectApi } from '../../services/projectApi';
import { authApi } from '../../services/authApi';
import { getUsersByRole } from '../../services/userApi';
import { PermissionType } from '../../models';
import { useAppNavigation } from '../../hooks/useAppNavigation';

// Mock Dependencies
vi.mock('../../../services/projectApi', () => ({
  projectApi: {
    delete: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../services/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('../../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
}));

vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigation: vi.fn(),
}));

vi.mock('../budget/BudgetHealthIndicatorExample', () => ({
  BudgetHealthDisplay: () => <div data-testid="budget-health-display">Budget Health</div>,
}));

vi.mock('../../forms/ProjectInitForm', () => ({
  ProjectInitForm: ({ onSubmit, onCancel }: any) => (
    <div data-testid="project-init-form">
      Project Form
      <button onClick={() => onSubmit({ name: 'Updated Project', estimatedProjectCost: 200 })}>Submit Form</button>
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}));

describe('ProjectItem', () => {
  const mockNavigateToProjectDetails = vi.fn();

  const mockProject = {
    id: '123',
    name: 'Test Project',
    clientName: 'Test Client',
    typeOfClient: 'Private',
    office: 'London',
    region: 'UK',
    typeOfJob: 'Software',
    sector: 'Technology',
    currency: 'USD',
    estimatedProjectCost: 100,
    estimatedProjectFee: 100,
    feeType: 'Fixed',
    status: 'InProgress',
  };

  const defaultProps = {
    project: mockProject as any,
    onProjectDeleted: vi.fn(),
    onProjectUpdated: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppNavigation as any).mockReturnValue({
      navigateToProjectDetails: mockNavigateToProjectDetails,
    });

    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: {
        permissions: [PermissionType.EDIT_PROJECT, PermissionType.DELETE_PROJECT],
      },
    });

    (getUsersByRole as any).mockImplementation((role: string) => {
      if (role === 'Project Manager') return Promise.resolve([{ id: 'pm1', name: 'PM One' }]);
      if (role === 'Senior Project Manager') return Promise.resolve([{ id: 'spm1', name: 'SPM One' }]);
      return Promise.resolve([]);
    });
  });

  it('renders project details correctly', async () => {
    render(<ProjectItem {...defaultProps} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText(/Test Client.*Private/)).toBeInTheDocument();
    expect(screen.getByText(/London.*UK/)).toBeInTheDocument();
    expect(screen.getByText(/Software.*Technology/)).toBeInTheDocument();
    expect(screen.getByText(/USD 100 \(Fixed\)/)).toBeInTheDocument();
    expect(screen.getByTestId('budget-health-display')).toBeInTheDocument();

    // Verify edit/delete icons are visible
    await waitFor(() => {
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });
  });

  it('navigates to project details when clicked', () => {
    render(<ProjectItem {...defaultProps} />);

    // Item container handles the click
    const item = screen.getByText('Test Project').closest('li');
    fireEvent.click(item!);

    expect(mockNavigateToProjectDetails).toHaveBeenCalledWith(mockProject);
  });

  it('handles edit dialog and update submission', async () => {
    (projectApi.update as any).mockResolvedValue({});

    render(<ProjectItem {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('EditIcon')).toBeInTheDocument();
    });

    // Click edit
    const editButton = screen.getByTestId('EditIcon').closest('button');
    fireEvent.click(editButton!);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByTestId('project-init-form')).toBeInTheDocument();
    });

    // Submit form
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      // API should be called with updated data matching the initial mock plus changes
      expect(projectApi.update).toHaveBeenCalledWith(
        '123',
        expect.objectContaining({
          name: 'Updated Project',
          estimatedProjectCost: 200,
        }),
        undefined // Because budget changed, although our mocked form didn't provide budgetReason explicitly
      );
      expect(defaultProps.onProjectUpdated).toHaveBeenCalled();
    });
  });

  it('handles delete dialog and deletion', async () => {
    (projectApi.delete as any).mockResolvedValue({});

    render(<ProjectItem {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('DeleteIcon')).toBeInTheDocument();
    });

    // Click delete
    const deleteButton = screen.getByTestId('DeleteIcon').closest('button');
    fireEvent.click(deleteButton!);

    // Dialog should open
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete project/)).toBeInTheDocument();
    });

    // Confirm deletion
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(projectApi.delete).toHaveBeenCalledWith('123');
      expect(defaultProps.onProjectDeleted).toHaveBeenCalledWith('123');
    });
  });

  it('hides edit and delete icons if user lacks permissions', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: {
        permissions: [],
      },
    });

    render(<ProjectItem {...defaultProps} />);

    // Ensure they don't appear
    await waitFor(() => {
      expect(authApi.getCurrentUser).toHaveBeenCalled();
    });

    expect(screen.queryByTestId('EditIcon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('DeleteIcon')).not.toBeInTheDocument();
  });
});
