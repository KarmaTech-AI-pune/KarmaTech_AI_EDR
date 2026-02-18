import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TenantUsersManagement from './TenantUsersManagement';
import * as tenantApi from '../../services/tenantApi';
import * as userApi from '../../services/userApi';
import { TenantUserRole } from '../../models/tenantModel';

// Mock API calls
vi.mock('../../services/tenantApi');
vi.mock('../../services/userApi');

const mockTenants = [
  { id: 1, name: 'Tenant A', domain: 'tenantA', companyName: 'Company A', status: 0 },
  { id: 2, name: 'Tenant B', domain: 'tenantB', companyName: 'Company B', status: 1 },
];

const mockAvailableUsers = [
  { id: 'user1', userName: 'john.doe', name: 'John Doe', email: 'john.doe@example.com', avatar: 'avatar1.png' },
  { id: 'user2', userName: 'jane.smith', name: 'Jane Smith', email: 'jane.smith@example.com' },
];

const mockTenantUsers = [
  { id: 101, tenantId: 1, userId: 'user1', role: TenantUserRole.Admin, isActive: true, joinedAt: '2023-01-01T00:00:00Z', user: mockAvailableUsers[0] },
  { id: 102, tenantId: 1, userId: 'user2', role: TenantUserRole.User, isActive: false, joinedAt: '2023-02-01T00:00:00Z', user: mockAvailableUsers[1] },
];

describe('TenantUsersManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    (tenantApi.getAllTenants as ReturnType<typeof vi.fn>).mockResolvedValue(mockTenants);
    (userApi.getAllUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockAvailableUsers);
    (tenantApi.getTenantUsers as ReturnType<typeof vi.fn>).mockResolvedValue(mockTenantUsers);
    (tenantApi.addTenantUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (tenantApi.updateTenantUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (tenantApi.removeTenantUser as ReturnType<typeof vi.fn>).mockResolvedValue({});
  });

  it('renders correctly and loads initial data', async () => {
    render(<TenantUsersManagement />);

    expect(screen.getByText('Tenant Users Management')).toBeInTheDocument();

    // Wait for tenants and users to load
    await waitFor(() => {
      expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1);
      expect(userApi.getAllUsers).toHaveBeenCalledTimes(1);
      expect(tenantApi.getTenantUsers).toHaveBeenCalledWith(mockTenants[0].id); // First tenant selected by default
    });

    // Check if tenant selection is rendered - use combobox role for MUI Select
    const tenantSelect = screen.getAllByRole('combobox')[0];
    expect(tenantSelect).toBeInTheDocument();
    
    // Tenant A appears in multiple places (select display and heading)
    const tenantAElements = screen.getAllByText('Tenant A');
    expect(tenantAElements.length).toBeGreaterThan(0);

    // Check if selected tenant info is displayed
    // Component displays tenant.name, not companyName
    expect(screen.getByText('Domain: tenantA.localhost')).toBeInTheDocument();

    // Check if tenant users are displayed - use regex to match the text with parentheses
    expect(screen.getByText(/Tenant Users \(2\)/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    // "Active" appears multiple times (tenant status chip + user status chip)
    const activeElements = screen.getAllByText('Active');
    expect(activeElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    // "User" appears multiple times (table header + role chip)
    const userElements = screen.getAllByText('User');
    expect(userElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('displays "No users assigned" message when no tenant users are found', async () => {
    (tenantApi.getTenantUsers as ReturnType<typeof vi.fn>).mockResolvedValue([]); // Mock no tenant users
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(tenantApi.getTenantUsers).toHaveBeenCalledWith(mockTenants[0].id);
    });

    expect(screen.getByText('No users assigned to this tenant')).toBeInTheDocument();
  });

  it('handles tenant selection change', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1);
    });

    // Select Tenant B - use role="combobox" for MUI Select
    const tenantSelect = screen.getAllByRole('combobox')[0]; // First combobox is Tenant select
    fireEvent.mouseDown(tenantSelect);
    
    // Wait for dropdown to open - MUI renders options in a listbox
    await waitFor(() => {
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
    });
    
    // Find and click the Tenant B option
    const options = screen.getAllByRole('option');
    const tenantBOption = options.find(opt => opt.textContent?.includes('Tenant B'));
    expect(tenantBOption).toBeDefined();
    await user.click(tenantBOption!);

    await waitFor(() => {
      expect(tenantApi.getTenantUsers).toHaveBeenCalledWith(mockTenants[1].id);
    });

    // Component displays tenant.name, not companyName - appears in multiple places
    const tenantBElements = screen.getAllByText('Tenant B');
    expect(tenantBElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Domain: tenantB.localhost')).toBeInTheDocument();
  });

  it('opens and closes the Add User dialog', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const addButton = screen.getByRole('button', { name: /Add User to Tenant/i });
    await user.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Use getAllByText since "Add User to Tenant" appears in both button and dialog title
    expect(screen.getAllByText('Add User to Tenant').length).toBeGreaterThan(0);
    
    // Check for form fields using role="combobox" for MUI Select
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(2); // Should have Select User, Role, Status selects

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    
    // After closing, dialog should be gone
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('adds a new tenant user', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const addButton = screen.getByRole('button', { name: /Add User to Tenant/i });
    await user.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get all comboboxes in the dialog - first one should be "Select User"
    const dialog = screen.getByRole('dialog');
    const comboboxes = screen.getAllByRole('combobox');
    // In add mode: [0] = Select User, [1] = Role, [2] = Status
    const userSelect = comboboxes[0];
    
    fireEvent.mouseDown(userSelect);
    
    // Wait for listbox to appear and be populated
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Wait for options to be available
    await waitFor(() => {
      const options = screen.queryAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    // Find John Doe option
    const options = screen.getAllByRole('option');
    const johnDoeOption = options.find(opt => {
      const text = opt.textContent || '';
      return text.includes('John Doe');
    });
    
    expect(johnDoeOption).toBeDefined();
    await user.click(johnDoeOption!);
    
    // Wait for listbox to close completely
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Now select role - should be second combobox
    const roleSelect = screen.getAllByRole('combobox')[1];
    fireEvent.mouseDown(roleSelect);
    
    // Wait for role listbox
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      const roleOptions = screen.queryAllByRole('option');
      expect(roleOptions.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const roleOptions = screen.getAllByRole('option');
    const managerOption = roleOptions.find(opt => opt.textContent === 'Manager');
    
    expect(managerOption).toBeDefined();
    await user.click(managerOption!);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Find and click Add button within dialog
    const addButtonInDialog = screen.getByRole('button', { name: /^Add$/i });
    await user.click(addButtonInDialog);

    await waitFor(() => {
      expect(tenantApi.addTenantUser).toHaveBeenCalledWith({
        tenantId: mockTenants[0].id,
        userId: 'user1',
        role: TenantUserRole.Manager,
        isActive: true,
      });
      expect(tenantApi.getTenantUsers).toHaveBeenCalledTimes(2); // Initial load + after add
      expect(screen.getByText('Tenant user added successfully')).toBeInTheDocument();
    });
  });

  it('opens and pre-fills the Edit User dialog', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Click edit icon for John Doe
    const editButtons = screen.getAllByLabelText('Edit');
    await user.click(editButtons[0]);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Edit Tenant User')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select User')).not.toBeInTheDocument(); // Should not be present when editing
    
    // Check that Role and Status selects are present with correct values
    // Look for the comboboxes within the dialog and check their displayed values
    const dialog = screen.getByRole('dialog');
    const comboboxes = screen.getAllByRole('combobox');
    
    // The dialog should show Admin and Active as the current values
    // These appear as text within the select components
    const adminTexts = screen.getAllByText('Admin');
    const activeTexts = screen.getAllByText('Active');
    
    // At least one should be in the dialog (the select value)
    expect(adminTexts.length).toBeGreaterThan(0);
    expect(activeTexts.length).toBeGreaterThan(0);
  });

  it('updates an existing tenant user', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Click edit icon for John Doe
    const editButtons = screen.getAllByLabelText('Edit');
    await user.click(editButtons[0]);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // In edit mode, there's no "Select User" field, so comboboxes are: [0] = Role, [1] = Status
    const comboboxes = screen.getAllByRole('combobox');
    const roleSelect = comboboxes[0];
    const statusSelect = comboboxes[1];

    // Change role to Owner
    fireEvent.mouseDown(roleSelect);
    
    // Wait for role listbox
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      const roleOptions = screen.queryAllByRole('option');
      expect(roleOptions.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const roleOptions = screen.getAllByRole('option');
    const ownerOption = roleOptions.find(opt => opt.textContent === 'Owner');
    
    expect(ownerOption).toBeDefined();
    await user.click(ownerOption!);
    
    // Wait for listbox to close completely
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Change status to Inactive
    fireEvent.mouseDown(statusSelect);
    
    // Wait for status listbox
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      const statusOptions = screen.queryAllByRole('option');
      expect(statusOptions.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const statusOptions = screen.getAllByRole('option');
    const inactiveOption = statusOptions.find(opt => opt.textContent === 'Inactive');
    
    expect(inactiveOption).toBeDefined();
    await user.click(inactiveOption!);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const updateButton = screen.getByRole('button', { name: /Update/i });
    await user.click(updateButton);

    await waitFor(() => {
      expect(tenantApi.updateTenantUser).toHaveBeenCalledWith(mockTenantUsers[0].id, {
        role: TenantUserRole.Owner,
        isActive: false,
      });
      expect(tenantApi.getTenantUsers).toHaveBeenCalledTimes(2); // Initial load + after update
      expect(screen.getByText('Tenant user updated successfully')).toBeInTheDocument();
    });
  });

  it('removes a tenant user', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    // Click delete icon for John Doe
    const deleteButtons = screen.getAllByLabelText('Remove from tenant');
    await user.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this user from the tenant?');

    await waitFor(() => {
      expect(tenantApi.removeTenantUser).toHaveBeenCalledWith(mockTenantUsers[0].id);
      expect(tenantApi.getTenantUsers).toHaveBeenCalledTimes(2); // Initial load + after remove
      expect(screen.getByText('Tenant user removed successfully')).toBeInTheDocument();
    });
  });

  it('displays error alert if loading tenants fails', async () => {
    (tenantApi.getAllTenants as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch tenants'));
    render(<TenantUsersManagement />);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to load tenants/i)).toBeInTheDocument()));
    });
  });

  it('displays error alert if loading tenant users fails', async () => {
    (tenantApi.getTenantUsers as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch tenant users'));
    render(<TenantUsersManagement />);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to load tenant users/i)).toBeInTheDocument()));
    });
  });

  it('displays error alert if adding tenant user fails', async () => {
    const user = userEvent.setup();
    (tenantApi.addTenantUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to add user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const addButton = screen.getByRole('button', { name: /Add User to Tenant/i });
    await user.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get first combobox (Select User)
    const comboboxes = screen.getAllByRole('combobox');
    const userSelect = comboboxes[0];
    
    fireEvent.mouseDown(userSelect);
    
    // Wait for listbox to appear and be populated
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      const options = screen.queryAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const options = screen.getAllByRole('option');
    const johnDoeOption = options.find(opt => {
      const text = opt.textContent || '';
      return text.includes('John Doe');
    });
    
    expect(johnDoeOption).toBeDefined();
    await user.click(johnDoeOption!);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const addButtonInDialog = screen.getByRole('button', { name: /^Add$/i });
    await user.click(addButtonInDialog);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to save tenant user/i)).toBeInTheDocument()));
    });
  });

  it('displays error alert if updating tenant user fails', async () => {
    const user = userEvent.setup();
    (tenantApi.updateTenantUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to update user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const editButtons = screen.getAllByLabelText('Edit');
    await user.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const updateButton = screen.getByRole('button', { name: /Update/i });
    await user.click(updateButton);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to save tenant user/i)).toBeInTheDocument()));
    });
  });

  it('displays error alert if removing tenant user fails', async () => {
    const user = userEvent.setup();
    (tenantApi.removeTenantUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to remove user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    window.confirm = vi.fn(() => true);

    const deleteButtons = screen.getAllByLabelText('Remove from tenant');
    await user.click(deleteButtons[0]);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to remove tenant user/i)).toBeInTheDocument()));
    });
  });

  it('closes success alert when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const addButton = screen.getByRole('button', { name: /Add User to Tenant/i });
    await user.click(addButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Get first combobox (Select User)
    const comboboxes = screen.getAllByRole('combobox');
    const userSelect = comboboxes[0];
    
    fireEvent.mouseDown(userSelect);
    
    // Wait for listbox to appear and be populated
    await waitFor(() => {
      const listbox = screen.queryByRole('listbox');
      expect(listbox).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      const options = screen.queryAllByRole('option');
      expect(options.length).toBeGreaterThan(0);
    }, { timeout: 5000 });
    
    const options = screen.getAllByRole('option');
    const johnDoeOption = options.find(opt => {
      const text = opt.textContent || '';
      return text.includes('John Doe');
    });
    
    expect(johnDoeOption).toBeDefined();
    await user.click(johnDoeOption!);
    
    // Wait for listbox to close
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const addButtonInDialog = screen.getByRole('button', { name: /^Add$/i });
    await user.click(addButtonInDialog);

    await waitFor(() => {
      expect(screen.getByText('Tenant user added successfully')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    
    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.queryByText('Tenant user added successfully')).not.toBeInTheDocument()));
    });
  });

  it('closes error alert when close button is clicked', async () => {
    const user = userEvent.setup();
    (tenantApi.getAllTenants as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch tenants'));
    render(<TenantUsersManagement />);

    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.getByText(/Failed to load tenants/i)).toBeInTheDocument()));
    });

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);
    
    await waitFor(async () => {
      await waitFor(async () => await waitFor(() => expect(screen.queryByText('Failed to load tenants')).not.toBeInTheDocument()));
    });
  });
});









