
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkflowHistoryDisplay from '../WorkflowHistoryDisplay';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';
import { PMWorkflowStatus } from '../../../models/pmWorkflowModel';

// Mock Dependencies
vi.mock('../../../api/pmWorkflowApi', () => ({
  pmWorkflowApi: {
    getWorkflowHistory: vi.fn(),
  },
}));

describe('WorkflowHistoryDisplay', () => {
  const defaultProps = {
    entityId: 1,
    entityType: 'project'
  };

  const mockHistoryData = {
    currentStatusId: PMWorkflowStatus.SentForApproval,
    history: [
      {
        id: 1,
        actionDate: '2025-01-01T12:00:00Z',
        action: 'Created',
        statusId: PMWorkflowStatus.Initial,
        status: 'Initial',
        actionByName: 'John Doe',
        assignedToName: '',
        comments: 'Initial creation'
      },
      {
        id: 2,
        actionDate: '2025-01-02T12:00:00Z',
        action: 'Sent for Approval',
        statusId: PMWorkflowStatus.SentForApproval,
        status: 'Sent for Approval',
        actionByName: 'Jane Smith',
        assignedToName: 'Manager User',
        comments: 'Please approve'
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    (pmWorkflowApi.getWorkflowHistory as any).mockImplementation(() => new Promise(() => {}));
    
    render(<WorkflowHistoryDisplay {...defaultProps} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders workflow history data correctly', async () => {
    (pmWorkflowApi.getWorkflowHistory as any).mockResolvedValue(mockHistoryData);
    
    render(<WorkflowHistoryDisplay {...defaultProps} />);
    
    await waitFor(() => {
      // The current status should be displayed
      expect(screen.getAllByText(/Sent for Approval/).length).toBeGreaterThan(0);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Manager User')).toBeInTheDocument();
      expect(screen.getByText('Please approve')).toBeInTheDocument();
    });
  });

  it('renders error message if API fails', async () => {
    (pmWorkflowApi.getWorkflowHistory as any).mockRejectedValue(new Error('Network Error'));
    
    render(<WorkflowHistoryDisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load workflow history')).toBeInTheDocument();
    });
  });

  it('renders appropriate message for empty history', async () => {
    (pmWorkflowApi.getWorkflowHistory as any).mockResolvedValue({ currentStatusId: 0, history: [] });
    
    render(<WorkflowHistoryDisplay {...defaultProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('No workflow history available')).toBeInTheDocument();
    });
  });
});
