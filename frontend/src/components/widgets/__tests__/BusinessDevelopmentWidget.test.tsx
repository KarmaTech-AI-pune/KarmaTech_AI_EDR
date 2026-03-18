import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BusinessDevelopmentWidget } from '../BusinessDevelopmentWidget';

// Mock userApi
vi.mock('../../../services/userApi', () => ({
  getUserById: vi.fn(async (id: string) => {
    if (id === 'user-1') return { name: 'John Doe' };
    return null;
  })
}));

describe('BusinessDevelopmentWidget', () => {
  const mockOpportunity = {
    id: 1,
    client: 'Acme Corp',
    clientSector: 'Technology',
    contactPersonAtClient: 'Jane Smith',
    status: 'Bid Submitted',
    currentHistory: { statusId: 2 },
    operation: 'IT Services',
    stage: 'Proposal',
    strategicRanking: 'High',
    bidManagerId: 'user-1',
    reviewManagerId: 'user-2',
    approvalManagerId: 'user-3',
    percentageChanceOfProjectHappening: 75,
    percentageChanceOfEDRSuccess: 60,
    currency: 'USD',
    bidFees: 10000,
    emd: 2000,
    formOfEMD: 'Bank Guarantee',
    grossRevenue: 50000,
    netEDRRevenue: 40000,
    capitalValue: 1000000,
    durationOfProject: 12,
    contractType: 'Fixed Price',
    fundingStream: 'Internal',
    likelyCompetition: 'Competitor A',
    probableQualifyingCriteria: 'Experience',
    followUpComments: 'Call next week',
    notes: 'Important client'
  };

  it('renders client information correctly', async () => {
    await act(async () => {
      render(<BusinessDevelopmentWidget opportunity={mockOpportunity as any} />);
    });
    
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText(/Sector: Technology/)).toBeInTheDocument();
    expect(screen.getByText(/Contact: Jane Smith/)).toBeInTheDocument();
    expect(screen.getByText(/Status: Bid Submitted/i)).toBeInTheDocument();
  });

  it('renders project overview correctly', async () => {
    await act(async () => {
      render(<BusinessDevelopmentWidget opportunity={mockOpportunity as any} />);
    });

    expect(screen.getByText(/Operation: IT Services/i)).toBeInTheDocument();
    expect(screen.getByText(/Stage: Proposal/i)).toBeInTheDocument();
  });

  it('renders management information correctly resolving mock async username', async () => {
    await act(async () => {
      render(<BusinessDevelopmentWidget opportunity={mockOpportunity as any} />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Bid Manager: John Doe/i)).toBeInTheDocument();
    });
    
    // Unresolved mocks
    expect(screen.getByText(/Review Manager: Unknown/i)).toBeInTheDocument();
  });

  it('renders financial details with localized currency correctly', async () => {
    await act(async () => {
      render(<BusinessDevelopmentWidget opportunity={mockOpportunity as any} />);
    });

    expect(screen.getByText(/USD 10,000/i)).toBeInTheDocument();
    expect(screen.getByText(/USD 50,000/i)).toBeInTheDocument();
    expect(screen.getByText(/Fixed Price/i)).toBeInTheDocument();
  });
});
