import { render, screen, waitFor } from '@testing-library/react';
import { BDChips } from './BDChips';
import { getWorkflowByOpportunityId } from '../../dummyapi/opportunityWorkflowApi';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the opportunityWorkflowApi
vi.mock('../../dummyapi/opportunityWorkflowApi', () => ({
  getWorkflowByOpportunityId: vi.fn()
}));

describe('BDChips Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all three workflow chips', async () => {
    // Mock workflow data
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'opportunityTracking',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Check that all three chips are rendered
    expect(screen.getByText('FB01 Opportunity Tracking')).toBeInTheDocument();
    expect(screen.getByText('FB02 Go/NoGo')).toBeInTheDocument();
    expect(screen.getByText('FB03 Bid Preparation')).toBeInTheDocument();
  });

  it('shows correct chip status for opportunityTracking stage', async () => {
    // Mock workflow data for opportunityTracking stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'opportunityTracking',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // First chip should be pending (warning color)
    expect(chips[0]).toHaveClass('MuiChip-colorWarning');
    
    // Second and third chips should be inactive (default color)
    expect(chips[1]).toHaveClass('MuiChip-colorDefault');
    expect(chips[2]).toHaveClass('MuiChip-colorDefault');
  });

  it('shows correct chip status for goNoGo stage', async () => {
    // Mock workflow data for goNoGo stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'goNoGo',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // First chip should be completed (success color)
    expect(chips[0]).toHaveClass('MuiChip-colorSuccess');
    
    // Second chip should be pending (warning color)
    expect(chips[1]).toHaveClass('MuiChip-colorWarning');
    
    // Third chip should be inactive (default color)
    expect(chips[2]).toHaveClass('MuiChip-colorDefault');
  });

  it('shows correct chip status for bidPreparation stage', async () => {
    // Mock workflow data for bidPreparation stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'bidPreparation',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // First and second chips should be completed (success color)
    expect(chips[0]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[1]).toHaveClass('MuiChip-colorSuccess');
    
    // Third chip should be pending (warning color)
    expect(chips[2]).toHaveClass('MuiChip-colorWarning');
  });

  it('shows all chips as completed for bidSubmitted stage', async () => {
    // Mock workflow data for bidSubmitted stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'bidSubmitted',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // All chips should be completed (success color)
    expect(chips[0]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[1]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[2]).toHaveClass('MuiChip-colorSuccess');
  });

  it('shows all chips as completed for bidAccepted stage', async () => {
    // Mock workflow data for bidAccepted stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'bidAccepted',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // All chips should be completed (success color)
    expect(chips[0]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[1]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[2]).toHaveClass('MuiChip-colorSuccess');
  });

  it('shows all chips as completed for bidRejected stage', async () => {
    // Mock workflow data for bidRejected stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'bidRejected',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // All chips should be completed (success color)
    expect(chips[0]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[1]).toHaveClass('MuiChip-colorSuccess');
    expect(chips[2]).toHaveClass('MuiChip-colorSuccess');
  });

  it('shows all chips as inactive for unknown stage', async () => {
    // Mock workflow data with unknown stage
    vi.mocked(getWorkflowByOpportunityId).mockResolvedValue({
      id: '1',
      opportunityId: 123,
      formStage: 'unknownStage',
      workflowId: 'workflow1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const { container } = render(<BDChips opportunityId={123} />);

    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });

    // Get all chips
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBe(3);

    // All chips should be inactive (default color)
    expect(chips[0]).toHaveClass('MuiChip-colorDefault');
    expect(chips[1]).toHaveClass('MuiChip-colorDefault');
    expect(chips[2]).toHaveClass('MuiChip-colorDefault');
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    vi.mocked(getWorkflowByOpportunityId).mockRejectedValue(new Error('API Error'));
    
    // Spy on console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<BDChips opportunityId={123} />);
    
    // Wait for the async operation to complete
    await waitFor(() => {
      expect(getWorkflowByOpportunityId).toHaveBeenCalledWith(123);
    });
    
    // Component should still render without crashing
    expect(screen.getByText('FB01 Opportunity Tracking')).toBeInTheDocument();
    
    // Restore console.error
    consoleSpy.mockRestore();
  });
});
