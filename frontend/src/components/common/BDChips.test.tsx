// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BDChips } from './BDChips';
import * as opportunityWorkflowApi from '../../dummyapi/opportunityWorkflowApi';
import { WorkflowEntry } from '../../models/workflowEntryModel';

// Mock the API call using vi.mock
vi.mock('../../dummyapi/opportunityWorkflowApi');

const mockGetWorkflowByOpportunityId = opportunityWorkflowApi.getWorkflowByOpportunityId as import('vitest').Mock;

describe('BDChips', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default inactive state when no workflow data', async () => {
    // Arrange
    mockGetWorkflowByOpportunityId.mockResolvedValue(undefined);
    const opportunityId = 1;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(mockGetWorkflowByOpportunityId).toHaveBeenCalledWith(opportunityId);
    });

    expect(screen.getByText('FB01 Opportunity Tracking')).toBeInTheDocument();
    expect(screen.getByText('FB02 Go/NoGo')).toBeInTheDocument();
    expect(screen.getByText('FB03 Bid Preparation')).toBeInTheDocument();

    // All should be inactive (default color)
    const labels = ['FB01 Opportunity Tracking', 'FB02 Go/NoGo', 'FB03 Bid Preparation'];
    labels.forEach(label => {
      const chip = screen.getByText(label).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorDefault');
    });
  });

  it('renders correctly for "opportunityTracking" formStage', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '1',
      opportunityId: 1,
      formStage: 'opportunityTracking',
      workflowId: 'wf1',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 1;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(mockGetWorkflowByOpportunityId).toHaveBeenCalledWith(opportunityId);
    });

    expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // Pending
    expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault'); // Inactive
    expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault'); // Inactive
  });

  it('renders correctly for "goNoGo" formStage', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '2',
      opportunityId: 2,
      formStage: 'goNoGo',
      workflowId: 'wf2',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 2;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(mockGetWorkflowByOpportunityId).toHaveBeenCalledWith(opportunityId);
    });

    expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // Pending
    expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault'); // Inactive
  });

  it('renders correctly for "bidPreparation" formStage', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '3',
      opportunityId: 3,
      formStage: 'bidPreparation',
      workflowId: 'wf3',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 3;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(mockGetWorkflowByOpportunityId).toHaveBeenCalledWith(opportunityId);
    });

    expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorWarning'); // Pending
  });

  it('renders correctly for "bidSubmitted" formStage (all completed)', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '4',
      opportunityId: 4,
      formStage: 'bidSubmitted',
      workflowId: 'wf4',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 4;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    });
  });

  it('renders correctly for "bidAccepted" formStage (all completed)', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '5',
      opportunityId: 5,
      formStage: 'bidAccepted',
      workflowId: 'wf5',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 5;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    });
  });

  it('renders correctly for "bidRejected" formStage (all completed)', async () => {
    // Arrange
    const mockWorkflow: WorkflowEntry = {
      id: '6',
      opportunityId: 6,
      formStage: 'bidRejected',
      workflowId: 'wf6',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    };
    mockGetWorkflowByOpportunityId.mockResolvedValue(mockWorkflow);
    const opportunityId = 6;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText('FB01 Opportunity Tracking').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB02 Go/NoGo').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
      expect(screen.getByText('FB03 Bid Preparation').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess'); // Completed
    });
  });

  it('handles API error gracefully', async () => {
    // Arrange
    console.error = vi.fn(); // Mock console.error to prevent test output clutter
    mockGetWorkflowByOpportunityId.mockRejectedValue(new Error('API Error'));
    const opportunityId = 999;

    // Act
    render(<BDChips opportunityId={opportunityId} />);

    // Assert
    await waitFor(() => {
      expect(mockGetWorkflowByOpportunityId).toHaveBeenCalledWith(opportunityId);
      expect(console.error).toHaveBeenCalledWith('Error fetching workflow data:', expect.any(Error));
    });

    // All chips should still render as inactive (default color)
    const labels = ['FB01 Opportunity Tracking', 'FB02 Go/NoGo', 'FB03 Bid Preparation'];
    labels.forEach(label => {
      const chip = screen.getByText(label).closest('.MuiChip-root');
      expect(chip).toHaveClass('MuiChip-colorDefault');
    });
  });
});
