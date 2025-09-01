import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import GoNoGoForm from './GoNoGoForm';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { projectManagementAppContext } from '../../App';
import { goNoGoApi } from '../../dummyapi/api';
import { getScoringDescriptions } from '../../services/scoringDescriptionApi';
import { GoNoGoVersionStatus } from '../../models/workflowModel';
import { GoNoGoStatus, TypeOfBid } from '../../models/types';
import GoNoGoVersionHistory from './GoNoGoVersionHistory';
import GoNoGoApprovalStatus from './GoNoGoApprovalStatus';
import { GoNoGoVersionDto } from '../../models/goNoGoVersionModel'; // Import GoNoGoVersionDto

// Mock external dependencies
vi.mock('../../context/BusinessDevelopmentContext', () => ({
  useBusinessDevelopment: vi.fn(),
}));

vi.mock('../../App', () => ({
  projectManagementAppContext: React.createContext({
    user: { id: 'user1', name: 'Test User', roles: [{ name: 'Business Development Manager' }] },
  }),
}));

vi.mock('../../dummyapi/api', () => ({
  goNoGoApi: {
    getByOpportunityId: vi.fn(),
    getVersions: vi.fn(),
    createVersion: vi.fn(),
    create: vi.fn(),
    approveVersion: vi.fn(),
  },
}));

vi.mock('../../services/scoringDescriptionApi', () => ({
  getScoringDescriptions: vi.fn(),
}));

vi.mock('./GoNoGoVersionHistory', () => ({
  default: vi.fn(() => <div data-testid="go-no-go-version-history">Version History</div>),
}));

vi.mock('./GoNoGoApprovalStatus', () => ({
  default: vi.fn(() => <div data-testid="go-no-go-approval-status">Approval Status</div>),
}));

// Type assertions for mocked functions
const mockUseBusinessDevelopment = vi.mocked(useBusinessDevelopment);
const mockGetByOpportunityId = vi.mocked(goNoGoApi.getByOpportunityId);
const mockGetVersions = vi.mocked(goNoGoApi.getVersions);
const mockCreateVersion = vi.mocked(goNoGoApi.createVersion);
const mockCreateGoNoGo = vi.mocked(goNoGoApi.create);
const mockApproveVersion = vi.mocked(goNoGoApi.approveVersion);
const mockGetScoringDescriptions = vi.mocked(getScoringDescriptions);

const mockScoringDescriptions = {
  descriptions: {
    marketingplan: { high: 'High marketing plan', medium: 'Medium marketing plan', low: 'Low marketing plan' },
    clientrelationship: { high: 'High client relationship', medium: 'Medium client relationship', low: 'Low client relationship' },
    projectknowledge: { high: 'High project knowledge', medium: 'Medium project knowledge', low: 'Low project knowledge' },
    technicaleligibility: { high: 'High technical eligibility', medium: 'Medium technical eligibility', low: 'Low technical eligibility' },
    financialeligibility: { high: 'High financial eligibility', medium: 'Medium financial eligibility', low: 'Low financial eligibility' },
    keystaffavailability: { high: 'High key staff availability', medium: 'Medium key staff availability', low: 'Low key staff availability' },
    projectcompetition: { high: 'High project competition', medium: 'Medium project competition', low: 'Low project competition' },
    competitionposition: { high: 'High competition position', medium: 'Medium competition position', low: 'Low competition position' },
    futureworkpotential: { high: 'High future work potential', medium: 'Medium future work potential', low: 'Low future work potential' },
    projectprofitability: { high: 'High project profitability', medium: 'Medium project profitability', low: 'Low project profitability' },
    projectschedule: { high: 'High project schedule', medium: 'Medium project schedule', low: 'Low project schedule' },
    bidtimeandcosts: { high: 'High bid time and costs', medium: 'Medium bid time and costs', low: 'Low bid time and costs' },
  },
};

const mockInitialGoNoGoData = {
  id: 1,
  opportunityId: 1,
  totalScore: 0,
  status: GoNoGoVersionStatus.BDM_PENDING,
  formData: JSON.stringify({
    HeaderInfo: {
      TypeOfBid: TypeOfBid.Lumpsum,
      Sector: 'IT',
      TenderFee: 1000,
      EmdAmount: 50,
      Office: 'Main',
      BdHead: 'BD Head Name',
    },
    ScoringCriteria: {
      MarketingPlan: { Score: 0, Comments: '', ScoringDescriptionId: 1 },
      ClientRelationship: { Score: 0, Comments: '', ScoringDescriptionId: 2 },
      ProjectKnowledge: { Score: 0, Comments: '', ScoringDescriptionId: 3 },
      TechnicalEligibility: { Score: 0, Comments: '', ScoringDescriptionId: 4 },
      FinancialEligibility: { Score: 0, Comments: '', ScoringDescriptionId: 5 },
      StaffAvailability: { Score: 0, Comments: '', ScoringDescriptionId: 6 },
      CompetitionAssessment: { Score: 0, Comments: '', ScoringDescriptionId: 7 },
      CompetitivePosition: { Score: 0, Comments: '', ScoringDescriptionId: 8 },
      FutureWorkPotential: { Score: 0, Comments: '', ScoringDescriptionId: 9 },
      Profitability: { Score: 0, Comments: '', ScoringDescriptionId: 10 },
      BidSchedule: { Score: 0, Comments: '', ScoringDescriptionId: 11 },
      ResourceAvailability: { Score: 0, Comments: '', ScoringDescriptionId: 12 },
    },
    Summary: {
      TotalScore: 0,
      Status: GoNoGoStatus.Red,
      DecisionComments: '',
      ActionPlan: '',
    },
    MetaData: {
      OpprotunityId: 1,
      Id: 1,
      CompletedDate: '',
      CompletedBy: '',
      CreatedBy: '',
    },
  }),
};

const mockVersions: GoNoGoVersionDto[] = [
  { ...mockInitialGoNoGoData, id: 1, goNoGoDecisionHeaderId: 1, versionNumber: 1, status: GoNoGoVersionStatus.BDM_PENDING, createdBy: 'Test User', createdAt: '2023-01-01T00:00:00Z' },
  { ...mockInitialGoNoGoData, id: 2, goNoGoDecisionHeaderId: 1, versionNumber: 2, status: GoNoGoVersionStatus.RM_PENDING, createdBy: 'Test User', createdAt: '2023-01-02T00:00:00Z' },
  { ...mockInitialGoNoGoData, id: 3, goNoGoDecisionHeaderId: 1, versionNumber: 3, status: GoNoGoVersionStatus.RD_PENDING, createdBy: 'Test User', createdAt: '2023-01-03T00:00:00Z' },
];

describe('GoNoGoForm', () => {
  const mockOpportunityId = 1;
  const mockOnDecisionStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseBusinessDevelopment.mockReturnValue({ opportunityId: mockOpportunityId });
    mockGetScoringDescriptions.mockResolvedValue(mockScoringDescriptions);
    mockGetByOpportunityId.mockResolvedValue(mockInitialGoNoGoData as any);
    mockGetVersions.mockResolvedValue(mockVersions as any);
    mockCreateVersion.mockResolvedValue({ goNoGoDecisionHeaderId: 1 } as any);
    mockCreateGoNoGo.mockResolvedValue({ headerId: 1 } as any);
    mockApproveVersion.mockResolvedValue(undefined);
  });

  it('should render correctly and load initial data', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);

    await waitFor(() => {
      expect(mockGetByOpportunityId).toHaveBeenCalledWith(mockOpportunityId);
      expect(mockGetScoringDescriptions).toHaveBeenCalled();
      expect(screen.getByText('Go/No Go Decision Form')).toBeInTheDocument();
      expect(screen.getByLabelText('Type of Bid')).toBeInTheDocument();
      expect(screen.getByLabelText('Sector')).toBeInTheDocument();
      expect(screen.getByText('Total Score: 0')).toBeInTheDocument();
      expect(screen.getByText('Decision Status: NO GO')).toBeInTheDocument();
    });
    expect(screen.getByTestId('go-no-go-version-history')).toBeInTheDocument();
    expect(screen.getByTestId('go-no-go-approval-status')).toBeInTheDocument();
  });

  it('should update header info fields', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'New Sector' } });
    expect(screen.getByLabelText('Sector')).toHaveValue('New Sector');

    fireEvent.mouseDown(screen.getByLabelText('Type of Bid'));
    fireEvent.click(screen.getByText('Item Rate'));
    expect(screen.getByLabelText('Type of Bid')).toHaveTextContent('Item Rate');
  });

  it('should update scoring criteria score and comments', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    const marketingPlanScoreSelect = screen.getAllByLabelText('Score')[0];
    fireEvent.mouseDown(marketingPlanScoreSelect);
    fireEvent.click(screen.getByText('10 - Excellent'));
    expect(marketingPlanScoreSelect).toHaveTextContent('10 - Excellent');

    fireEvent.click(screen.getByRole('button', { name: 'Add Comments' }));
    const commentsInput = screen.getByLabelText('Comments/Actions');
    fireEvent.change(commentsInput, { target: { value: 'Some comments' } });
    expect(commentsInput).toHaveValue('Some comments');

    expect(screen.getByText('Total Score: 10')).toBeInTheDocument();
    expect(screen.getByText('Decision Status: NO GO')).toBeInTheDocument(); // Still NO GO as 10 < 50
  });

  it('should submit a new decision if no existing decisionId', async () => {
    mockGetByOpportunityId.mockResolvedValue(null); // Simulate no existing decision
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetScoringDescriptions).toHaveBeenCalled());

    // Update some fields to make it a valid submission
    fireEvent.change(screen.getByLabelText('Sector'), { target: { value: 'New Sector' } });
    fireEvent.mouseDown(screen.getByLabelText('Type of Bid'));
    fireEvent.click(screen.getByText('Item Rate'));
    fireEvent.mouseDown(screen.getAllByLabelText('Score')[0]);
    fireEvent.click(screen.getByText('10 - Excellent'));

    fireEvent.click(screen.getByRole('button', { name: 'Submit Decision' }));

    await waitFor(() => {
      expect(mockCreateGoNoGo).toHaveBeenCalledTimes(1);
      expect(mockCreateGoNoGo).toHaveBeenCalledWith(
        expect.objectContaining({
          HeaderInfo: expect.objectContaining({
            TypeOfBid: TypeOfBid.ItemRate,
            Sector: 'New Sector',
          }),
          Summary: expect.objectContaining({
            TotalScore: 10,
            Status: GoNoGoStatus.Red,
          }),
        })
      );
      expect(mockGetVersions).toHaveBeenCalledWith(1); // Called after creation
    });
  });

  it('should update an existing decision (BDM submits for RM approval)', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    fireEvent.mouseDown(screen.getAllByLabelText('Score')[0]);
    fireEvent.click(screen.getByText('10 - Excellent'));

    fireEvent.click(screen.getByRole('button', { name: 'Update Decision' }));

    await waitFor(() => {
      expect(mockCreateVersion).toHaveBeenCalledTimes(1);
      expect(mockCreateVersion).toHaveBeenCalledWith(
        1, // decisionId
        expect.objectContaining({
          goNoGoDecisionHeaderId: 1,
          versionNumber: 3, // Current version is RD_PENDING (version 3)
          status: GoNoGoVersionStatus.RD_PENDING, // BDM submits, so next is RM_PENDING
        })
      );
      expect(mockGetVersions).toHaveBeenCalledTimes(2); // Initial load + after update
    });
  });

  it('should call onDecisionStatusChange when RD approves', async () => {
    // Simulate RD role and RD_PENDING status
    localStorage.setItem('user', JSON.stringify({ roles: [{ name: 'Regional Director' }] }));
    mockGetVersions.mockResolvedValue([
      { ...mockInitialGoNoGoData, versionNumber: 3, status: GoNoGoVersionStatus.RD_PENDING, goNoGoDecisionHeaderId: 1 },
    ] as any);

    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    // Simulate RD approving
    fireEvent.click(screen.getByRole('button', { name: 'Approve' })); // This button is in GoNoGoApprovalStatus, mocked
    await waitFor(() => expect(mockApproveVersion).toHaveBeenCalledTimes(1));

    // Simulate the re-fetch after approval, with RD_APPROVED status
    mockGetVersions.mockResolvedValueOnce([
      { ...mockInitialGoNoGoData, versionNumber: 3, status: GoNoGoVersionStatus.RD_APPROVED, goNoGoDecisionHeaderId: 1, formData: JSON.stringify({ Summary: { TotalScore: 85, Status: GoNoGoStatus.Green } }) },
    ] as any);

    // Trigger the loadVersions callback that happens after approval
    await waitFor(() => expect(mockOnDecisionStatusChange).toHaveBeenCalledWith('GO', 3));
  });

  it('should disable header fields if not BDM_PENDING', async () => {
    mockGetVersions.mockResolvedValue([
      { ...mockInitialGoNoGoData, versionNumber: 2, status: GoNoGoVersionStatus.RM_PENDING },
    ] as any); // Simulate RM_PENDING status

    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    expect(screen.getByLabelText('Type of Bid')).toBeDisabled();
    expect(screen.getByLabelText('Sector')).toBeDisabled();
    expect(screen.getByLabelText('BD Head')).toBeDisabled();
    expect(screen.getByLabelText('Office')).toBeDisabled();
    expect(screen.getByText('Header information cannot be modified after submission.')).toBeInTheDocument();
  });

  it('should enable header fields if BDM_PENDING', async () => {
    mockGetVersions.mockResolvedValue([
      { ...mockInitialGoNoGoData, versionNumber: 1, status: GoNoGoVersionStatus.BDM_PENDING },
    ] as any); // Simulate BDM_PENDING status

    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    expect(screen.getByLabelText('Type of Bid')).toBeEnabled();
    expect(screen.getByLabelText('Sector')).toBeEnabled();
    expect(screen.getByLabelText('BD Head')).toBeEnabled();
    expect(screen.getByLabelText('Office')).toBeEnabled();
    expect(screen.queryByText('Header information cannot be modified after submission.')).not.toBeInTheDocument();
  });

  it('should display correct scoring descriptions based on score', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    const marketingPlanScoreSelect = screen.getAllByLabelText('Score')[0]; // Marketing Plan
    fireEvent.mouseDown(marketingPlanScoreSelect);
    fireEvent.click(screen.getByText('10 - Excellent')); // Score 10 (high)

    expect(screen.getByText('High marketing plan')).toHaveStyle('font-weight: bold');
    expect(screen.getByText('High marketing plan')).toHaveStyle('color: #4caf50');

    fireEvent.mouseDown(marketingPlanScoreSelect);
    fireEvent.click(screen.getByText('6 - Good')); // Score 6 (medium)

    expect(screen.getByText('Medium marketing plan')).toHaveStyle('font-weight: bold');
    expect(screen.getByText('Medium marketing plan')).toHaveStyle('color: #ff9800');

    fireEvent.mouseDown(marketingPlanScoreSelect);
    fireEvent.click(screen.getByText('3 - Poor')); // Score 3 (low)

    expect(screen.getByText('Low marketing plan')).toHaveStyle('font-weight: bold');
    expect(screen.getByText('Low marketing plan')).toHaveStyle('color: #f44336');
  });

  it('should toggle comments section visibility', async () => {
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    const addCommentsButton = screen.getAllByRole('button', { name: 'Add Comments' })[0];
    fireEvent.click(addCommentsButton);
    expect(screen.getByLabelText('Comments/Actions')).toBeInTheDocument();

    fireEvent.click(addCommentsButton);
    expect(screen.queryByLabelText('Comments/Actions')).not.toBeInTheDocument();
  });

  it('should display error if loading scoring descriptions fails', async () => {
    mockGetScoringDescriptions.mockRejectedValue(new Error('Failed to fetch descriptions'));
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);

    await waitFor(() => {
      expect(screen.getAllByText('No scoring descriptions available for Marketing Plan')[0]).toBeInTheDocument();
    });
  });

  it('should display error if loading initial Go/No Go data fails', async () => {
    mockGetByOpportunityId.mockRejectedValue(new Error('Failed to fetch Go/No Go data'));
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);

    await waitFor(() => {
      expect(screen.getByText('Error loading Go/No Go decision:')).toBeInTheDocument(); // Check for console error output
    });
  });

  it('should display error if submitting decision fails', async () => {
    mockCreateVersion.mockRejectedValue(new Error('Submission failed'));
    render(<GoNoGoForm onDecisionStatusChange={mockOnDecisionStatusChange} />);
    await waitFor(() => expect(mockGetByOpportunityId).toHaveBeenCalled());

    fireEvent.mouseDown(screen.getAllByLabelText('Score')[0]);
    fireEvent.click(screen.getByText('10 - Excellent'));
    fireEvent.click(screen.getByRole('button', { name: 'Update Decision' }));

    await waitFor(() => {
      expect(screen.getByText('Error saving go/no-go decision:')).toBeInTheDocument(); // Check for console error output
    });
  });
});
