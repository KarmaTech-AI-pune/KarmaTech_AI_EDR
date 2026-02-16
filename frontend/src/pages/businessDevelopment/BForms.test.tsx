import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BForms } from './BForms';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { OpportunityTracking } from '../../models';

// Mock react-router-dom hooks
vi.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: vi.fn(),
  useNavigate: vi.fn(),
}));

// Mock BusinessDevelopmentContext
vi.mock('../../context/BusinessDevelopmentContext', () => ({
  __esModule: true,
  useBusinessDevelopment: vi.fn(),
}));

// Mock Material-UI components
vi.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
}));
vi.mock('@mui/material/Grid', () => ({
  __esModule: true,
  default: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-grid">{children}</div>),
}));
vi.mock('@mui/material/Card', () => ({
  __esModule: true,
  default: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-card">{children}</div>),
}));
vi.mock('@mui/material/CardContent', () => ({
  __esModule: true,
  default: vi.fn(({ children }) => <div data-testid="mock-card-content">{children}</div>),
}));
vi.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: vi.fn(({ children, variant, ...props }) => <span data-testid={`mock-typography-${variant}`} {...props}>{children}</span>),
}));
vi.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: vi.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} data-testid={`mock-button-${children}`} {...props}>
      {children}
    </button>
  )),
}));
vi.mock('@mui/icons-material/Description', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-description-icon" />),
}));
vi.mock('@mui/icons-material/Assessment', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-assessment-icon" />),
}));
vi.mock('@mui/icons-material/Assignment', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-assignment-icon" />),
}));

const mockNavigate = vi.fn();

const mockOpportunityApproved: OpportunityTracking = {
  id: 1,
  workName: 'Approved Opportunity',
  currentHistory: [{
    id: 1,
    opportunityId: 1,
    statusId: 6,
    status: 'Approved',
    action: 'Approved',
    assignedToId: 'user1',
    date: '2023-01-01T10:00:00Z',
    description: 'Opportunity approved',
  }], // statusId 6 for Approved
  // ... other properties
};

const mockOpportunityPending: OpportunityTracking = {
  id: 2,
  workName: 'Pending Opportunity',
  currentHistory: [{
    id: 2,
    opportunityId: 2,
    statusId: 1,
    status: 'Draft',
    action: 'Drafted',
    assignedToId: 'user1',
    date: '2023-01-01T10:00:00Z',
    description: 'Opportunity drafted',
  }], // statusId 1 for Draft
  // ... other properties
};

describe('BForms', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
    (useBusinessDevelopment as vi.Mock).mockReturnValue({
      goNoGoDecisionStatus: 'NO-GO',
      goNoGoVersionNumber: 1,
    });
  });

  it('renders all form cards and titles', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityApproved });
    render(<BForms />);

    expect(screen.getByText('Forms Overview')).toBeInTheDocument();
    expect(screen.getByText('Opportunity Tracking')).toBeInTheDocument();
    expect(screen.getByText('Go/No-Go Decision')).toBeInTheDocument();
    expect(screen.getByText('Bid Preparation')).toBeInTheDocument();
  });

  it('Opportunity Tracking button is always enabled and navigates correctly', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityPending });
    render(<BForms />);

    const opportunityButton = screen.getAllByRole('button', { name: /View Form/i })[0];
    expect(opportunityButton).not.toBeDisabled(); // Should be enabled
    fireEvent.click(opportunityButton);
    expect(mockNavigate).toHaveBeenCalledWith('/business-development/details/forms/opportunity-tracking');
  });

  it('Go/No-Go Decision button is disabled if opportunity is not approved', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityPending });
    render(<BForms />);

    const goNoGoButton = screen.getAllByRole('button', { name: /View Form/i })[1]; // Assuming it's the second button
    expect(goNoGoButton).toBeDisabled();
    expect(goNoGoButton).toHaveTextContent('View Form'); // Ensure it's the correct button
  });

  it('Go/No-Go Decision button is enabled if opportunity is approved and navigates correctly', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityApproved });
    render(<BForms />);

    const goNoGoButton = screen.getAllByRole('button', { name: /View Form/i })[1]; // Second "View Form" button
    expect(goNoGoButton).not.toBeDisabled();
    fireEvent.click(goNoGoButton);
    expect(mockNavigate).toHaveBeenCalledWith('/business-development/details/forms/gonogo');
  });

  it('Bid Preparation button is disabled if Go/No-Go status is not "GO" or version is not 3', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityApproved });
    (useBusinessDevelopment as vi.Mock).mockReturnValue({
      goNoGoDecisionStatus: 'NO-GO', // Not GO
      goNoGoVersionNumber: 1, // Not 3
    });
    render(<BForms />);

    const bidPreparationButton = screen.getAllByRole('button', { name: /View Form/i })[2]; // Third "View Form" button
    expect(bidPreparationButton).toBeDisabled();
  });

  it('Bid Preparation button is enabled if Go/No-Go status is "GO" and version is 3 and navigates correctly', () => {
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityApproved });
    (useBusinessDevelopment as vi.Mock).mockReturnValue({
      goNoGoDecisionStatus: 'GO',
      goNoGoVersionNumber: 3,
    });
    render(<BForms />);

    const bidPreparationButton = screen.getAllByRole('button', { name: /View Form/i })[2]; // Third "View Form" button
    expect(bidPreparationButton).not.toBeDisabled();
    fireEvent.click(bidPreparationButton);
    expect(mockNavigate).toHaveBeenCalledWith('/business-development/details/forms/bid-preparation');
  });

  it('handles opportunity.currentHistory as an array of histories', () => {
    const mockOpportunityArrayHistory: OpportunityTracking = {
      ...mockOpportunityApproved,
      currentHistory: [
        { id: 1, opportunityId: 1, statusId: 1, status: 'Draft', action: 'Drafted', assignedToId: 'user1', date: '2023-01-01T10:00:00Z', description: 'Opportunity drafted' },
        { id: 2, opportunityId: 1, statusId: 6, status: 'Approved', action: 'Approved', assignedToId: 'user1', date: '2023-01-02T11:00:00Z', description: 'Opportunity approved' }, // Approved status in array
      ],
    };
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunityArrayHistory });
    render(<BForms />);

    const goNoGoButton = screen.getAllByRole('button', { name: /View Form/i })[1];
    expect(goNoGoButton).not.toBeDisabled(); // Should be enabled because one history is approved
  });

  it('handles opportunity.currentHistory as a single object', () => {
    const mockOpportunitySingleHistory: OpportunityTracking = {
      ...mockOpportunityApproved,
      currentHistory: {
        id: 1,
        opportunityId: 1,
        statusId: 6,
        status: 'Approved',
        action: 'Approved',
        assignedToId: 'user1',
        date: '2023-01-01T10:00:00Z',
        description: 'Opportunity approved',
      }, // Approved status as single object
    };
    (useOutletContext as vi.Mock).mockReturnValue({ opportunity: mockOpportunitySingleHistory });
    render(<BForms />);

    const goNoGoButton = screen.getAllByRole('button', { name: /View Form/i })[1];
    expect(goNoGoButton).not.toBeDisabled(); // Should be enabled
  });
});
