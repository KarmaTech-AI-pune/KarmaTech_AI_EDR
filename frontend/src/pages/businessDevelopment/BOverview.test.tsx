import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
// import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BOverview } from './BOverview';
import { useOutletContext } from 'react-router-dom';
import { OpportunityTracking } from '../../models';
import { HistoryWidget } from '../../components/widgets/HistoryWidget';

// Mock react-router-dom's useOutletContext
vi.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: vi.fn(),
}));

// Mock HistoryWidget to simplify testing BOverview's rendering
vi.mock('../../components/widgets/HistoryWidget', () => ({
  __esModule: true,
  HistoryWidget: vi.fn(() => <div data-testid="mock-history-widget" />),
}));

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  __esModule: true,
  Box: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
  Grid: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-grid">{children}</div>),
  Card: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-card">{children}</div>),
  CardContent: vi.fn(({ children }) => <div data-testid="mock-card-content">{children}</div>),
  Typography: vi.fn(({ children, variant, ...props }) => <span data-testid={`mock-typography-${variant}`} {...props}>{children}</span>),
  Chip: vi.fn(({ label, ...props }) => <span data-testid="mock-chip" {...props}>{label}</span>),
}));

vi.mock('@mui/icons-material/Home', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-home-icon" />),
}));
vi.mock('@mui/icons-material/Business', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-business-icon" />),
}));
vi.mock('@mui/icons-material/AttachMoney', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-attachmoney-icon" />),
}));
vi.mock('@mui/icons-material/CalendarToday', () => ({
  __esModule: true,
  default: vi.fn(() => <span data-testid="mock-calendartoday-icon" />),
}));


const mockOpportunity: OpportunityTracking = {
  id: 1,
  workName: 'Test Project',
  client: 'Test Client',
  clientSector: 'IT',
  operation: 'Development',
  status: 'Approved',
  stage: 'A',
  strategicRanking: 'High',
  contractType: 'Fixed Price',
  fundingStream: 'Private',
  capitalValue: 1000000,
  currency: 'USD',
  likelyStartDate: '2023-01-15T00:00:00Z',
  durationOfProject: 12,
  bidNumber: 'BID-001',
  bidFees: 1000,
  emd: 50000,
  formOfEMD: 'Bank Guarantee',
  bidManagerId: 'bm1',
  reviewManagerId: 'rm1',
  approvalManagerId: 'am1',
  contactPersonAtClient: 'John Doe',
  dateOfSubmission: '2022-12-31T00:00:00Z',
  percentageChanceOfProjectHappening: 90,
  percentageChanceOfNJSSuccess: 80,
  likelyCompetition: 'Competitor A, Competitor B',
  grossRevenue: 1200000,
  netNJSRevenue: 1100000,
  followUpComments: 'Follow up soon',
  notes: 'Important notes',
  probableQualifyingCriteria: 'High experience',
  currentHistory: [{
    id: 1,
    opportunityId: 1,
    statusId: 6,
    status: 'Approved',
    action: 'Approved',
    assignedToId: 'user1',
    date: '2023-01-01T10:00:00Z',
    description: 'Opportunity approved',
  }],
};

const mockHistories = [
  { id: 1, status: 'Draft', comments: 'Initial draft', timestamp: '2023-01-01T10:00:00Z' },
  { id: 2, status: 'Submitted', comments: 'Submitted for review', timestamp: '2023-01-02T11:00:00Z' },
];

describe('BOverview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useOutletContext as import('vitest').Mock).mockReturnValue({
      opportunity: mockOpportunity,
      histories: mockHistories,
    });
    (HistoryWidget as import('vitest').Mock).mockImplementation(({ title, histories }) => (
      <div data-testid="mock-history-widget">
        <span data-testid="history-widget-title">{title}</span>
        <ul data-testid="history-widget-list">
          {histories.map((h: any) => (
            <li key={h.id}>{h.status}</li>
          ))}
        </ul>
      </div>
    ));
  });

  it('renders opportunity information correctly', () => {
    render(<BOverview />);

    expect(screen.getByText('Opportunity Information')).toBeInTheDocument();
    expect(screen.getByText('Work Name')).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Test Client')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('renders project details correctly', () => {
    render(<BOverview />);

    expect(screen.getByText('Project Details')).toBeInTheDocument();
    expect(screen.getByText('Stage')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('Strategic Ranking')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders financial details correctly', () => {
    render(<BOverview />);

    expect(screen.getByText('Financial Details')).toBeInTheDocument();
    expect(screen.getByText('Capital Value')).toBeInTheDocument();
    expect(screen.getByText('$1,000,000.00')).toBeInTheDocument(); // Formatted currency
    expect(screen.getByTestId('mock-chip')).toHaveTextContent('USD');
  });

  it('renders timeline details correctly', () => {
    render(<BOverview />);

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Likely Start Date')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument(); // Formatted date
    expect(screen.getByText('Duration (months)')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('renders HistoryWidget with correct props', () => {
    render(<BOverview />);

    expect(HistoryWidget).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'History - Test Project',
        histories: mockHistories,
      }),
      {}
    );
    expect(screen.getByTestId('mock-history-widget')).toBeInTheDocument();
    expect(screen.getByTestId('history-widget-title')).toHaveTextContent('History - Test Project');
    expect(screen.getByTestId('history-widget-list')).toHaveTextContent('Draft');
    expect(screen.getByTestId('history-widget-list')).toHaveTextContent('Submitted');
  });

  it('displays "Not specified" for undefined values', () => {
    const opportunityWithUndefined: OpportunityTracking = {
      ...mockOpportunity,
      workName: undefined,
      client: undefined,
      capitalValue: undefined,
      likelyStartDate: undefined,
    };
    (useOutletContext as import('vitest').Mock).mockReturnValue({
      opportunity: opportunityWithUndefined,
      histories: [],
    });

    render(<BOverview />);

    expect(screen.getAllByText('Not specified')).toHaveLength(4); // workName, client, capitalValue, likelyStartDate
  });

  it('formats currency correctly for different currencies', () => {
    const opportunityINR: OpportunityTracking = {
      ...mockOpportunity,
      capitalValue: 500000,
      currency: 'INR',
    };
    (useOutletContext as import('vitest').Mock).mockReturnValue({
      opportunity: opportunityINR,
      histories: [],
    });

    render(<BOverview />);
    expect(screen.getByText('₹500,000.00')).toBeInTheDocument();
  });

  it('formats date correctly for Date object input', () => {
    const opportunityDateObj: OpportunityTracking = {
      ...mockOpportunity,
      likelyStartDate: new Date('2024-03-10T00:00:00Z'),
    };
    (useOutletContext as import('vitest').Mock).mockReturnValue({
      opportunity: opportunityDateObj,
      histories: [],
    });

    render(<BOverview />);
    expect(screen.getByText('March 10, 2024')).toBeInTheDocument();
  });
});
