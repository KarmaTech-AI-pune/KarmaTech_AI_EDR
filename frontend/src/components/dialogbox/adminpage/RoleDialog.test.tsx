import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import RoleDialog from './RoleDialog';
import { PermissionDto, PermissionCategoryGroup, RoleWithPermissionsDto } from '../../../services/rolesApi';
import * as rolesApi from '../../../services/rolesApi';

// Mocking Material UI components that might require specific interaction testing
// For simpler components, @testing-library/react might handle them sufficiently.
// If specific behaviors of MUI components are critical and not covered, we might need to mock them.
// For now, let's assume default rendering is sufficient and mock only the API.

// Mock the rolesApi module
vi.mock('../../../services/rolesApi', () => ({
  getPermissionsByGroupedByCategory: vi.fn(),
}));

// Type assertion for mocked functions
const mockGetPermissionsByGroupedByCategory = vi.mocked(rolesApi.getPermissionsByGroupedByCategory);

// Mock data
const mockPermission1: PermissionDto = { id: 'perm1', name: 'READ_DATA', category: 'Data Access' };
const mockPermission2: PermissionDto = { id: 'perm2', name: 'WRITE_DATA', category: 'Data Access' };
const mockPermission3: PermissionDto = { id: 'perm3', name: 'SYSTEM_ADMIN', category: 'System Management' };
const mockPermission4: PermissionDto = { id: 'perm4', name: 'MANAGE_USERS', category: 'User Management' };

const mockPermissionsData: PermissionCategoryGroup[] = [
  { category: 'Data Access', permissions: [mockPermission1, mockPermission2] },
  { category: 'System Management', permissions: [mockPermission3] },
  { category: 'User Management', permissions: [mockPermission4] },
];

const mockExistingRole1: RoleWithPermissionsDto = {
  id: 'role1',
  name: 'Admin',
  minRate: 50,
  isResourceRole: false,
  permissions: [
    { category: 'Data Access', permissions: [mockPermission1] },
    { category: 'System Management', permissions: [mockPermission3] },
  ],
};

const mockExistingRole2: RoleWithPermissionsDto = {
  id: 'role2',
  name: 'Editor',
  minRate: 30,
  isResourceRole: false,
  permissions: [
    { category: 'Data Access', permissions: [mockPermission1, mockPermission2] },
  ],
};

const defaultFormData = {
  id: '',
  name: '',
  minRate: 0,
  isResourceRole: false,
  permissions: [] as PermissionCategoryGroup[],
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  editingRole: null,
  roles: [mockExistingRole1, mockExistingRole2],
  formData: defaultFormData,
  setFormData: vi.fn(),
};

describe('RoleDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default successful behavior
    mockGetPermissionsByGroupedByCategory.mockResolvedValue(mockPermissionsData);
    // Mock setFormData to update the actual formData state in tests
    defaultProps.setFormData.mockImplementation((updater) => {
      const newFormData = typeof updater === 'function' ? updater(defaultProps.formData) : updater;
      defaultProps.formData = { ...defaultProps.formData, ...newFormData };
      return defaultProps.formData;
    });
  });

  it('should render correctly for adding a new role', () => {
    render(<RoleDialog {...defaultProps} />);

    expect(screen.getByText('Add New Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Copy from Existing Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Role Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Min Rate')).toBeInTheDocument();
    expect(screen.getByLabelText('Is ResourceRole')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Role' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Role' })).toBeDisabled(); // Disabled until role name is entered
  });

  it('should render correctly for editing a role', () => {
    const editingRoleData: RoleWithPermissionsDto = {
      id: 'role1',
      name: 'Admin Role',
      minRate: 60,
      isResourceRole: true,
      permissions: [
        { category: 'Data Access', permissions: [mockPermission1] },
      ],
    };
    render(<RoleDialog {...defaultProps} editingRole={editingRoleData} formData={editingRoleData} />);

    expect(screen.getByText('Edit Role')).toBeInTheDocument();
    expect(screen.queryByLabelText('Copy from Existing Role')).not.toBeInTheDocument(); // Should not show copy option when editing
    expect(screen.getByLabelText('Role Name')).toHaveValue('Admin Role');
    expect(screen.getByLabelText('Min Rate')).toHaveValue(60);
    expect(screen.getByLabelText('Is ResourceRole')).toBeChecked();
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });

  it('should load permissions when dialog opens', async () => {
    render(<RoleDialog {...defaultProps} />);

    expect(screen.getByText('Loading permissions...')).toBeInTheDocument();
    expect(mockGetPermissionsByGroupedByCategory).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Data Access')).toBeInTheDocument();
      expect(screen.getByText('System Management')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByLabelText('Read Data')).toBeInTheDocument();
      expect(screen.getByLabelText('Write Data')).toBeInTheDocument();
      expect(screen.getByLabelText('System administrator')).toBeInTheDocument();
    });
  });

  it('should display "No permissions available" if API returns empty array', async () => {
    mockGetPermissionsByGroupedByCategory.mockResolvedValue([]);
    render(<RoleDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No permissions available')).toBeInTheDocument();
    });
  });

  it('should display error message if permission loading fails', async () => {
    const errorMessage = 'Failed to load permissions';
    mockGetPermissionsByGroupedByCategory.mockRejectedValue(new Error(errorMessage));
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<RoleDialog {...defaultProps} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading permissions:', expect.any(Error));
      expect(screen.getByText('Error loading permissions:')).toBeInTheDocument(); // Assuming the component might display an error message
      // If the component doesn't explicitly show an error message, we might need to check console logs or mock a specific error display.
      // For now, we'll assume the error is logged and the loading state disappears.
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should update form data when role name is changed', () => {
    render(<RoleDialog {...defaultProps} />);
    const roleNameInput = screen.getByLabelText('Role Name');
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'New Role Name' } });

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Role Name' }));
  });

  it('should update form data when minRate is changed', () => {
    render(<RoleDialog {...defaultProps} />);
    const minRateInput = screen.getByLabelText('Min Rate');
    fireEvent.change(minRateInput, { target: { name: 'minRate', value: '75' } });

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({ minRate: '75' }));
  });

  it('should update form data when isResourceRole checkbox is changed', () => {
    render(<RoleDialog {...defaultProps} />);
    const resourceRoleCheckbox = screen.getByLabelText('Is ResourceRole');
    fireEvent.click(resourceRoleCheckbox);

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({ isResourceRole: true }));
  });

  it('should update form data when copying from an existing role', async () => {
    render(<RoleDialog {...defaultProps} />);
    const selectRoleInput = screen.getByLabelText('Copy from Existing Role');

    // Open the select dropdown
    fireEvent.mouseDown(selectRoleInput);

    // Select 'Admin' role
    fireEvent.click(screen.getByText('Admin'));

    await waitFor(() => {
      expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
        name: '', // Name should be cleared when copying
        permissions: [
          { category: 'Data Access', permissions: [mockPermission1] },
          { category: 'System Management', permissions: [mockPermission3] },
        ],
      }));
    });
  });

  it('should handle permission checkbox changes correctly', async () => {
    render(<RoleDialog {...defaultProps} />);

    await waitFor(() => {
      // Check 'Write Data' permission
      const writeDataCheckbox = screen.getByLabelText('Write Data');
      fireEvent.click(writeDataCheckbox);
      expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
        permissions: expect.arrayContaining([
          expect.objectContaining({
            category: 'Data Access',
            permissions: expect.arrayContaining([mockPermission1, mockPermission2]),
          }),
        ]),
      }));

      // Uncheck 'Write Data' permission
      fireEvent.click(writeDataCheckbox);
      expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
        permissions: expect.arrayContaining([
          expect.objectContaining({
            category: 'Data Access',
            permissions: [mockPermission1], // Only 'Read Data' should remain
          }),
        ]),
      }));

      // Uncheck 'Read Data' permission, which should remove the category
      const readDataCheckbox = screen.getByLabelText('Read Data');
      fireEvent.click(readDataCheckbox);
      expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.objectContaining({
        permissions: expect.not.arrayContaining([
          expect.objectContaining({ category: 'Data Access' }),
        ]),
      }));
    });
  });

  it('should enable Create Role button when role name is entered', async () => {
    render(<RoleDialog {...defaultProps} />);
    const roleNameInput = screen.getByLabelText('Role Name');
    const createButton = screen.getByRole('button', { name: 'Create Role' });

    expect(createButton).toBeDisabled();
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'Test Role' } });
    expect(createButton).toBeEnabled();
  });

  it('should show validation error if role name is empty on submit', () => {
    render(<RoleDialog {...defaultProps} />);
    const createButton = screen.getByRole('button', { name: 'Create Role' });

    // Ensure role name is empty
    const roleNameInput = screen.getByLabelText('Role Name');
    fireEvent.change(roleNameInput, { target: { name: 'name', value: '' } });
    expect(createButton).toBeDisabled();

    // Attempt to submit
    fireEvent.click(createButton);
    expect(screen.getByText('Please fill in the role name')).toBeVisible();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with correct data when creating a role', async () => {
    const newRoleName = 'New Role';
    const newMinRate = 80;
    const newIsResourceRole = true;
    const selectedPermissions = [
      { category: 'Data Access', permissions: [mockPermission2] }, // Write Data
    ];

    // Set up form data for the test
    defaultProps.formData = { ...defaultFormData, name: newRoleName, minRate: newMinRate, isResourceRole: newIsResourceRole, permissions: selectedPermissions };
    // Mock setFormData to capture the final state passed to onSubmit
    const onSubmitMock = vi.fn();
    render(<RoleDialog {...defaultProps} onSubmit={onSubmitMock} formData={defaultProps.formData} />);

    // Fill in the role name to enable the button
    const roleNameInput = screen.getByLabelText('Role Name');
    fireEvent.change(roleNameInput, { target: { name: 'name', value: newRoleName } });

    // Select a permission
    await waitFor(() => {
      const writeDataCheckbox = screen.getByLabelText('Write Data');
      fireEvent.click(writeDataCheckbox);
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Create Role' }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith({
        id: '', // Should be empty for new role
        name: newRoleName,
        minRate: String(newMinRate),
        isResourceRole: newIsResourceRole,
        permissions: expect.arrayContaining([
          expect.objectContaining({ category: 'Data Access', permissions: [mockPermission2] }),
        ]),
      });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onSubmit with correct data when editing a role', async () => {
    const editingRoleData: RoleWithPermissionsDto = {
      id: 'role1',
      name: 'Admin Role',
        minRate: String(60),
      isResourceRole: true,
      permissions: [
        { category: 'Data Access', permissions: [mockPermission1] },
      ],
    };
    const onSubmitMock = vi.fn();
    render(<RoleDialog {...defaultProps} editingRole={editingRoleData} formData={editingRoleData} onSubmit={onSubmitMock} />);

    // Change role name
    const roleNameInput = screen.getByLabelText('Role Name');
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'Updated Admin Role' } });

    // Add a permission
    await waitFor(() => {
      const writeDataCheckbox = screen.getByLabelText('Write Data');
      fireEvent.click(writeDataCheckbox);
    });

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith({
        id: 'role1',
        name: 'Updated Admin Role',
        minRate: 60,
        isResourceRole: true,
        permissions: expect.arrayContaining([
          expect.objectContaining({ category: 'Data Access', permissions: [mockPermission1] }), // Existing permission
          expect.objectContaining({ category: 'Data Access', permissions: [mockPermission2] }), // Added permission
        ]),
      });
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('should call onClose when Cancel button is clicked', () => {
    render(<RoleDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should format permission labels correctly', () => {
    // Directly test the helper function if it were exported, or test its output via UI rendering
    // Since it's internal, we test its effect on the rendered labels.
    render(<RoleDialog {...defaultProps} />);
    expect(screen.getByLabelText('Read Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Write Data')).toBeInTheDocument();
    expect(screen.getByLabelText('System administrator')).toBeInTheDocument();
    expect(screen.getByLabelText('Manage Users')).toBeInTheDocument();
  });
});
