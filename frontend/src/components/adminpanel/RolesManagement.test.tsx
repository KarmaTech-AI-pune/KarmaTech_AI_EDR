import React from 'react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import RolesManagement from './RolesManagement';
import type { RoleWithPermissionsDto } from '../../services/rolesApi';

// Hoist mocks to avoid reference errors
const mockGetAllRolesWithPermissions = vi.hoisted(() => vi.fn());
const mockCreateRole = vi.hoisted(() => vi.fn());
const mockUpdateRole = vi.hoisted(() => vi.fn());
const mockDeleteRole = vi.hoisted(() => vi.fn());

// Hoist MockRoleDialog to avoid reference errors
const MockRoleDialog = vi.hoisted(() => vi.fn(({ open, onClose, onSubmit, editingRole, formData, setFormData }) => {
  if (!open) return null;
  return (
    <div data-testid="role-dialog">
      <h2>{editingRole ? 'Edit Role' : 'Add New Role'}</h2>
      <input
        data-testid="role-name-input"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      <input
        data-testid="role-minrate-input"
        type="number"
        value={formData.minRate}
        onChange={(e) => setFormData({ ...formData, minRate: parseFloat(e.target.value) })}
      />
      <input
        data-testid="role-isresourcerole-checkbox"
        type="checkbox"
        checked={formData.isResourceRole}
        onChange={(e) => setFormData({ ...formData, isResourceRole: e.target.checked })}
      />
      <button onClick={onClose}>Cancel</button>
      <button onClick={() => onSubmit(formData)}>{editingRole ? 'Update' : 'Create'}</button>
    </div>
  );
}));

// Mock the API service
vi.mock('../../services/rolesApi', () => ({
  getAllRolesWithPermissions: mockGetAllRolesWithPermissions,
  createRole: mockCreateRole,
  updateRole: mockUpdateRole,
  deleteRole: mockDeleteRole,
}));

// Mock the RoleDialog component
vi.mock('../dialogbox/adminpage/RoleDialog', () => ({
  default: MockRoleDialog,
}));

const mockRoles: RoleWithPermissionsDto[] = [
  {
    id: 'role1',
    name: 'Admin',
    minRate: 50,
    isResourceRole: false,
    permissions: [
      { category: 'System', permissions: [{ id: 1, name: 'SYSTEM_ADMIN', description: 'System Admin', category: 'System', roles: [] }] },
      { category: 'Project', permissions: [{ id: 2, name: 'PROJECT_VIEW', description: 'View Projects', category: 'Project', roles: [] }] },
    ],
  },
  {
    id: 'role2',
    name: 'Project Manager',
    minRate: 40,
    isResourceRole: true,
    permissions: [
      { category: 'Project', permissions: [{ id: 3, name: 'PROJECT_CREATE', description: 'Create Projects', category: 'Project', roles: [] }] },
      { category: 'Business Development', permissions: [{ id: 4, name: 'BUSINESS_DEVELOPMENT_VIEW', description: 'View BD', category: 'Business Development', roles: [] }] },
    ],
  },
  {
    id: 'role3',
    name: 'Viewer',
    minRate: 0,
    isResourceRole: false,
    permissions: [
      { category: 'Other', permissions: [{ id: 5, name: 'REPORT_VIEW', description: 'View Reports', category: 'Other', roles: [] }] },
    ],
  },
];

describe('RolesManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    mockGetAllRolesWithPermissions.mockClear();
    mockCreateRole.mockClear();
    mockUpdateRole.mockClear();
    mockDeleteRole.mockClear();
    MockRoleDialog.mockClear();

    mockGetAllRolesWithPermissions.mockResolvedValue(mockRoles);
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm for delete tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Initial render and loading of roles
  test('renders roles and calls API on initial load', async () => {
    render(<RolesManagement />);

    expect(screen.getByText('Roles Management')).toBeInTheDocument();
    expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Project Manager')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });

    // Check table content
    expect(screen.getByRole('cell', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '50' })).toBeInTheDocument();
    // Use getAllByRole for cells with "No" since there are multiple
    const noCells = screen.getAllByRole('cell', { name: 'No' });
    expect(noCells.length).toBeGreaterThan(0);
    // Permissions cell contains chips with combined text - use getAllByText since "1 Project" appears twice
    const projectChips = screen.getAllByText('1 Project');
    expect(projectChips.length).toBeGreaterThan(0);
    expect(screen.getByText('System Admin')).toBeInTheDocument();

    expect(screen.getByRole('cell', { name: 'Project Manager' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '40' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByText('1 Business')).toBeInTheDocument();
  });

  // Test 2: Error handling during initial load
  test('logs error if loading roles fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAllRolesWithPermissions.mockRejectedValueOnce(new Error('Failed to fetch roles'));
    render(<RolesManagement />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading roles:', expect.any(Error));
    }, { timeout: 3000 });
    
    await waitFor(async () => {
      await waitFor(() => expect(screen.queryByText('Admin')).not.toBeInTheDocument());
    }); // Roles should not be rendered
    
    consoleErrorSpy.mockRestore();
  });

  // Test 3: Add New Role - Dialog opens and closes
  test('opens and closes the Add New Role dialog', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument()); // Ensure roles are loaded

    fireEvent.click(screen.getByRole('button', { name: /Add New Role/i }));
    expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: true, editingRole: null }), {});

    const dialog = screen.getByTestId('role-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Add New Role/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: false }), {});
    });
  });

  // Test 4: Add New Role - Successful creation
  test('successfully creates a new role', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add New Role/i }));

    const newRoleData = {
      id: '', // ID will be generated by backend
      name: 'New Role',
      minRate: 25,
      isResourceRole: true,
      permissions: [],
    };

    // Simulate form submission from RoleDialog
    MockRoleDialog.mock.calls[MockRoleDialog.mock.calls.length - 1][0].onSubmit(newRoleData);

    await waitFor(() => {
      // createRole expects an array of roles
      expect(mockCreateRole).toHaveBeenCalledWith([newRoleData]);
      expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(2); // Reload roles
      expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: false }), {}); // Dialog closes
    });
  });

  // Test 5: Add New Role - Error during creation
  test('logs error if creating a role fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add New Role/i }));

    const newRoleData = {
      id: '',
      name: 'Failing Role',
      minRate: 10,
      isResourceRole: false,
      permissions: [],
    };
    mockCreateRole.mockRejectedValueOnce(new Error('Creation failed'));

    MockRoleDialog.mock.calls[MockRoleDialog.mock.calls.length - 1][0].onSubmit(newRoleData);

    await waitFor(() => {
      expect(mockCreateRole).toHaveBeenCalledWith([newRoleData]);
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving role:', expect.any(Error));
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: true }), {});
    }); // Dialog remains open
    
    consoleErrorSpy.mockRestore();
  });

  // Test 6: Edit Existing Role - Dialog opens with pre-filled data
  test('opens the Edit Role dialog with pre-filled data', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table - edit buttons are the first set of icon buttons
    const allButtons = screen.getAllByRole('button');
    // Filter out the "Add New Role" button (first button) and get edit buttons
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const editButtons = tableButtons.filter((_, index) => index % 2 === 0); // Even indices are edit buttons
    
    fireEvent.click(editButtons[0]); // Click edit for Admin role

    expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({
      open: true,
      editingRole: mockRoles[0],
      formData: {
        id: mockRoles[0].id,
        name: mockRoles[0].name,
        minRate: mockRoles[0].minRate,
        isResourceRole: mockRoles[0].isResourceRole,
        permissions: mockRoles[0].permissions,
      },
    }), {});

    const dialog = screen.getByTestId('role-dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Edit Role/i })).toBeInTheDocument();
    expect(screen.getByTestId('role-name-input')).toHaveValue('Admin');
    expect(screen.getByTestId('role-minrate-input')).toHaveValue(50);
    expect(screen.getByTestId('role-isresourcerole-checkbox')).not.toBeChecked();
  });

  // Test 7: Edit Existing Role - Successful update
  test('successfully updates an existing role', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const editButtons = tableButtons.filter((_, index) => index % 2 === 0); // Even indices are edit buttons
    
    fireEvent.click(editButtons[0]); // Click edit for Admin role

    const updatedRoleData = {
      ...mockRoles[0],
      name: 'Super Admin',
      minRate: 60,
    };

    // Simulate form submission from RoleDialog
    MockRoleDialog.mock.calls[MockRoleDialog.mock.calls.length - 1][0].onSubmit(updatedRoleData);

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(mockRoles[0].id, updatedRoleData);
      expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(2); // Reload roles
      expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: false }), {}); // Dialog closes
    });
  });

  // Test 8: Edit Existing Role - Error during update
  test('logs error if updating a role fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const editButtons = tableButtons.filter((_, index) => index % 2 === 0); // Even indices are edit buttons
    
    fireEvent.click(editButtons[0]); // Click edit for Admin role

    const updatedRoleData = {
      ...mockRoles[0],
      name: 'Failing Update',
    };
    mockUpdateRole.mockRejectedValueOnce(new Error('Update failed'));

    MockRoleDialog.mock.calls[MockRoleDialog.mock.calls.length - 1][0].onSubmit(updatedRoleData);

    await waitFor(() => {
      expect(mockUpdateRole).toHaveBeenCalledWith(mockRoles[0].id, updatedRoleData);
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving role:', expect.any(Error));
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(MockRoleDialog).toHaveBeenCalledWith(expect.objectContaining({ open: true }), {});
    }); // Dialog remains open
    
    consoleErrorSpy.mockRestore();
  });

  // Test 9: Delete Role - Successful deletion
  test('successfully deletes a role', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const deleteButtons = tableButtons.filter((_, index) => index % 2 === 1); // Odd indices are delete buttons
    
    fireEvent.click(deleteButtons[0]); // Click delete for Admin role

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this role?');
    mockDeleteRole.mockResolvedValueOnce(undefined); // Mock successful deletion

    await waitFor(() => {
      expect(mockDeleteRole).toHaveBeenCalledWith(mockRoles[0].id);
      expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(2); // Reload roles
    });
  });

  // Test 10: Delete Role - User cancels deletion
  test('does not delete role if user cancels confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const deleteButtons = tableButtons.filter((_, index) => index % 2 === 1); // Odd indices are delete buttons
    
    fireEvent.click(deleteButtons[0]); // Click delete for Admin role

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this role?');
    expect(mockDeleteRole).not.toHaveBeenCalled();
    expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(1); // No reload
  });

  // Test 11: Delete Role - Error during deletion
  test('logs error if deleting a role fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    mockDeleteRole.mockRejectedValueOnce(new Error('Deletion failed'));

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const deleteButtons = tableButtons.filter((_, index) => index % 2 === 1); // Odd indices are delete buttons
    
    fireEvent.click(deleteButtons[0]); // Click delete for Admin role

    await waitFor(() => {
      expect(mockDeleteRole).toHaveBeenCalledWith(mockRoles[0].id);
    });

    // Wait for the error to be logged
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting role:', expect.any(Error));
    }, { timeout: 2000 });

    expect(mockGetAllRolesWithPermissions).toHaveBeenCalledTimes(1); // No reload on error (loadRoles is in try block)
    consoleErrorSpy.mockRestore();
  });

  // Test 12: formatPermissionLabel function
  test('formatPermissionLabel correctly formats permission strings', async () => {
    // Re-rendering with a mock role that has specific permissions to check the labels
    const roleWithVariousPermissions: RoleWithPermissionsDto = {
      id: 'test-role',
      name: 'Test Role',
      minRate: 10,
      isResourceRole: false,
      permissions: [
        { category: 'System', permissions: [{ id: 6, name: 'SYSTEM_ADMIN', description: 'System Admin', category: 'System', roles: [] }] },
        { category: 'Business Development', permissions: [{ id: 7, name: 'BUSINESS_DEVELOPMENT_CREATE', description: 'Create BD', category: 'Business Development', roles: [] }] },
        { category: 'Project', permissions: [{ id: 8, name: 'PROJECT_DELETE', description: 'Delete Project', category: 'Project', roles: [] }] },
        { category: 'Other', permissions: [{ id: 9, name: 'USER_MANAGEMENT_VIEW', description: 'View Users', category: 'Other', roles: [] }] },
      ],
    };
    mockGetAllRolesWithPermissions.mockResolvedValueOnce([roleWithVariousPermissions]);
    
    const { rerender } = render(<RolesManagement />);
    
    // Wait for the role to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Role')).toBeInTheDocument();
    });

    // Check for the presence of chips
    expect(screen.getByText('System Admin')).toBeInTheDocument();
    expect(screen.getByText('1 Project')).toBeInTheDocument();
    expect(screen.getByText('1 Business')).toBeInTheDocument();
    expect(screen.getByText('1 Other')).toBeInTheDocument();

    // Check tooltips for formatted labels
    const systemAdminChip = screen.getByText('System Admin');
    fireEvent.mouseEnter(systemAdminChip);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('System administrator');
    });
    fireEvent.mouseLeave(systemAdminChip);

    const projectChip = screen.getByText('1 Project');
    fireEvent.mouseEnter(projectChip);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Delete project');
    });
    fireEvent.mouseLeave(projectChip);

    const businessChip = screen.getByText('1 Business');
    fireEvent.mouseEnter(businessChip);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Create business development');
    });
    fireEvent.mouseLeave(businessChip);

    const otherChip = screen.getByText('1 Other');
    fireEvent.mouseEnter(otherChip);
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('User Management View');
    });
    fireEvent.mouseLeave(otherChip);
  });

  // Test 13: Empty roles list
  test('renders correctly with an empty list of roles', async () => {
    mockGetAllRolesWithPermissions.mockResolvedValueOnce([]);
    render(<RolesManagement />);

    await waitFor(async () => {
      await waitFor(() => expect(screen.queryByText('Admin')).not.toBeInTheDocument());
      await waitFor(() => expect(screen.queryByText('Project Manager')).not.toBeInTheDocument());
    });

    expect(screen.getByText('Roles Management')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument(); // Table headers still present
    expect(screen.getByText('Min Rate')).toBeInTheDocument();
    expect(screen.getByText('Resource Role')).toBeInTheDocument();
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  // Test 14: RoleDialog receives correct props for Add
  test('RoleDialog receives correct props when adding a new role', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Add New Role/i }));

    expect(MockRoleDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        onClose: expect.any(Function),
        onSubmit: expect.any(Function),
        editingRole: null,
        roles: mockRoles,
        formData: {
          id: '',
          name: '',
          minRate: 0,
          isResourceRole: false,
          permissions: [],
        },
        setFormData: expect.any(Function),
      }),
      {}
    );
  });

  // Test 15: RoleDialog receives correct props for Edit
  test('RoleDialog receives correct props when editing a role', async () => {
    render(<RolesManagement />);
    await waitFor(() => expect(screen.getByText('Admin')).toBeInTheDocument());

    // Get all buttons in the table
    const allButtons = screen.getAllByRole('button');
    const tableButtons = allButtons.slice(1); // Skip "Add New Role" button
    const editButtons = tableButtons.filter((_, index) => index % 2 === 0); // Even indices are edit buttons
    
    fireEvent.click(editButtons[0]); // Click edit for Admin role

    expect(MockRoleDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        open: true,
        onClose: expect.any(Function),
        onSubmit: expect.any(Function),
        editingRole: mockRoles[0],
        roles: mockRoles,
        formData: {
          id: mockRoles[0].id,
          name: mockRoles[0].name,
          minRate: mockRoles[0].minRate,
          isResourceRole: mockRoles[0].isResourceRole,
          permissions: mockRoles[0].permissions,
        },
        setFormData: expect.any(Function),
      }),
      {}
    );
  });
});




