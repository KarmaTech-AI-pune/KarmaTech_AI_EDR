// import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import SubscriptionManagement from './SubscriptionManagement';
import * as subscriptionApi from '../../services/subscriptionApi';
import { SubscriptionPlan, Feature } from '../../models/subscriptionModel';

// Mock the API service
vi.mock('../../services/subscriptionApi');

const mockFeatures: Feature[] = [
  { id: 1, name: 'Advanced Reporting', description: 'Detailed analytics and charts', isActive: true },
  { id: 2, name: 'Custom Branding', description: 'Use your own logo and colors', isActive: true },
  { id: 3, name: 'API Access', description: 'Programmatic access to data', isActive: true },
];

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
    features: [mockFeatures[0]],
    isActive: true,
    tenants: 1,
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
    features: [mockFeatures[0], mockFeatures[1]],
    isActive: true,
    tenants: 2,
  },
];

describe('SubscriptionManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(subscriptionApi.getSubscriptionPlans).mockResolvedValue(mockPlans);
    vi.mocked(subscriptionApi.getAllFeatures).mockResolvedValue(mockFeatures);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Initial render and loading of plans
  test('renders subscription plans and summary cards on initial load', async () => {
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByText('Subscription Plans')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
      expect(screen.getByText('Pro Plan')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Plans')).toBeInTheDocument();
    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getByText('Total Subscribers')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    
    await waitFor(() => {
      const twos = screen.getAllByText('2');
      expect(twos.length).toBeGreaterThanOrEqual(2); // Total Plans and Active Plans both show 2
      expect(screen.getByText('3')).toBeInTheDocument(); // Total Subscribers
      expect(screen.getByText(/60/)).toBeInTheDocument(); // Monthly Revenue
    });
  });

  // Test 2: Error handling during initial load
  test('displays error alert if loading plans fails', async () => {
    vi.mocked(subscriptionApi.getSubscriptionPlans).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<SubscriptionManagement />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Failed to load subscription data');
    }, { timeout: 5000 });
  });

  // Test 3: Add New Plan - Dialog opens and closes
  test('opens and closes the Add New Plan dialog', async () => {
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Plan/i });
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Subscription Plan')).not.toBeInTheDocument();
    });
  });

  // Test 4: Add New Plan - Successful creation
  test('successfully creates a new subscription plan', async () => {
    vi.mocked(subscriptionApi.createSubscriptionPlan).mockResolvedValue({
      id: 3,
      name: 'New Plan',
      description: 'New plan description',
      monthlyPrice: 30,
      yearlyPrice: 300,
      maxUsers: 50,
      maxProjects: 200,
      maxStorageGB: 100,
      features: [mockFeatures[0]],
      isActive: true,
      tenants: 0,
    });
    
    render(<SubscriptionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'New Plan' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'New plan description' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/Yearly Price \(\$\)/i), { target: { value: '300' } });
    fireEvent.change(screen.getByLabelText(/Max Users/i), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText(/Max Projects/i), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText(/Max Storage \(GB\)/i), { target: { value: '100' } });
    
    const dialog = screen.getByRole('dialog');
    const advancedReportingCheckbox = within(dialog).getByLabelText(/Advanced Reporting/i);
    fireEvent.click(advancedReportingCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      expect(subscriptionApi.createSubscriptionPlan).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Plan',
        monthlyPrice: 30,
        maxUsers: 50,
        featureIds: [1],
      }));
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Add New Subscription Plan')).not.toBeInTheDocument();
    });
  });

  // Test 5: Add New Plan - Error during creation
  test('displays error alert if creating a plan fails', async () => {
    vi.mocked(subscriptionApi.createSubscriptionPlan).mockRejectedValue(new Error('Creation failed'));
    
    render(<SubscriptionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Failing Plan' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Yearly Price \(\$\)/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Max Users/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Projects/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Max Storage \(GB\)/i), { target: { value: '10' } });

    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert', { hidden: true });
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Failed to save subscription plan');
    }, { timeout: 5000 });
    
    expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
  });

  // Test 6: Edit Plan - Dialog opens with pre-filled data
  test('opens the Edit Subscription Plan dialog with pre-filled data', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    const basicPlanRow = rows.find(row => row.textContent?.includes('Basic Plan'));
    expect(basicPlanRow).toBeDefined();
    
    const editButton = within(basicPlanRow!).getAllByRole('button')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/Plan Name/i)).toHaveValue('Basic Plan');
    expect(screen.getByLabelText(/Monthly Price \(\$\)/i)).toHaveValue(10);
    expect(screen.getByLabelText(/Max Users/i)).toHaveValue(5);
    
    const dialog = screen.getByRole('dialog');
    const advancedReportingCheckbox = within(dialog).getByLabelText(/Advanced Reporting/i);
    expect(advancedReportingCheckbox).toBeChecked();
  });

  // Test 7: Edit Plan - Successful update
  test('successfully updates an existing subscription plan', async () => {
    vi.mocked(subscriptionApi.updateSubscriptionPlan).mockResolvedValue({
      ...mockPlans[0],
      name: 'Updated Basic Plan',
      monthlyPrice: 15,
      features: [mockFeatures[0], mockFeatures[1]],
    });
    
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    const basicPlanRow = rows.find(row => row.textContent?.includes('Basic Plan'));
    const editButton = within(basicPlanRow!).getAllByRole('button')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Updated Basic Plan' } });
    fireEvent.change(screen.getByLabelText(/Monthly Price \(\$\)/i), { target: { value: '15' } });
    
    const dialog = screen.getByRole('dialog');
    const customBrandingCheckbox = within(dialog).getByLabelText(/Custom Branding/i);
    fireEvent.click(customBrandingCheckbox);

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(subscriptionApi.updateSubscriptionPlan).toHaveBeenCalledWith(
        mockPlans[0].id,
        expect.objectContaining({
          name: 'Updated Basic Plan',
          monthlyPrice: 15,
          featureIds: [1, 2],
        })
      );
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Edit Subscription Plan')).not.toBeInTheDocument();
    });
  });

  // Test 8: Edit Plan - Error during update
  test('displays error alert if updating a plan fails', async () => {
    vi.mocked(subscriptionApi.updateSubscriptionPlan).mockRejectedValue(new Error('Update failed'));
    
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    const basicPlanRow = rows.find(row => row.textContent?.includes('Basic Plan'));
    const editButton = within(basicPlanRow!).getAllByRole('button')[0];
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Plan Name/i), { target: { value: 'Failing Update' } });

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert', { hidden: true });
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Failed to save subscription plan');
    }, { timeout: 5000 });
    
    expect(screen.getByText('Edit Subscription Plan')).toBeInTheDocument();
  });

  // Test 9: Delete Plan - Successful deletion
  test('successfully deletes a subscription plan', async () => {
    vi.mocked(subscriptionApi.deleteSubscriptionPlan).mockResolvedValue(undefined);
    
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    const basicPlanRow = rows.find(row => row.textContent?.includes('Basic Plan'));
    const deleteButton = within(basicPlanRow!).getAllByRole('button')[1];
    
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this subscription plan? This action cannot be undone.');

    await waitFor(() => {
      expect(subscriptionApi.deleteSubscriptionPlan).toHaveBeenCalledWith(mockPlans[0].id);
    });
  });

  // Test 10: Delete Plan - Error during deletion
  test('displays error alert if deleting a plan fails', async () => {
    vi.mocked(subscriptionApi.deleteSubscriptionPlan).mockRejectedValue(new Error('Deletion failed'));
    
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });

    const rows = screen.getAllByRole('row');
    const basicPlanRow = rows.find(row => row.textContent?.includes('Basic Plan'));
    const deleteButton = within(basicPlanRow!).getAllByRole('button')[1];
    
    fireEvent.click(deleteButton);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Failed to delete subscription plan');
    }, { timeout: 3000 });
  });

  // Test 11: calculateMonthlyRevenue function
  test('calculateMonthlyRevenue displays correct total', async () => {
    render(<SubscriptionManagement />);
    await waitFor(() => {
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText(/60/)).toBeInTheDocument();
    });
  });

  // Test 12: Empty plans list
  test('renders correctly with an empty list of plans', async () => {
    vi.mocked(subscriptionApi.getSubscriptionPlans).mockResolvedValue([]);
    
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByText('Total Plans')).toBeInTheDocument();
    });

    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getByText('Total Subscribers')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    
    await waitFor(() => {
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThan(0);
    });
  });

  // Test 13: Dismissing error alert
  test('error alert can be dismissed', async () => {
    vi.mocked(subscriptionApi.getSubscriptionPlans).mockRejectedValue(new Error('Failed to fetch'));
    
    render(<SubscriptionManagement />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    }, { timeout: 5000 });

    const closeButton = within(screen.getByRole('alert')).getByRole('button');
    fireEvent.click(closeButton);
    
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  // Test 14: Feature checkboxes in dialog
  test('feature checkboxes in dialog update form data correctly', async () => {
    render(<SubscriptionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
    });

    const dialog = screen.getByRole('dialog');
    const advancedReportingCheckbox = within(dialog).getByLabelText(/Advanced Reporting/i);
    expect(advancedReportingCheckbox).not.toBeChecked();

    fireEvent.click(advancedReportingCheckbox);
    expect(advancedReportingCheckbox).toBeChecked();

    const customBrandingCheckbox = within(dialog).getByLabelText(/Custom Branding/i);
    expect(customBrandingCheckbox).not.toBeChecked();

    fireEvent.click(customBrandingCheckbox);
    expect(customBrandingCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Add New Subscription Plan')).not.toBeInTheDocument();
    });
  });

  // Test 15: Input fields handle various types correctly
  test('input fields handle number and text types correctly', async () => {
    render(<SubscriptionManagement />);
    
    await waitFor(() => {
      expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Add Plan/i }));

    await waitFor(() => {
      expect(screen.getByText('Add New Subscription Plan')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Plan Name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Plan' } });
    expect(nameInput).toHaveValue('Test Plan');

    const monthlyPriceInput = screen.getByLabelText(/Monthly Price \(\$\)/i);
    fireEvent.change(monthlyPriceInput, { target: { value: '99.99' } });
    expect(monthlyPriceInput).toHaveValue(99.99);

    const maxUsersInput = screen.getByLabelText(/Max Users/i);
    fireEvent.change(maxUsersInput, { target: { value: '100' } });
    expect(maxUsersInput).toHaveValue(100);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => {
      expect(screen.queryByText('Add New Subscription Plan')).not.toBeInTheDocument();
    });
  });
});
