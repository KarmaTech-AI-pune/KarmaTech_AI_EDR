import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BFormRenderer } from './BFormRenderer';
import { useOutletContext, useParams } from 'react-router-dom';
import { OpportunityForm } from '../../components/forms/OpportunityForm';
import BidPreparationForm from '../../components/forms/BidPreparationForm';
import GoNoGoForm from '../../components/forms/GoNoGoForm';
import { opportunityApi } from '../../dummyapi/opportunityApi';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { OpportunityTracking } from '../../models';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
  __esModule: true,
  useOutletContext: jest.fn(),
  useParams: jest.fn(),
}));

// Mock form components
jest.mock('../../components/forms/OpportunityForm', () => ({
  __esModule: true,
  OpportunityForm: jest.fn(({ onSubmit, project }) => (
    <form data-testid="mock-opportunity-form" onSubmit={(e) => { e.preventDefault(); onSubmit(project); }}>
      <input data-testid="opportunity-form-input" value={project?.workName || ''} readOnly />
      <button type="submit">Submit Opportunity</button>
    </form>
  )),
}));
jest.mock('../../components/forms/BidPreparationForm', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-bid-preparation-form" />),
}));
jest.mock('../../components/forms/GoNoGoForm', () => ({
  __esModule: true,
  default: jest.fn(({ onDecisionStatusChange }) => (
    <div data-testid="mock-gonogo-form">
      <button onClick={() => onDecisionStatusChange('GO', 3)}>Set GO</button>
      <button onClick={() => onDecisionStatusChange('NO-GO', 1)}>Set NO-GO</button>
    </div>
  )),
}));

// Mock API and context
jest.mock('../../dummyapi/opportunityApi');
jest.mock('../../context/BusinessDevelopmentContext');

// Mock Material-UI components
jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
}));
jest.mock('@mui/material/Paper', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-paper">{children}</div>),
}));
jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: jest.fn(({ children, variant, ...props }) => <span data-testid={`mock-typography-${variant}`} {...props}>{children}</span>),
}));

const mockOpportunity: OpportunityTracking = {
  id: 1,
  workName: 'Test Opportunity',
  client: 'Test Client',
  clientSector: 'IT',
  operation: 'Development',
  status: 'Draft',
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
  currentHistory: [],
};

const mockHandleOpportunityUpdate = jest.fn();
const mockSetGoNoGoDecisionStatus = jest.fn();
const mockSetGoNoGoVersionNumber = jest.fn();

describe('BFormRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOutletContext as jest.Mock).mockReturnValue({
      opportunity: mockOpportunity,
      handleOpportunityUpdate: mockHandleOpportunityUpdate,
    });
    (useBusinessDevelopment as jest.Mock).mockReturnValue({
      setGoNoGoDecisionStatus: mockSetGoNoGoDecisionStatus,
      setGoNoGoVersionNumber: mockSetGoNoGoVersionNumber,
    });
    (opportunityApi.update as jest.Mock).mockResolvedValue({});
  });

  it('renders OpportunityForm when formId is "opportunity-tracking"', () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'opportunity-tracking' });
    render(<BFormRenderer />);
    expect(screen.getByTestId('mock-opportunity-form')).toBeInTheDocument();
    expect(screen.getByText('Opportunity Tracking Form')).toBeInTheDocument();
    expect(screen.getByText(`View and edit opportunity tracking details for ${mockOpportunity.workName}`)).toBeInTheDocument();
    expect(OpportunityForm).toHaveBeenCalledWith(
      expect.objectContaining({
        project: mockOpportunity,
      }),
      {}
    );
  });

  it('renders GoNoGoForm when formId is "gonogo"', () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'gonogo' });
    render(<BFormRenderer />);
    expect(screen.getByTestId('mock-gonogo-form')).toBeInTheDocument();
    expect(GoNoGoForm).toHaveBeenCalledWith(
      expect.objectContaining({
        onDecisionStatusChange: expect.any(Function),
      }),
      {}
    );
  });

  it('renders BidPreparationForm when formId is "bid-preparation"', () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'bid-preparation' });
    render(<BFormRenderer />);
    expect(screen.getByTestId('mock-bid-preparation-form')).toBeInTheDocument();
    expect(screen.getByText('Bid Preparation Form')).toBeInTheDocument();
    expect(BidPreparationForm).toHaveBeenCalledTimes(1);
  });

  it('renders "Form not found" for an unknown formId', () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'unknown-form' });
    render(<BFormRenderer />);
    expect(screen.getByText('Form not found')).toBeInTheDocument();
  });

  it('handles OpportunityForm submission correctly', async () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'opportunity-tracking' });
    render(<BFormRenderer />);

    const submitButton = screen.getByRole('button', { name: /Submit Opportunity/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(opportunityApi.update).toHaveBeenCalledWith(mockOpportunity.id, mockOpportunity);
      expect(mockHandleOpportunityUpdate).toHaveBeenCalledTimes(1);
    });
  });

  it('handles GoNoGoForm decision status change', () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'gonogo' });
    render(<BFormRenderer />);

    fireEvent.click(screen.getByRole('button', { name: /Set GO/i }));

    expect(mockSetGoNoGoDecisionStatus).toHaveBeenCalledWith('GO');
    expect(mockSetGoNoGoVersionNumber).toHaveBeenCalledWith(3);
  });

  it('logs error if opportunity update fails', async () => {
    (useParams as jest.Mock).mockReturnValue({ formId: 'opportunity-tracking' });
    (opportunityApi.update as jest.Mock).mockRejectedValue(new Error('API Error'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<BFormRenderer />);

    const submitButton = screen.getByRole('button', { name: /Submit Opportunity/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating opportunity:', expect.any(Error));
    });
    consoleErrorSpy.mockRestore();
  });
});
