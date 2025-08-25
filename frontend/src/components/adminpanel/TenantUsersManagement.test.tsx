import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantUsersManagement from './TenantUsersManagement';
import * as tenantApi from '../../services/tenantApi';
import * as userApi from '../../services/userApi';
import { TenantUserRole } from '../../models/tenantModel';

// Mock API calls
jest.mock('../../../src/services/tenantApi');
jest.mock('../../../src/services/userApi');

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
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (tenantApi.getAllTenants as jest.Mock).mockResolvedValue(mockTenants);
    (userApi.getAllUsers as jest.Mock).mockResolvedValue(mockAvailableUsers);
    (tenantApi.getTenantUsers as jest.Mock).mockResolvedValue(mockTenantUsers);
    (tenantApi.addTenantUser as jest.Mock).mockResolvedValue({});
    (tenantApi.updateTenantUser as jest.Mock).mockResolvedValue({});
    (tenantApi.removeTenantUser as jest.Mock).mockResolvedValue({});
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

    // Check if tenant selection is rendered
    expect(screen.getByLabelText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('Tenant A')).toBeInTheDocument();

    // Check if selected tenant info is displayed
    expect(screen.getByText('Company A')).toBeInTheDocument();
    expect(screen.getByText('Domain: tenantA.localhost')).toBeInTheDocument();

    // Check if tenant users are displayed
    expect(screen.getByText('Tenant Users (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('displays "No users assigned" message when no tenant users are found', async () => {
    (tenantApi.getTenantUsers as jest.Mock).mockResolvedValue([]); // Mock no tenant users
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(tenantApi.getTenantUsers).toHaveBeenCalledWith(mockTenants[0].id);
    });

    expect(screen.getByText('No users assigned to this tenant')).toBeInTheDocument();
  });

  it('handles tenant selection change', async () => {
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1);
    });

    // Select Tenant B
    fireEvent.mouseDown(screen.getByLabelText('Tenant'));
    fireEvent.click(screen.getByText('Tenant B'));

    await waitFor(() => {
      expect(tenantApi.getTenantUsers).toHaveBeenCalledWith(mockTenants[1].id);
    });

    expect(screen.getByText('Company B')).toBeInTheDocument();
    expect(screen.getByText('Domain: tenantB.localhost')).toBeInTheDocument();
  });

  it('opens and closes the Add User dialog', async () => {
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Add User to Tenant/i }));

    expect(screen.getByText('Add User to Tenant')).toBeInTheDocument();
    expect(screen.getByLabelText('Select User')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(screen.getByLabelText('Status')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText('Add User to Tenant')).not.toBeInTheDocument();
  });

  it('adds a new tenant user', async () => {
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Add User to Tenant/i }));

    // Select a user
    fireEvent.mouseDown(screen.getByLabelText('Select User'));
    fireEvent.click(screen.getByText('John Doe'));

    // Select a role (e.g., Manager)
    fireEvent.mouseDown(screen.getByLabelText('Role'));
    fireEvent.click(screen.getByText('Manager'));

    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

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
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Click edit icon for John Doe
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    expect(screen.getByText('Edit Tenant User')).toBeInTheDocument();
    expect(screen.queryByLabelText('Select User')).not.toBeInTheDocument(); // Should not be present when editing
    expect(screen.getByLabelText('Role')).toHaveTextContent('Admin');
    expect(screen.getByLabelText('Status')).toHaveTextContent('Active');
  });

  it('updates an existing tenant user', async () => {
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Click edit icon for John Doe
    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    // Change role to Owner
    fireEvent.mouseDown(screen.getByLabelText('Role'));
    fireEvent.click(screen.getByText('Owner'));

    // Change status to Inactive
    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Inactive'));

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

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
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    // Click delete icon for John Doe
    const deleteButtons = screen.getAllByLabelText('Remove from tenant');
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this user from the tenant?');

    await waitFor(() => {
      expect(tenantApi.removeTenantUser).toHaveBeenCalledWith(mockTenantUsers[0].id);
      expect(tenantApi.getTenantUsers).toHaveBeenCalledTimes(2); // Initial load + after remove
      expect(screen.getByText('Tenant user removed successfully')).toBeInTheDocument();
    });
  });

  it('displays error alert if loading tenants fails', async () => {
    (tenantApi.getAllTenants as jest.Mock).mockRejectedValue(new Error('Failed to fetch tenants'));
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tenants')).toBeInTheDocument();
    });
  });

  it('displays error alert if loading tenant users fails', async () => {
    (tenantApi.getTenantUsers as jest.Mock).mockRejectedValue(new Error('Failed to fetch tenant users'));
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tenant users')).toBeInTheDocument();
    });
  });

  it('displays error alert if adding tenant user fails', async () => {
    (tenantApi.addTenantUser as jest.Mock).mockRejectedValue(new Error('Failed to add user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Add User to Tenant/i }));

    fireEvent.mouseDown(screen.getByLabelText('Select User'));
    fireEvent.click(screen.getByText('John Doe'));

    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save tenant user')).toBeInTheDocument();
    });
  });

  it('displays error alert if updating tenant user fails', async () => {
    (tenantApi.updateTenantUser as jest.Mock).mockRejectedValue(new Error('Failed to update user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    const editButtons = screen.getAllByLabelText('Edit');
    fireEvent.click(editButtons[0]);

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save tenant user')).toBeInTheDocument();
    });
  });

  it('displays error alert if removing tenant user fails', async () => {
    (tenantApi.removeTenantUser as jest.Mock).mockRejectedValue(new Error('Failed to remove user'));
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    window.confirm = jest.fn(() => true);

    const deleteButtons = screen.getAllByLabelText('Remove from tenant');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to remove tenant user')).toBeInTheDocument();
    });
  });

  it('closes success alert when close button is clicked', async () => {
    render(<TenantUsersManagement />);

    await waitFor(() => expect(tenantApi.getAllTenants).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: /Add User to Tenant/i }));

    fireEvent.mouseDown(screen.getByLabelText('Select User'));
    fireEvent.click(screen.getByText('John Doe'));

    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
      expect(screen.getByText('Tenant user added successfully')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Tenant user added successfully')).not.toBeInTheDocument();
  });

  it('closes error alert when close button is clicked', async () => {
    (tenantApi.getAllTenants as jest.Mock).mockRejectedValue(new Error('Failed to fetch tenants'));
    render(<TenantUsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tenants')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText('Close'));
    expect(screen.queryByText('Failed to load tenants')).not.toBeInTheDocument();
  });
});
