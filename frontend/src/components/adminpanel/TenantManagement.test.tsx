import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TenantManagement from './TenantManagement';
import * as tenantApi from '../../services/tenantApi';
import * as subscriptionApi from '../../services/subscriptionApi';
import { Tenant, TenantStatus } from '../../models/tenantModel';
import { SubscriptionPlan } from '../../models/subscriptionModel';

// Mock API services
vi.mock('../../services/tenantApi');
vi.mock('../../services/subscriptionApi');

const mockTenantApi = tenantApi as jest.Mocked<typeof tenantApi>;
const mockSubscriptionApi = subscriptionApi as jest.Mocked<typeof subscriptionApi>;

const mockTenants: Tenant[] = [
  {
    id: 1,
    name: 'Tenant Alpha',
    domain: 'alpha',
    companyName: 'Alpha Corp',
    contactEmail: 'contact@alpha.com',
    contactPhone: '111-222-3333',
    status: TenantStatus.Active,
    createdAt: '2023-01-01T00:00:00Z',
    maxUsers: 10,
    maxProjects: 50,
    isActive: true,
    tenantUsers: [{ id: 101, tenantId: 1, userId: 'user1', role: 0, joinedAt: '2023-01-01T00:00:00Z', isActive: true }],
    subscriptionPlanId: 1,
    subscriptionPlan: {
      id: 1, name: 'Basic', monthlyPrice: 100, yearlyPrice: 1000, maxUsers: 10, maxProjects: 50, maxStorageGB: 100, isActive: true,
      features: { advancedReporting: true, customBranding: false, apiAccess: false, prioritySupport: false, whiteLabel: false, sso: false }
    },
  },
  {
    id: 2,
    name: 'Tenant Beta',
    domain: 'beta',
    companyName: 'Beta Inc',
    contactEmail: 'contact@beta.com',
    contactPhone: '444-555-6666',
    status: TenantStatus.Trial,
    createdAt: '2023-02-01T00:00:00Z',
    maxUsers: 5,
    maxProjects: 20,
    isActive: true,
    tenantUsers: [],
    subscriptionPlanId: 2,
    subscriptionPlan: {
      id: 2, name: 'Pro', monthlyPrice: 200, yearlyPrice: 2000, maxUsers: 20, maxProjects: 100, maxStorageGB: 500, isActive: true,
      features: { advancedReporting: true, customBranding: true, apiAccess: true, prioritySupport: true, whiteLabel: false, sso: false }
    },
  },
];

const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 1, name: 'Basic', monthlyPrice: 100, yearlyPrice: 1000, maxUsers: 10, maxProjects: 50, maxStorageGB: 100, isActive: true,
    features: { advancedReporting: true, customBranding: false, apiAccess: false, prioritySupport: false, whiteLabel: false, sso: false }
  },
  {
    id: 2, name: 'Pro', monthlyPrice: 200, yearlyPrice: 2000, maxUsers: 20, maxProjects: 100, maxStorageGB: 500, isActive: true,
    features: { advancedReporting: true, customBranding: true, apiAccess: true, prioritySupport: true, whiteLabel: false, sso: false }
  },
  {
    id: 3, name: 'Enterprise', monthlyPrice: 500, yearlyPrice: 5000, maxUsers: 100, maxProjects: 500, maxStorageGB: 2000, isActive: true,
    features: { advancedReporting: true, customBranding: true, apiAccess: true, prioritySupport: true, whiteLabel: true, sso: true }
  },
];

describe('TenantManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTenantApi.getAllTenants.mockResolvedValue(mockTenants);
    mockSubscriptionApi.getSubscriptionPlans.mockResolvedValue(mockSubscriptionPlans);
    // Mock window.confirm for delete operations
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Renders correctly and displays tenant data
  test('renders TenantManagement and displays tenant data', async () => {
    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Management')).toBeInTheDocument();
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
      expect(screen.getByText('Tenant Beta')).toBeInTheDocument();
      expect(screen.getByText('Alpha Corp')).toBeInTheDocument();
      expect(screen.getByText('Beta Inc')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Total Tenants')).toBeInTheDocument();
      expect(screen.getByText('Active Tenants')).toBeInTheDocument();
      expect(screen.getByText('Trial Tenants')).toBeInTheDocument();
      expect(screen.getByText('Suspended Tenants')).toBeInTheDocument();
    });

    expect(mockTenantApi.getAllTenants).toHaveBeenCalledTimes(1);
    expect(mockSubscriptionApi.getSubscriptionPlans).toHaveBeenCalledTimes(1);
  });

  // Test 2: Handles "Add Tenant" button click and opens dialog
  test('opens add tenant dialog when "Add Tenant" button is clicked', async () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Tenant')).toBeInTheDocument();
      expect(screen.getByLabelText('Tenant Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Domain')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
    });
  });

  // Test 3: Handles new tenant creation
  test('creates a new tenant successfully', async () => {
    const newTenant: Tenant = {
      id: 3,
      name: 'Tenant Gamma',
      domain: 'gamma',
      companyName: 'Gamma Ltd',
      contactEmail: 'contact@gamma.com',
      contactPhone: '777-888-9999',
      status: TenantStatus.Active,
      createdAt: '2023-03-01T00:00:00Z',
      maxUsers: 15,
      maxProjects: 75,
      isActive: true,
      tenantUsers: [],
      subscriptionPlanId: 3,
      subscriptionPlan: mockSubscriptionPlans[2],
    };
    mockTenantApi.createTenant.mockResolvedValue(newTenant);

    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));

    fireEvent.change(screen.getByLabelText('Tenant Name'), { target: { value: 'Tenant Gamma' } });
    fireEvent.change(screen.getByLabelText('Domain'), { target: { value: 'gamma' } });
    fireEvent.change(screen.getByLabelText('Company Name'), { target: { value: 'Gamma Ltd' } });
    fireEvent.change(screen.getByLabelText('Contact Email'), { target: { value: 'contact@gamma.com' } });
    fireEvent.change(screen.getByLabelText('Contact Phone'), { target: { value: '777-888-9999' } });
    fireEvent.change(screen.getByLabelText('Max Users'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Max Projects'), { target: { value: '75' } });

    fireEvent.mouseDown(screen.getByLabelText('Subscription Plan'));
    fireEvent.click(screen.getByText('Enterprise - $500/month'));

    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Active'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockTenantApi.createTenant).toHaveBeenCalledWith({
        id: 0,
        name: 'Tenant Gamma',
        domain: 'gamma',
        companyName: 'Gamma Ltd',
        contactEmail: 'contact@gamma.com',
        contactPhone: '777-888-9999',
        subscriptionPlanId: 3,
        maxUsers: 15,
        maxProjects: 75,
        status: TenantStatus.Active,
      });
    });
    expect(mockTenantApi.getAllTenants).toHaveBeenCalledTimes(2); // Initial load + after creation
    expect(screen.queryByText('Add New Tenant')).not.toBeInTheDocument(); // Dialog closed
  });

  // Test 4: Handles tenant update
  test('updates an existing tenant successfully', async () => {
    const updatedTenant: Tenant = { ...mockTenants[0], name: 'Tenant Alpha Updated' };
    mockTenantApi.updateTenant.mockResolvedValue(updatedTenant);

    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('edit')[0]); // Click edit for Tenant Alpha

    await waitFor(() => {
      expect(screen.getByText('Edit Tenant')).toBeInTheDocument();
      expect(screen.getByLabelText('Tenant Name')).toHaveValue('Tenant Alpha');
    });

    fireEvent.change(screen.getByLabelText('Tenant Name'), { target: { value: 'Tenant Alpha Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(mockTenantApi.updateTenant).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ name: 'Tenant Alpha Updated' })
      );
    });
    expect(mockTenantApi.getAllTenants).toHaveBeenCalledTimes(2); // Initial load + after update
    expect(screen.queryByText('Edit Tenant')).not.toBeInTheDocument(); // Dialog closed
  });

  // Test 5: Handles tenant deletion
  test('deletes a tenant successfully', async () => {
    mockTenantApi.deleteTenant.mockResolvedValue(undefined); // Mock successful deletion

    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('delete')[0]); // Click delete for Tenant Alpha

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this tenant? This action cannot be undone.');
      expect(mockTenantApi.deleteTenant).toHaveBeenCalledWith(1);
    });
    expect(mockTenantApi.getAllTenants).toHaveBeenCalledTimes(2); // Initial load + after deletion
  });

  // Test 6: Displays error message on tenant fetch failure
  test('displays error message if tenants fail to load', async () => {
    mockTenantApi.getAllTenants.mockRejectedValue(new Error('Failed to fetch'));
    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tenants')).toBeInTheDocument();
    });
  });

  // Test 7: Displays error message on tenant creation failure
  test('displays error message if tenant creation fails', async () => {
    mockTenantApi.createTenant.mockRejectedValue(new Error('Creation failed'));
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));
    fireEvent.change(screen.getByLabelText('Tenant Name'), { target: { value: 'Tenant Gamma' } });
    fireEvent.change(screen.getByLabelText('Domain'), { target: { value: 'gamma' } });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save tenant')).toBeInTheDocument();
    });
  });

  // Test 8: Displays error message on tenant update failure
  test('displays error message if tenant update fails', async () => {
    mockTenantApi.updateTenant.mockRejectedValue(new Error('Update failed'));
    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('edit')[0]);
    fireEvent.change(screen.getByLabelText('Tenant Name'), { target: { value: 'Tenant Alpha Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save tenant')).toBeInTheDocument();
    });
  });

  // Test 9: Displays error message on tenant deletion failure
  test('displays error message if tenant deletion fails', async () => {
    mockTenantApi.deleteTenant.mockRejectedValue(new Error('Deletion failed'));
    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('delete')[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete tenant')).toBeInTheDocument();
    });
  });

  // Test 10: Handles cancel button in dialog
  test('closes the dialog when cancel button is clicked', async () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));
    await waitFor(() => {
      expect(screen.getByText('Add New Tenant')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText('Add New Tenant')).not.toBeInTheDocument();
  });

  // Test 11: Correctly displays tenant status chips
  test('displays correct status chips for tenants', async () => {
    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('✓ Active')).toBeInTheDocument();
      expect(screen.getByText('⏳ Trial')).toBeInTheDocument();
    });
  });

  // Test 12: Navigation to Tenant Users Management
  test('navigates to tenant users management when GroupIcon is clicked', async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });

    render(<TenantManagement />);

    await waitFor(() => {
      expect(screen.getByText('Tenant Alpha')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('Manage Users')[0]); // Click GroupIcon for Tenant Alpha

    expect(window.location.href).toBe('/admin?section=tenantUsers&tenantId=1');

    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
  });

  // Test 13: Max Users and Max Projects input fields
  test('max users and max projects input fields handle changes', async () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));

    const maxUsersInput = screen.getByLabelText('Max Users');
    const maxProjectsInput = screen.getByLabelText('Max Projects');

    fireEvent.change(maxUsersInput, { target: { value: '25' } });
    fireEvent.change(maxProjectsInput, { target: { value: '120' } });

    expect(maxUsersInput).toHaveValue(25);
    expect(maxProjectsInput).toHaveValue(120);
  });

  // Test 14: Subscription plan selection updates form data
  test('subscription plan selection updates form data', async () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));

    fireEvent.mouseDown(screen.getByLabelText('Subscription Plan'));
    fireEvent.click(screen.getByText('Pro - $200/month'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockTenantApi.createTenant).toHaveBeenCalledWith(
        expect.objectContaining({ subscriptionPlanId: 2 })
      );
    });
  });

  // Test 15: Status selection updates form data
  test('status selection updates form data', async () => {
    render(<TenantManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Tenant/i }));

    fireEvent.mouseDown(screen.getByLabelText('Status'));
    fireEvent.click(screen.getByText('Suspended'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockTenantApi.createTenant).toHaveBeenCalledWith(
        expect.objectContaining({ status: TenantStatus.Suspended })
      );
    });
  });
});
