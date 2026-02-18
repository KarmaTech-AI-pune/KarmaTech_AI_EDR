import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import TenantManagement from './TenantManagement';
import * as tenantApi from '../../services/tenantApi';
import * as subscriptionApi from '../../services/subscriptionApi';
import { Tenant, TenantStatus } from '../../models/tenantModel';

// Mock API and Components
vi.mock('../../services/tenantApi');
vi.mock('../../services/subscriptionApi');
vi.mock('../forms/FormField', () => ({
    default: ({ label, name }: any) => (
        <div>
            <label htmlFor={name}>{label}</label>
            <input id={name} name={name} aria-label={label} />
        </div>
    )
}));

// Mock MUI Dialog to be simple
vi.mock('@mui/material', async (importActual) => {
    const actual = await importActual<any>();
    return {
        ...actual,
        Dialog: ({ open, children }: any) => open ? <div role="dialog">{children}</div> : null,
    };
});

const mockTenantApi = vi.mocked(tenantApi);
const mockSubscriptionApi = vi.mocked(subscriptionApi);

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
    tenantUsers: [],
    subscriptionPlanId: 1,
    isIsolated: false,
  },
];

describe('TenantManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    beforeEach(() => {
        vi.clearAllMocks();
        mockTenantApi.getAllTenants.mockResolvedValue(mockTenants);
        mockSubscriptionApi.getSubscriptionPlans.mockResolvedValue([]);
        vi.spyOn(window, 'confirm').mockReturnValue(true);
    });

    it('renders and displays tenant data', async () => {
        render(<TenantManagement />);
        expect(await screen.findByText(/Tenant Management/i)).toBeInTheDocument();
        expect(await screen.findByText('Tenant Alpha')).toBeInTheDocument();
    });

    it('opens add tenant dialog', async () => {
        const user = userEvent.setup();
        render(<TenantManagement />);
        await user.click(screen.getByText(/Add Tenant/i));
        // Heading is "Add New Tenant"
        expect(await screen.findByText(/Add New Tenant/i)).toBeInTheDocument();
    });

    it('handles delete button click', async () => {
        const user = userEvent.setup();
        mockTenantApi.deleteTenant.mockResolvedValue(undefined);
        render(<TenantManagement />);
        await screen.findByText('Tenant Alpha');
        
        const deleteBtns = screen.getAllByLabelText('delete');
        await user.click(deleteBtns[0]);
        
        expect(window.confirm).toHaveBeenCalled();
        expect(mockTenantApi.deleteTenant).toHaveBeenCalledWith(1);
    });
});


