import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { OpportunityForm } from './OpportunityForm';
import { projectManagementAppContext } from '../../App';
import { getUsersByRole } from '../../services/userApi';
import { OpportunityTracking } from '../../models';
import { AuthUser } from '../../models/userModel';

// Mock external dependencies
vi.mock('../../App', () => ({
  projectManagementAppContext: React.createContext({
    user: { id: 'user1', name: 'Test User' },
  }),
}));

vi.mock('../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
}));

// Type assertions for mocked functions
const mockGetUsersByRole = vi.mocked(getUsersByRole);

const mockBdManagers: AuthUser[] = [
  { id: 'bdm1', name: 'BDM One', userName: 'bdm1', email: 'bdm1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];
const mockRegionalManagers: AuthUser[] = [
  { id: 'rm1', name: 'RM One', userName: 'rm1', email: 'rm1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];
const mockRegionalDirectors: AuthUser[] = [
  { id: 'rd1', name: 'RD One', userName: 'rd1', email: 'rd1@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
];

const defaultOpportunity: OpportunityTracking = {
  id: 1,
  workName: 'New Project',
  client: 'Client Corp',
  clientSector: 'Tech',
  operation: 'Development',
  stage: 'A',
  strategicRanking: 'H',
  status: 'Bid Under Preparation',
  bidFees: 1000,
  emd: 50,
  formOfEMD: 'Bank Guarantee',
  currency: 'USD',
  capitalValue: 50000,
  dateOfSubmission: '2023-01-15T00:00:00Z',
  likelyStartDate: '2023-02-01T00:00:00Z',
  durationOfProject: 12,
  bidManagerId: 'bdm1',
  reviewManagerId: 'rm1',
  approvalManagerId: 'rd1',
  contactPersonAtClient: 'Client Contact',
  contractType: 'Lump Sum',
  fundingStream: 'Private Investment',
  percentageChanceOfProjectHappening: 80,
  percentageChanceOfNJSSuccess: 70,
  likelyCompetition: 'Competitor X',
  probableQualifyingCriteria: 'High experience',
  followUpComments: 'Follow up soon',
  notes: 'Important notes',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

describe('OpportunityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockImplementation((role) => {
      if (role === 'Business Development Manager') return Promise.resolve(mockBdManagers);
      if (role === 'Regional Manager') return Promise.resolve(mockRegionalManagers);
      if (role === 'Regional Director') return Promise.resolve(mockRegionalDirectors);
      return Promise.resolve([]);
    });
  });

  it('should render correctly with initial empty form data', async () => {
    render(<OpportunityForm onSubmit={vi.fn()} />);

    await waitFor(() => {
      expect(mockGetUsersByRole).toHaveBeenCalledWith('Business Development Manager');
      expect(mockGetUsersByRole).toHaveBeenCalledWith('Regional Manager');
      expect(mockGetUsersByRole).toHaveBeenCalledWith('Regional Director');
    });

    expect(screen.getByLabelText('Work Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Client')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Opportunity' })).toBeInTheDocument();
  });

  it('should pre-fill form with existing project data', async () => {
    render(<OpportunityForm onSubmit={vi.fn()} project={defaultOpportunity} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Work Name')).toHaveValue(defaultOpportunity.workName);
      expect(screen.getByLabelText('Client')).toHaveValue(defaultOpportunity.client);
      expect(screen.getByLabelText('BD Manager')).toHaveTextContent('BDM One');
      expect(screen.getByLabelText('Date of Submission')).toHaveValue('2023-01-15');
    });
    expect(screen.getByRole('button', { name: 'Update Opportunity' })).toBeInTheDocument();
  });

  it('should update form data on input change', async () => {
    render(<OpportunityForm onSubmit={vi.fn()} />);

    const workNameInput = screen.getByLabelText('Work Name');
    fireEvent.change(workNameInput, { target: { value: 'Updated Work Name' } });
    expect(workNameInput).toHaveValue('Updated Work Name');

    const clientInput = screen.getByTestId('client-input');
    fireEvent.change(clientInput, { target: { value: 'Updated Client' } });
    expect(clientInput).toHaveValue('Updated Client');

    const stageSelect = screen.getByTestId('stage-select');
    fireEvent.mouseDown(stageSelect);
    fireEvent.click(screen.getByText('B'));
    expect(stageSelect).toHaveTextContent('B');
  });

  it('should handle number input changes correctly', () => {
    render(<OpportunityForm onSubmit={vi.fn()} />);

    const bidFeesInput = screen.getByLabelText('Bid Fees');
    fireEvent.change(bidFeesInput, { target: { value: '123abc' } });
    expect(bidFeesInput).toHaveValue('123');

    fireEvent.change(bidFeesInput, { target: { value: '0' } });
    expect(bidFeesInput).toHaveValue('0');
  });

  it('should call onSubmit with current form data when submitted', async () => {
    const mockOnSubmit = vi.fn();
    render(<OpportunityForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText('Work Name'), { target: { value: 'New Project Name' } });
    fireEvent.change(screen.getByLabelText('Client'), { target: { value: 'New Client Name' } });
    fireEvent.change(screen.getByLabelText('Client Sector'), { target: { value: 'Finance' } });
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'Consulting' } });
    fireEvent.mouseDown(screen.getByTestId('stage-select'));
    fireEvent.click(screen.getByText('A'));
    fireEvent.mouseDown(screen.getByTestId('strategic-ranking-select'));
    fireEvent.click(screen.getByText('High'));
    fireEvent.mouseDown(screen.getByTestId('status-select'));
    fireEvent.click(screen.getByText('Bid Submitted'));
    fireEvent.change(screen.getByLabelText('Bid Fees'), { target: { value: '500' } });
    fireEvent.change(screen.getByLabelText('EMD'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Form of EMD'), { target: { value: 'Cash' } });
    fireEvent.mouseDown(screen.getByTestId('currency-select'));
    fireEvent.click(screen.getByText('USD'));
    fireEvent.change(screen.getByLabelText('Capital Value'), { target: { value: '10000' } });
    fireEvent.mouseDown(screen.getByTestId('bd-manager-select'));
    fireEvent.click(screen.getByText('BDM One'));
    fireEvent.mouseDown(screen.getByTestId('review-manager-select'));
    fireEvent.click(screen.getByText('RM One'));
    fireEvent.mouseDown(screen.getByTestId('approval-manager-select'));
    fireEvent.click(screen.getByText('RD One'));
    fireEvent.change(screen.getByLabelText('Date of Submission'), { target: { value: '2023-03-01' } });
    fireEvent.change(screen.getByLabelText('Likely Start Date'), { target: { value: '2023-04-01' } });
    fireEvent.change(screen.getByLabelText('Duration of Project (Months)'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Contact Person at Client'), { target: { value: 'Jane Doe' } });
    fireEvent.mouseDown(screen.getByTestId('contract-type-select'));
    fireEvent.click(screen.getByText('EPC'));
    fireEvent.mouseDown(screen.getByTestId('funding-stream-select'));
    fireEvent.click(screen.getByText('Government Budget'));
    fireEvent.change(screen.getByLabelText('Chance of Project Happening (%)'), { target: { value: '90' } });
    fireEvent.change(screen.getByLabelText('Chance of NJS Success (%)'), { target: { value: '85' } });
    fireEvent.change(screen.getByLabelText('Likely Competition'), { target: { value: 'Comp A' } });
    fireEvent.change(screen.getByLabelText('Probable Qualifying Criteria'), { target: { value: 'Criteria X' } });
    fireEvent.change(screen.getByLabelText('Follow Up Comments'), { target: { value: 'Follow up comment' } });
    fireEvent.change(screen.getByLabelText('Notes'), { target: { value: 'Some notes' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Opportunity' }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          workName: 'New Project Name',
          client: 'New Client Name',
          clientSector: 'Finance',
          operation: 'Consulting',
          stage: 'A',
          strategicRanking: 'H',
          status: 'Bid Submitted',
          bidFees: '500',
          emd: '25',
          formOfEMD: 'Cash',
          currency: 'USD',
          capitalValue: '10000',
          dateOfSubmission: '2023-03-01',
          likelyStartDate: '2023-04-01',
          durationOfProject: '6',
          bidManagerId: 'bdm1',
          reviewManagerId: 'rm1',
          approvalManagerId: 'rd1',
          contactPersonAtClient: 'Jane Doe',
          contractType: 'EPC',
          fundingStream: 'Government Budget',
          percentageChanceOfProjectHappening: '90',
          percentageChanceOfNJSSuccess: '85',
          likelyCompetition: 'Comp A',
          probableQualifyingCriteria: 'Criteria X',
          followUpComments: 'Follow up comment',
          notes: 'Some notes',
        })
      );
    });
  });

  it('should display error message if provided', () => {
    render(<OpportunityForm onSubmit={vi.fn()} error="Submission failed" />);
    expect(screen.getByText('Submission failed')).toBeInTheDocument();
  });

  it('should handle missing context.user gracefully', async () => {
    vi.mock('../../App', () => ({
      projectManagementAppContext: React.createContext({
        user: null,
      }),
    }));
    render(<OpportunityForm onSubmit={vi.fn()} />);
    // Expect no errors related to context.user and managers not being fetched
    await waitFor(() => {
      expect(screen.queryByText('Error fetching managers:')).not.toBeInTheDocument();
    });
  });
});
