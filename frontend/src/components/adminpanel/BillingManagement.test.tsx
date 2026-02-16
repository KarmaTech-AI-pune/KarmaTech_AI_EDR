import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillingManagement from './BillingManagement';

describe('BillingManagement', () => {
  it('renders correctly with initial mock data', async () => {
    render(<BillingManagement />);

    // Check for the main title
    expect(screen.getByText('Billing Management')).toBeInTheDocument();

    // Check for summary cards
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$125,000')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getByText('Pending Payments')).toBeInTheDocument();
    expect(screen.getByText('$2,500')).toBeInTheDocument();
    expect(screen.getByText('Overdue Payments')).toBeInTheDocument();
    expect(screen.getByText('$800')).toBeInTheDocument();

    // Check for table headers
    expect(screen.getByText('Invoice ID')).toBeInTheDocument();
    expect(screen.getByText('Tenant')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Paid Date')).toBeInTheDocument();

    // Check for invoice data
    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('$500')).toBeInTheDocument();
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByText('1/15/2024')).toBeInTheDocument(); // Assuming default locale for date
      expect(screen.getByText('1/10/2024')).toBeInTheDocument();

      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('TechStart Inc')).toBeInTheDocument();
      expect(screen.getByText('$750')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('1/20/2024')).toBeInTheDocument();
      expect(screen.getAllByText('-')[0]).toBeInTheDocument(); // First '-' for paid date

      expect(screen.getByText('#3')).toBeInTheDocument();
      expect(screen.getByText('Global Solutions')).toBeInTheDocument();
      expect(screen.getByText('$1200')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
      expect(screen.getByText('1/5/2024')).toBeInTheDocument();
      expect(screen.getAllByText('-')[1]).toBeInTheDocument(); // Second '-' for paid date
    });

    // Check for the info alert
    expect(screen.getByText(/This is a simplified billing view/i)).toBeInTheDocument();
  });
});

