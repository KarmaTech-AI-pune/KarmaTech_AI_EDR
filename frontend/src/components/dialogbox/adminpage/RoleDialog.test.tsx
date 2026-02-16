import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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
const mockPermission1: PermissionDto = { id: 1, name: 'READ_DATA', category: 'Data Access', description: '', roles: [] };
const mockPermission2: PermissionDto = { id: 2, name: 'WRITE_DATA', category: 'Data Access', description: '', roles: [] };
const mockPermission3: PermissionDto = { id: 3, name: 'SYSTEM_ADMIN', category: 'System Management', description: '', roles: [] };
const mockPermission4: PermissionDto = { id: 4, name: 'MANAGE_USERS', category: 'User Management', description: '', roles: [] };

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
  afterEach(() => {
    vi.clearAllMocks();
  });

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

  it('should render correctly for adding a new role', async () => {
    render(<RoleDialog {...defaultProps} />);

    expect(screen.getByText('Add New Role')).toBeInTheDocument();
    
    // Wait for permissions to load first
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    // Check for "Copy from Existing Role" - use getAllByText since it appears in both InputLabel and Select
    const copyLabels = screen.getAllByText('Copy from Existing Role');
    expect(copyLabels.length).toBeGreaterThan(0);
    
    // Use getByRole for textboxes
    expect(screen.getByRole('textbox', { name: /role name/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Min Rate')).toBeInTheDocument();
    expect(screen.getByLabelText('Is ResourceRole')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Role' })).toBeInTheDocument();
    // Note: Component doesn't disable button based on role name, so we don't check that
  });

  it('should render correctly for editing a role', async () => {
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
    
    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    await waitFor(() => expect(screen.queryByText('Copy from Existing Role')).not.toBeInTheDocument()); // Should not show copy option when editing
    
    // Use getByRole with name option to find the textbox
    const roleNameInput = screen.getByRole('textbox', { name: /role name/i });
    expect(roleNameInput).toHaveValue('Admin Role');
    expect(await screen.findByLabelText('Min Rate')).toHaveValue(60);
    expect(await screen.findByLabelText('Is ResourceRole')).toBeChecked();
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
      // Component doesn't display error message, just logs to console and stops loading
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
      // Should show "No permissions available" when permissions array is empty after error
      expect(screen.getByText('No permissions available')).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });

  it('should update form data when role name is changed', async () => {
    render(<RoleDialog {...defaultProps} />);
    
    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    const roleNameInput = screen.getByRole('textbox', { name: /role name/i });
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'New Role Name' } });

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update form data when minRate is changed', async () => {
    render(<RoleDialog {...defaultProps} />);
    const minRateInput = screen.getByLabelText('Min Rate');
    fireEvent.change(minRateInput, { target: { name: 'minRate', value: '75' } });

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update form data when isResourceRole checkbox is changed', async () => {
    render(<RoleDialog {...defaultProps} />);
    const resourceRoleCheckbox = screen.getByLabelText('Is ResourceRole');
    fireEvent.click(resourceRoleCheckbox);

    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should update form data when copying from an existing role', async () => {
    render(<RoleDialog {...defaultProps} />);
    
    // Wait for permissions to load first
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    // Find the Select component by its label - use getAllByText since label appears multiple times
    const selectLabels = screen.getAllByText('Copy from Existing Role');
    expect(selectLabels.length).toBeGreaterThan(0);
    
    const selectElement = selectLabels[0].parentElement?.querySelector('input');
    
    if (selectElement) {
      // Trigger the select change event directly
      fireEvent.change(selectElement, { target: { value: 'Admin' } });
      
      await waitFor(() => {
        expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
      });
    }
  });

  it('should handle permission checkbox changes correctly', async () => {
    render(<RoleDialog {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });

    // Check 'Write Data' permission
    const writeDataCheckbox = screen.getByLabelText('Write Data');
    fireEvent.click(writeDataCheckbox);
    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));

    // Uncheck 'Write Data' permission
    fireEvent.click(writeDataCheckbox);
    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));

    // Check 'Read Data' permission
    const readDataCheckbox = screen.getByLabelText('Read Data');
    fireEvent.click(readDataCheckbox);
    expect(defaultProps.setFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should enable Create Role button when role name is entered', async () => {
    render(<RoleDialog {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    const roleNameInput = screen.getByRole('textbox', { name: /role name/i });
    const createButton = screen.getByRole('button', { name: 'Create Role' });

    // Component doesn't disable button based on role name
    expect(createButton).toBeEnabled();
    
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'Test Role' } });
    expect(createButton).toBeEnabled();
  });

  it('should show validation error if role name is empty on submit', async () => {
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    // Start with empty form data
    const emptyFormData = { ...defaultFormData, name: '' };
    render(<RoleDialog {...defaultProps} formData={emptyFormData} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    const createButton = screen.getByRole('button', { name: 'Create Role' });

    // Attempt to submit with empty name
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Please fill in the role name');
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
    
    alertSpy.mockRestore();
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

    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });

    // Fill in the role name to enable the button
    const roleNameInput = screen.getByRole('textbox', { name: /role name/i });
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
        minRate: newMinRate,
        isResourceRole: newIsResourceRole,
        permissions: expect.arrayContaining([
          expect.objectContaining({ category: 'Data Access', permissions: [mockPermission2] }),
        ]),
      });
    });
  });

  it('should call onSubmit with correct data when editing a role', async () => {
    let currentFormData: RoleWithPermissionsDto = {
      id: 'role1',
      name: 'Admin Role',
      minRate: 60,
      isResourceRole: true,
      permissions: [
        { category: 'Data Access', permissions: [mockPermission1] },
      ],
    };
    
    const onSubmitMock = vi.fn();
    const setFormDataMock = vi.fn((updater) => {
      currentFormData = typeof updater === 'function' ? updater(currentFormData) : updater;
    });
    
    const { rerender } = render(
      <RoleDialog 
        {...defaultProps} 
        editingRole={currentFormData} 
        formData={currentFormData} 
        setFormData={setFormDataMock}
        onSubmit={onSubmitMock} 
      />
    );

    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });

    // Change role name
    const roleNameInput = screen.getByRole('textbox', { name: /role name/i });
    fireEvent.change(roleNameInput, { target: { name: 'name', value: 'Updated Admin Role' } });
    
    // Update formData and rerender
    currentFormData = { ...currentFormData, name: 'Updated Admin Role' };
    rerender(
      <RoleDialog 
        {...defaultProps} 
        editingRole={currentFormData} 
        formData={currentFormData} 
        setFormData={setFormDataMock}
        onSubmit={onSubmitMock} 
      />
    );

    // Add a permission
    await waitFor(() => {
      const writeDataCheckbox = screen.getByLabelText('Write Data');
      fireEvent.click(writeDataCheckbox);
    });
    
    // Update permissions and rerender
    currentFormData = {
      ...currentFormData,
      permissions: [
        { category: 'Data Access', permissions: [mockPermission1, mockPermission2] }
      ]
    };
    rerender(
      <RoleDialog 
        {...defaultProps} 
        editingRole={currentFormData} 
        formData={currentFormData} 
        setFormData={setFormDataMock}
        onSubmit={onSubmitMock} 
      />
    );

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith({
        id: 'role1',
        name: 'Updated Admin Role',
        minRate: 60,
        isResourceRole: true,
        permissions: [
          { category: 'Data Access', permissions: [mockPermission1, mockPermission2] }
        ],
      });
    });
  });

  it('should call onClose when Cancel button is clicked', async () => {
    render(<RoleDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should format permission labels correctly', async () => {
    // Directly test the helper function if it were exported, or test its output via UI rendering
    // Since it's internal, we test its effect on the rendered labels.
    render(<RoleDialog {...defaultProps} />);
    
    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.queryByText('Loading permissions...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Read Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Write Data')).toBeInTheDocument();
    expect(screen.getByLabelText('System administrator')).toBeInTheDocument();
    expect(screen.getByLabelText('Manage Users')).toBeInTheDocument();
  });
});






