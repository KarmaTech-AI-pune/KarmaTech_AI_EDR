
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectInitializationDialog } from './ProjectInitializationDialog';
import { opportunityApi } from '../../services/opportunityApi';
import { getUsersByRole } from '../../services/userApi';

// Mock dependencies
vi.mock('../../../services/opportunityApi', () => ({
  opportunityApi: {
    getOpportunityByStatus: vi.fn(),
  },
}));

vi.mock('../../../services/userApi', () => ({
  getUsersByRole: vi.fn(),
}));

// Mock ProjectInitForm
vi.mock('../../forms/ProjectInitForm', () => ({
  default: ({ onSubmit, onCancel, project }: any) => (
    <div data-testid="project-init-form">
      Project Form
      {project && <span data-testid="imported-project-name">{project.name}</span>}
      <button onClick={() => onSubmit({ name: 'Submitted Project' })}>Submit Form</button>
      <button onClick={onCancel}>Cancel Form</button>
    </div>
  ),
}));

describe('ProjectInitializationDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onProjectCreated: vi.fn(),
  };

  const mockOpportunities = [
    {
      id: 1,
      workName: 'Test Work',
      client: 'Client A',
      notes: 'Some notes',
      operation: 'Office A',
      clientSector: 'Public',
      capitalValue: 50000,
      likelyStartDate: '2025-01-01T00:00:00Z',
      currency: 'USD',
      approvalManagerId: 'user1',
      contractType: 'Lump Sum',
      fundingStream: 'Direct'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (opportunityApi.getOpportunityByStatus as any).mockResolvedValue(mockOpportunities);
    (getUsersByRole as any).mockImplementation((role: string) => {
      if (role === 'Project Manager') return Promise.resolve([{ id: 'pm1', name: 'PM One' }]);
      if (role === 'Senior Project Manager') return Promise.resolve([{ id: 'spm1', name: 'SPM One' }]);
      if (role === 'Regional Manager') return Promise.resolve([{ id: 'rm1', name: 'RM One' }]);
      if (role === 'Regional Director') return Promise.resolve([{ id: 'rd1', name: 'RD One' }]);
      return Promise.resolve([]);
    });
  });

  it('renders correctly and fetches required data', async () => {
    render(<ProjectInitializationDialog {...defaultProps} />);

    expect(screen.getByText('Initialize New Project')).toBeInTheDocument();
    expect(screen.getByLabelText('I agree that Letter of Acceptance was received.')).toBeInTheDocument();

    await waitFor(() => {
      expect(opportunityApi.getOpportunityByStatus).toHaveBeenCalledWith(3);
      expect(getUsersByRole).toHaveBeenCalledWith('Project Manager');
      expect(getUsersByRole).toHaveBeenCalledWith('Senior Project Manager');
    });
  });

  it('shows tabs when acceptance checkbox is checked', async () => {
    render(<ProjectInitializationDialog {...defaultProps} />);

    // Initially tabs should not be visible
    expect(screen.queryByText('Import from Business Development')).not.toBeInTheDocument();

    const checkbox = screen.getByLabelText('I agree that Letter of Acceptance was received.');
    fireEvent.click(checkbox);

    expect(screen.getByText('Import from Business Development')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('handles selecting and importing an opportunity', async () => {
    render(<ProjectInitializationDialog {...defaultProps} />);

    // Check acceptance
    fireEvent.click(screen.getByLabelText('I agree that Letter of Acceptance was received.'));

    // Wait for opportunities to load
    await waitFor(() => {
      expect(opportunityApi.getOpportunityByStatus).toHaveBeenCalled();
    });

    // Select the opportunity dropdown (MUI Select)
    const select = screen.getByLabelText('Select Project');
    fireEvent.mouseDown(select);

    const option = await screen.findByText('Test Work - Client A');
    fireEvent.click(option);

    // Import button should appear
    const importBtn = await screen.findByRole('button', { name: 'Import Project' });
    fireEvent.click(importBtn);

    // Form should appear with imported data
    expect(screen.getByTestId('project-init-form')).toBeInTheDocument();
    expect(screen.getByTestId('imported-project-name')).toHaveTextContent('Test Work');
  });

  it('submits form from "New Project" tab correctly', async () => {
    render(<ProjectInitializationDialog {...defaultProps} />);

    // Check acceptance
    fireEvent.click(screen.getByLabelText('I agree that Letter of Acceptance was received.'));

    // Switch to New Project tab
    fireEvent.click(screen.getByText('New Project'));

    expect(screen.getByTestId('project-init-form')).toBeInTheDocument();

    // Submit form
    fireEvent.click(screen.getByText('Submit Form'));

    await waitFor(() => {
      expect(defaultProps.onProjectCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Submitted Project',
          letterOfAcceptance: true
        })
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it('clears state when closed', async () => {
    render(<ProjectInitializationDialog {...defaultProps} />);

    // Check acceptance
    fireEvent.click(screen.getByLabelText('I agree that Letter of Acceptance was received.'));
    expect(screen.getByText('Import from Business Development')).toBeInTheDocument();

    // Switch to New Project tab to reveal form
    fireEvent.click(screen.getByText('New Project'));

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText('Cancel Form')).toBeInTheDocument();
    });

    // Verify onClose is called
    fireEvent.click(screen.getByText('Cancel Form'));

    await waitFor(() => {
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
