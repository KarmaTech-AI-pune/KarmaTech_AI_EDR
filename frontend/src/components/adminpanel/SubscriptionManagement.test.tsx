import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest'; // Import vi from vitest
import SubscriptionManagement from './SubscriptionManagement';
import * as subscriptionApi from '../../services/subscriptionApi';
import { SubscriptionPlan } from '../../models/subscriptionModel';

// Mock the API service
vi.mock('../../services/subscriptionApi');

const mockGetSubscriptionPlans = vi.spyOn(subscriptionApi, 'getSubscriptionPlans');
const mockCreateSubscriptionPlan = vi.spyOn(subscriptionApi, 'createSubscriptionPlan');
const mockUpdateSubscriptionPlan = vi.spyOn(subscriptionApi, 'updateSubscriptionPlan');
const mockDeleteSubscriptionPlan = vi.spyOn(subscriptionApi, 'deleteSubscriptionPlan');

const mockPlans: SubscriptionPlan[] = [
  {
    id: 1,
    name: 'Basic Plan',
    description: 'A basic subscription plan',
    monthlyPrice: 10,
    yearlyPrice: 100,
    maxUsers: 5,
    maxProjects: 20,
    maxStorageGB: 5,
    features: {
      advancedReporting: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
      sso: false,
    },
    isActive: true,
    tenants: [{ id: 101, name: 'Tenant A' }],
  },
  {
    id: 2,
    name: 'Pro Plan',
    description: 'A professional subscription plan',
    monthlyPrice: 25,
    yearlyPrice: 250,
    maxUsers: 20,
    maxProjects: 100,
    maxStorageGB: 50,
    features: {
      advancedReporting: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: true,
      whiteLabel: false,
      sso: false,
    },
    isActive: true,
    tenants: [{ id: 102, name: 'Tenant B' }, { id: 103, name: 'Tenant C' }],
  },
];

describe('SubscriptionManagement', () => {
  beforeEach(() => {
    mockGetSubscriptionPlans.mockClear();
    mockCreateSubscriptionPlan.mockClear();
    mockUpdateSubscriptionPlan.mockClear();
    mockDeleteSubscriptionPlan.mockClear();
    // Default mock implementation for getSubscriptionPlans
    mockGetSubscriptionPlans.mockResolvedValue(mockPlans);
    vi.spyOn(window, 'confirm').mockReturnValue(true); // Mock window.confirm for delete tests
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Test 1: Initial render and loading of plans
  test('renders subscription plans and summary cards on initial load', async () => {
    render(<SubscriptionManagement />);

    // Check for main heading
    expect(screen.getByText('Subscription Plans')).toBeInTheDocument();

    // Check if API call was made
    expect(mockGetSubscriptionPlans).toHaveBeenCalledTimes(1);

    // Wait for plans to load and appear in the document
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText('Total Plans')).toBeInTheDocument();
    expect(screen.getByText(mockPlans.length.toString())).toBeInTheDocument(); // Total Plans
    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getByText(mockPlans.filter(p => p.isActive).length.toString())).toBeInTheDocument(); // Active Plans
    expect(screen.getByText('Total Subscribers')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Total Subscribers (1 + 2)
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('$60')).toBeInTheDocument(); // (10*1) + (25*2) = 10 + 50 = 60
  });

  // Test 2: Error handling during initial load
  test('displays error alert if loading plans fails', async () => {
    mockGetSubscriptionPlans.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to load subscription plans');
    });
  });

  // Test 3: Add New Plan - Dialog opens and closes
  test('opens and closes the Add New Plan dialog', async () => {
    render(<SubscriptionManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));
    expect(screen.getByRole('dialog', { name: /Add New Subscription Plan/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /Add New Subscription Plan/i })).not.toBeInTheDocument();
    });
  });

  // Test 4: Add New Plan - Successful creation
  test('successfully creates a new subscription plan', async () => {
    render(<SubscriptionManagement />);
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    // Fill the form
    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'New Plan' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New plan description' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Yearly Price \(\$\)/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/Max Users/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Max Projects/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Max Storage \(GB\)/i), { target: { value: '100' } });
    fireEvent.click(screen.getByLabelText(/Advanced Reporting/i)); // Toggle a feature

    mockCreateSubscriptionPlan.mockResolvedValueOnce({
      id: 3,
      name: 'New Plan',
      description: 'New plan description',
      monthlyPrice: 30,
      yearlyPrice: 300,
      maxUsers: 50,
      maxProjects: 200,
      maxStorageGB: 100,
      features: {
        advancedReporting: true,
        customBranding: false,
        apiAccess: false,
        prioritySupport: false,
        whiteLabel: false,
        sso: false,
      },
      isActive: true,
      tenants: [],
    });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(mockCreateSubscriptionPlan).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Plan',
        monthlyPrice: 30,
        maxUsers: 50,
        features: expect.objectContaining({ advancedReporting: true }),
      }));
      expect(mockGetSubscriptionPlans).toHaveBeenCalledTimes(2); // Called again after creation
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Dialog closes
    });
  });

  // Test 5: Add New Plan - Error during creation
  test('displays error alert if creating a plan fails', async () => {
    render(<SubscriptionManagement />);
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Failing Plan' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Users/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Projects/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Storage \(GB\)/i), { target: { value: '10' } });

    mockCreateSubscriptionPlan.mockRejectedValueOnce(new Error('Creation failed'));

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to save subscription plan');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // Dialog remains open on error
  });

  // Test 6: Edit Plan - Dialog opens with pre-filled data
  test('opens the Edit Subscription Plan dialog with pre-filled data', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]); // Click edit for Basic Plan

    expect(screen.getByRole('dialog', { name: /Edit Subscription Plan/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Plan Name/i)).toHaveValue('Basic Plan');
    expect(screen.getByLabelText(/Monthly Price \(\$\)/i)).toHaveValue(10);
    expect(screen.getByLabelText(/Max Users/i)).toHaveValue(5);
    expect(screen.getByLabelText(/Advanced Reporting/i)).not.toBeChecked();
  });

  // Test 7: Edit Plan - Successful update
  test('successfully updates an existing subscription plan', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]); // Click edit for Basic Plan

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Updated Basic Plan' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '15' } });
    fireEvent.click(screen.getByLabelText(/Advanced Reporting/i)); // Toggle a feature

    mockUpdateSubscriptionPlan.mockResolvedValueOnce({
      ...mockPlans[0],
      name: 'Updated Basic Plan',
      monthlyPrice: 15,
      features: { ...mockPlans[0].features, advancedReporting: true },
    });

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(mockUpdateSubscriptionPlan).toHaveBeenCalledWith(
        mockPlans[0].id,
        expect.objectContaining({
          name: 'Updated Basic Plan',
          monthlyPrice: 15,
          features: expect.objectContaining({ advancedReporting: true }),
        })
      );
      expect(mockGetSubscriptionPlans).toHaveBeenCalledTimes(2); // Called again after update
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); // Dialog closes
    });
  });

  // Test 8: Edit Plan - Error during update
  test('displays error alert if updating a plan fails', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByLabelText(/edit/i);
    fireEvent.click(editButtons[0]); // Click edit for Basic Plan

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Failing Update' } });
    mockUpdateSubscriptionPlan.mockRejectedValueOnce(new Error('Update failed'));

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to save subscription plan');
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // Dialog remains open on error
  });

  // Test 9: Delete Plan - Successful deletion
  test('successfully deletes a subscription plan', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]); // Click delete for Basic Plan

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this subscription plan? This action cannot be undone.');

    mockDeleteSubscriptionPlan.mockResolvedValueOnce(undefined); // Mock successful deletion

    await waitFor(() => {
      expect(mockDeleteSubscriptionPlan).toHaveBeenCalledWith(mockPlans[0].id);
      expect(mockGetSubscriptionPlans).toHaveBeenCalledTimes(2); // Called again after deletion
    });
  });

  // Test 10: Delete Plan - Error during deletion
  test('displays error alert if deleting a plan fails', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText(/delete/i);
    fireEvent.click(deleteButtons[0]); // Click delete for Basic Plan

    mockDeleteSubscriptionPlan.mockRejectedValueOnce(new Error('Deletion failed'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Failed to delete subscription plan');
    });
  });

  // Test 11: calculateMonthlyRevenue function
  test('calculateMonthlyRevenue displays correct total', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });
    // Basic Plan: 10 * 1 = 10
    // Pro Plan: 25 * 2 = 50
    // Total: 10 + 50 = 60
    expect(screen.getByText('$60')).toBeInTheDocument();
  });

  // Test 12: Empty plans list
  test('renders correctly with an empty list of plans', async () => {
    mockGetSubscriptionPlans.mockResolvedValueOnce([]);
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.queryByText('Basic Plan')).not.toBeInTheDocument();
      expect(screen.queryByText('Pro Plan')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Total Plans')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Total Plans
    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Active Plans
    expect(screen.getByText('Total Subscribers')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Total Subscribers
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument(); // Monthly Revenue
  });

  // Test 13: Dismissing error alert
  test('error alert can be dismissed', async () => {
    mockGetSubscriptionPlans.mockRejectedValueOnce(new Error('Failed to fetch'));
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText(/Close/i)); // Close button on Alert
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // Test 14: Feature switches in dialog
  test('feature switches in dialog update form data correctly', async () => {
    render(<SubscriptionManagement />);
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    const advancedReportingSwitch = screen.getByLabelText(/Advanced Reporting/i);
    expect(advancedReportingSwitch).not.toBeChecked();

    fireEvent.click(advancedReportingSwitch);
    expect(advancedReportingSwitch).toBeChecked();

    const customBrandingSwitch = screen.getByLabelText(/Custom Branding/i);
    expect(customBrandingSwitch).not.toBeChecked();

    fireEvent.click(customBrandingSwitch);
    expect(customBrandingSwitch).toBeChecked();

    // Close dialog to avoid interfering with other tests
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // Test 15: Input fields handle various types correctly
  test('input fields handle number and text types correctly', async () => {
    render(<SubscriptionManagement />);
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    const nameInput = screen.getByLabelText(/Plan Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Plan' } });
    expect(nameInput).toHaveValue('Test Plan');

    const monthlyPriceInput = screen.getByLabelText(/Monthly Price \(\$\)/i);
    fireEvent.change(monthlyPriceInput, { target: { value: '99.99' } });
    expect(monthlyPriceInput).toHaveValue(99.99);

    const maxUsersInput = screen.getByLabelText(/Max Users/i);
    fireEvent.change(maxUsersInput, { target: { value: '100' } });
    expect(maxUsersInput).toHaveValue(100);

    // Close dialog
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
