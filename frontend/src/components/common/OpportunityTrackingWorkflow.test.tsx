import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OpportunityTrackingWorkflow } from './OpportunityTrackingWorkflow';
import { projectManagementAppContext } from '../../App';
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpportunityHistory } from '../../models/opportunityHistoryModel';
import { OpportunityTracking } from '../../models';

// Define types for dialog props
interface DialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  onDecisionMade?: () => void;
  currentUser?: string;
  opportunityId?: number;
  onReviewSent?: () => void;
}

// Mock the dialog components
vi.mock('../dialogbox', () => ({
  SendForReview: ({ open, onClose, onSubmit }: DialogProps) => 
    open ? <div data-testid="send-for-review-dialog">
      <button onClick={() => onSubmit && onSubmit()}>Submit</button>
      <button onClick={() => onClose()}>Cancel</button>
    </div> : null,
  DecideReview: ({ open, onClose, onDecisionMade }: DialogProps) => 
    open ? <div data-testid="decide-review-dialog">
      <button onClick={() => onDecisionMade && onDecisionMade()}>Approve</button>
      <button onClick={() => onClose()}>Cancel</button>
    </div> : null,
  SendForApproval: ({ open, onClose, onSubmit }: DialogProps) => 
    open ? <div data-testid="send-for-approval-dialog">
      <button onClick={() => onSubmit && onSubmit()}>Submit</button>
      <button onClick={() => onClose()}>Cancel</button>
    </div> : null,
  DecideApproval: ({ open, onClose, onSubmit }: DialogProps) => 
    open ? <div data-testid="decide-approval-dialog">
      <button onClick={() => onSubmit && onSubmit()}>Approve</button>
      <button onClick={() => onClose()}>Cancel</button>
    </div> : null,
}));

// Mock the workflow status API
vi.mock('../../dummyapi/database/dummyOpporunityWorkflow', () => ({
  getWorkflowStatusById: vi.fn(),
  default: [] // Mock the default export (workflowData)
}));

describe('OpportunityTrackingWorkflow Component - Edge Cases and Error Handling', () => {
  // Mock context values
  const defaultContextValue = {
    screenState: 'opportunity',
    setScreenState: vi.fn(),
    isAuthenticated: true,
    setIsAuthenticated: vi.fn(),
    user: {
      id: 'user1',
      name: 'Test User',
      userName: 'testuser',
      email: 'test@example.com',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString()
    },
    setUser: vi.fn(),
    handleLogout: vi.fn(),
    selectedProject: null,
    setSelectedProject: vi.fn(),
    currentGoNoGoDecision: null,
    setCurrentGoNoGoDecision: vi.fn(),
    goNoGoDecisionStatus: null,
    setGoNoGoDecisionStatus: vi.fn(),
    goNoGoVersionNumber: null,
    setGoNoGoVersionNumber: vi.fn(),
    currentUser: {
      id: 'user1',
      name: 'Test User',
      email: 'test@example.com',
      userName: 'testuser',
      roles: [],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: 'role1',
        name: 'Test Role',
        permissions: []
      }
    },
    setCurrentUser: vi.fn(),
    canEditOpportunity: true,
    setCanEditOpportunity: vi.fn(),
    canDeleteOpportunity: true,
    setCanDeleteOpportunity: vi.fn(),
    canSubmitForReview: true,
    setCanSubmitForReview: vi.fn(),
    canReviewBD: true,
    setCanReviewBD: vi.fn(),
    canApproveBD: true,
    setCanApproveBD: vi.fn(),
    canSubmitForApproval: true,
    setCanSubmitForApproval: vi.fn(),
    // Add missing properties for project workflow
    canProjectSubmitForReview: true,
    setProjectCanSubmitForReview: vi.fn(),
    canProjectSubmitForApproval: true,
    setProjectCanSubmitForApproval: vi.fn(),
    canProjectCanApprove: true,
    setProjectCanApprove: vi.fn()
  };

  // Sample opportunity data with proper OpportunityHistory
  const sampleOpportunityHistory: OpportunityHistory = {
    id: 1,
    opportunityId: 1,
    statusId: 1,
    status: 'Initial',
    action: 'Create',
    assignedToId: 'user1',
    date: '2025-03-15',
    description: 'Initial creation'
  };

  // Create a complete OpportunityTracking object with required fields
  const sampleOpportunity = {
    id: 1,
    workName: 'Test Project',
    client: 'Test Client',
    currentHistory: sampleOpportunityHistory
  } as OpportunityTracking;

  // Helper function to render with context
  const renderWithContext = (
    opportunity = sampleOpportunity,
    contextValue = defaultContextValue,
    onOpportunityUpdated = vi.fn()
  ) => {
    return render(
      <projectManagementAppContext.Provider value={contextValue}>
        <OpportunityTrackingWorkflow 
          opportunity={opportunity} 
          onOpportunityUpdated={onOpportunityUpdated}
        />
      </projectManagementAppContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation for getWorkflowStatusById
    vi.mocked(getWorkflowStatusById).mockReturnValue({
      id: 1,
      status: 'Initial'
    });
  });

  // EDGE CASE: Missing currentHistory
  it('handles missing currentHistory gracefully', () => {
    // Create opportunity without currentHistory
    const opportunityWithoutHistory = {
      id: 1,
      workName: 'Test Project',
      client: 'Test Client'
    } as OpportunityTracking;

    // Should render without crashing
    renderWithContext(opportunityWithoutHistory);
    
    // Button should still be visible if permissions allow
    expect(screen.getByText('Send for Review')).toBeInTheDocument();
  });

  // EDGE CASE: currentHistory as array
  it('handles currentHistory as array', () => {
    // Create opportunity with currentHistory as array
    const opportunityWithHistoryArray = {
      id: 1,
      workName: 'Test Project',
      client: 'Test Client',
      currentHistory: [sampleOpportunityHistory]
    } as OpportunityTracking;

    renderWithContext(opportunityWithHistoryArray);
    
    // Button should be visible with correct text
    expect(screen.getByText('Send for Review')).toBeInTheDocument();
  });

  // EDGE CASE: Empty currentHistory array
  it('handles empty currentHistory array', () => {
    // Create opportunity with empty currentHistory array
    const opportunityWithEmptyHistoryArray = {
      id: 1,
      workName: 'Test Project',
      client: 'Test Client',
      currentHistory: [] as OpportunityHistory[]
    } as OpportunityTracking;

    renderWithContext(opportunityWithEmptyHistoryArray);
    
    // Button should still be visible if permissions allow
    expect(screen.getByText('Send for Review')).toBeInTheDocument();
  });

  // ERROR HANDLING: onOpportunityUpdated throws error
  it('handles error in onOpportunityUpdated', async () => {
    // Mock Initial status
    vi.mocked(getWorkflowStatusById).mockReturnValue({
      id: 1,
      status: 'Initial'
    });

    // Mock onOpportunityUpdated to throw error
    const onOpportunityUpdated = vi.fn().mockRejectedValue(new Error('Update failed'));

    // Spy on console.error to prevent test output pollution
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithContext(sampleOpportunity, defaultContextValue, onOpportunityUpdated);

    // Click button to open dialog
    fireEvent.click(screen.getByText('Send for Review'));

    // Dialog should be rendered
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();

    // Click submit button and handle potential errors
    await fireEvent.click(screen.getByText('Submit'));

    // Wait for async operations to complete with a longer timeout
    await waitFor(() => {
      expect(onOpportunityUpdated).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Check if console.error was called with the error message
    expect(consoleSpy).toHaveBeenCalledWith(new Error('Update failed'));

    // Component should not crash and dialog should be closed
    expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();

    // Button should still be visible
    expect(screen.getByText('Send for Review')).toBeInTheDocument();

    // Restore console.error
    consoleSpy.mockRestore();
  });

  // EDGE CASE: Dialog cancellation
  it('handles dialog cancellation correctly', async () => {
    // Mock Initial status
    vi.mocked(getWorkflowStatusById).mockReturnValue({
      id: 1,
      status: 'Initial'
    });

    const onOpportunityUpdated = vi.fn();

    renderWithContext(sampleOpportunity, defaultContextValue, onOpportunityUpdated);

    // Click button to open dialog
    fireEvent.click(screen.getByText('Send for Review'));

    // Dialog should be rendered
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText('Cancel'));

    // Dialog should be closed
    expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();

    // onOpportunityUpdated should not be called
    expect(onOpportunityUpdated).not.toHaveBeenCalled();
  });
});
