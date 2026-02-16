import React from 'react';
import { ProjectClosureWorkflow } from './ProjectClosureWorkflow';
import { projectManagementAppContext } from '../../App';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectClosureRow, WorkflowHistory } from '../../models/projectClosureRowModel';

// Mock the dialog components
vi.mock('../dialogbox/projectclosure', () => ({
  DecideApproval: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="decide-approval-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
  DecideReview: vi.fn(({ open, onClose, onDecisionMade }) => (
    open ? <div data-testid="decide-review-dialog"><button onClick={onClose}>Close</button><button onClick={() => onDecisionMade()}>Submit</button></div> : null
  )),
  SendForReview: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="send-for-review-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
  SendForApproval: vi.fn(({ open, onClose, onSubmit }) => (
    open ? <div data-testid="send-for-approval-dialog"><button onClick={onClose}>Close</button><button onClick={onSubmit}>Submit</button></div> : null
  )),
}));

const mockProjectClosure: ProjectClosureRow = {
  projectId: '101',
  clientFeedback: 'Good',
  successCriteria: 'Met',
  clientExpectations: 'Exceeded',
  otherStakeholders: 'None',
  envIssues: 'None',
  envManagement: 'Good',
  thirdPartyIssues: 'None',
  thirdPartyManagement: 'Good',
  riskIssues: 'None',
  riskManagement: 'Good',
  knowledgeGoals: 'Achieved',
  baselineComparison: 'On track',
  delayedDeliverables: 'None',
  unforeseeableDelays: 'None',
  budgetEstimate: 'Accurate',
  profitTarget: 'Met',
  changeOrders: 'None',
  closeOutBudget: 'Balanced',
  resourceAvailability: 'Good',
  vendorFeedback: 'Positive',
  projectTeamFeedback: 'Positive',
  designOutputs: 'Good',
  projectReviewMeetings: 'Regular',
  clientDesignReviews: 'Regular',
  internalReporting: 'Good',
  clientReporting: 'Good',
  internalMeetings: 'Regular',
  clientMeetings: 'Regular',
  externalMeetings: 'None',
  planUpToDate: 'Yes',
  planUseful: 'Yes',
  hindrances: 'None',
  clientPayment: 'Timely',
  briefAims: 'Clear',
  designReviewOutputs: 'Good',
  constructabilityReview: 'Yes',
  designReview: 'Good',
  technicalRequirements: 'Met',
  innovativeIdeas: 'None',
  suitableOptions: 'Yes',
  additionalInformation: 'None',
  deliverableExpectations: 'Met',
  stakeholderInvolvement: 'High',
  knowledgeGoalsAchieved: 'Yes',
  technicalToolsDissemination: 'Yes',
  specialistKnowledgeValue: 'High',
  otherComments: 'None',
  targetCostAccuracyValue: true,
  targetCostAccuracy: 'Accurate',
  changeControlReviewValue: true,
  changeControlReview: 'Good',
  compensationEventsValue: false,
  compensationEvents: 'None',
  expenditureProfileValue: true,
  expenditureProfile: 'Good',
  healthSafetyConcernsValue: false,
  healthSafetyConcerns: 'None',
  programmeRealisticValue: true,
  programmeRealistic: 'Yes',
  programmeUpdatesValue: true,
  programmeUpdates: 'Regular',
  requiredQualityValue: true,
  requiredQuality: 'Yes',
  operationalRequirementsValue: true,
  operationalRequirements: 'Met',
  constructionInvolvementValue: true,
  constructionInvolvement: 'High',
  efficienciesValue: true,
  efficiencies: 'Good',
  maintenanceAgreementsValue: true,
  maintenanceAgreements: 'Yes',
  asBuiltManualsValue: true,
  asBuiltManuals: 'Yes',
  hsFileForwardedValue: true,
  hsFileForwarded: 'Yes',
  variations: 'None',
  technoLegalIssues: 'None',
  constructionOther: 'None',
  workflowStatusId: 1,
  workflowHistory: {
    id: 1,
    projectClosureId: 1,
    actionDate: new Date('2025-03-15'),
    comments: 'Initial creation',
    statusId: 1,
    action: 'Create',
    actionBy: 'Test User',
    assignedToId: 'user1',
  } as WorkflowHistory,
};

const mockContext = {
  screenState: 'projectClosure',
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
  canProjectSubmitForReview: false, // Will be overridden in specific tests
  setProjectCanSubmitForReview: vi.fn(),
  canProjectSubmitForApproval: false, // Will be overridden in specific tests
  setProjectCanSubmitForApproval: vi.fn(),
  canProjectCanApprove: false, // Will be overridden in specific tests
  setProjectCanApprove: vi.fn()
};

describe('ProjectClosureWorkflow', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (
    projectClosure: ProjectClosureRow & { workflowStatusId?: number; id?: number; },
    contextOverrides?: Partial<typeof mockContext>,
    onProjectClosureUpdated?: (updatedClosure?: ProjectClosureRow) => void
  ) => {
    return render(
      <projectManagementAppContext.Provider value={{ ...mockContext, ...contextOverrides }}>
        <ProjectClosureWorkflow
          projectClosure={projectClosure}
          onProjectClosureUpdated={onProjectClosureUpdated}
        />
      </projectManagementAppContext.Provider>
    );
  };

  // Test Case 1: Initial render - Chip shown if no context or no permissions
  it('renders Chip with "Initial" status if no context or no permissions to show button', () => {
    renderComponent(mockProjectClosure, { canProjectSubmitForReview: false });
    expect(screen.getByText('Initial')).toBeInTheDocument(); // Query by text content for Chip
    expect(screen.queryByRole('button', { name: /Send for Review/i })).not.toBeInTheDocument();
  });

  // Test Case 2: Initial render - Chip shown if status is "Approved"
  it('renders Chip with "Approved" status if workflow status is "Approved"', () => {
    const approvedPC: ProjectClosureRow & { workflowStatusId?: number; id?: number; } = {
      ...mockProjectClosure,
      workflowStatusId: 6,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        id: mockProjectClosure.workflowHistory!.id,
        projectClosureId: mockProjectClosure.workflowHistory!.projectClosureId,
        statusId: 6,
        actionDate: new Date(),
        comments: 'Approved'
      } as WorkflowHistory,
    };
    renderComponent(approvedPC, { canProjectSubmitForReview: true });
    expect(screen.getByText('Approved')).toBeInTheDocument(); // Query by text content for Chip
    expect(screen.queryByRole('button', { name: /Send for Review/i })).not.toBeInTheDocument();
  });

  // Test Case 3: "Initial" status, canProjectSubmitForReview is true -> "Send for Review" button
  it('renders "Send for Review" button for "Initial" status if canProjectSubmitForReview', async () => {
    renderComponent(mockProjectClosure, { canProjectSubmitForReview: true });
    expect(screen.getByRole('button', { name: /Send for Review/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Initial')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });

  // Test Case 4: "Sent for Review" status, canProjectSubmitForApproval is true -> "Decide Review" button
  it('renders "Decide Review" button for "Sent for Review" status if canProjectSubmitForApproval', async () => {
    const sentForReviewPC: ProjectClosureRow & { workflowStatusId?: number; id?: number; } = {
      ...mockProjectClosure,
      workflowStatusId: 2,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        id: mockProjectClosure.workflowHistory!.id,
        projectClosureId: mockProjectClosure.workflowHistory!.projectClosureId,
        statusId: 2,
        actionDate: new Date(),
        comments: 'Sent for Review'
      } as WorkflowHistory,
    };
    renderComponent(sentForReviewPC, { canProjectSubmitForApproval: true });
    expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });

  // Test Case 5: "Sent for Approval" status, canProjectCanApprove is true -> "Decide Approval" button
  it('renders "Decide Approval" button for "Sent for Approval" status if canProjectCanApprove', async () => {
    const sentForApprovalPC: ProjectClosureRow & { workflowStatusId?: number; id?: number; } = {
      ...mockProjectClosure,
      workflowStatusId: 4,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        id: mockProjectClosure.workflowHistory!.id,
        projectClosureId: mockProjectClosure.workflowHistory!.projectClosureId,
        statusId: 4,
        actionDate: new Date(),
        comments: 'Sent for Approval'
      } as WorkflowHistory,
    };
    renderComponent(sentForApprovalPC, { canProjectCanApprove: true });
    expect(screen.getByRole('button', { name: /Decide Approval/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Sent for Approval')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });

  // Test Case 6: "Sent for Approval" status, canProjectCanApprove is false, canProjectSubmitForApproval is true -> Chip with "Sent for Approval"
  it('renders Chip with "Sent for Approval" status if canProjectSubmitForApproval but not canProjectCanApprove', () => {
    const sentForApprovalPC: ProjectClosureRow & { workflowStatusId?: number; id?: number; } = {
      ...mockProjectClosure,
      workflowStatusId: 4,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        id: mockProjectClosure.workflowHistory!.id,
        projectClosureId: mockProjectClosure.workflowHistory!.projectClosureId,
        statusId: 4,
        actionDate: new Date(),
        comments: 'Sent for Approval'
      } as WorkflowHistory,
    };
    renderComponent(sentForApprovalPC, { canProjectCanApprove: false, canProjectSubmitForApproval: true });
    expect(screen.getByText('Sent for Approval')).toBeInTheDocument(); // Expect Chip
    expect(screen.queryByRole('button', { name: /Send for Approval/i })).not.toBeInTheDocument(); // Ensure Button is not rendered
  });

  // Test Case 7: Clicking "Send for Review" button opens SendForReview dialog
  it('clicking "Send for Review" button opens SendForReview dialog', async () => {
    renderComponent(mockProjectClosure, { canProjectSubmitForReview: true });
    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();
  });

  // Test Case 8: Dialog close with success updates status and renders "Decide Review" button
  it('dialog close with success updates status and renders "Decide Review" button', async () => {
    const onProjectClosureUpdated = vi.fn((updatedClosure) => {
      // Simulate the parent component updating the projectClosure prop
      // The component will re-render with the new status
      if (updatedClosure) {
        mockProjectClosure.workflowHistory = {
          ...mockProjectClosure.workflowHistory!,
          statusId: 2, // Status changed to "Sent for Review"
        };
      }
    });
    
    const { rerender } = renderComponent(mockProjectClosure, { canProjectSubmitForReview: true, canProjectSubmitForApproval: true }, onProjectClosureUpdated);

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit/i })); // Click the submit button in the mock dialog

    await waitFor(() => {
      expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();
    });
    expect(onProjectClosureUpdated).toHaveBeenCalledTimes(1);
    
    // Simulate parent component re-rendering with updated status
    const updatedProjectClosure = {
      ...mockProjectClosure,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        statusId: 2, // Status changed to "Sent for Review"
      }
    };
    
    rerender(
      <projectManagementAppContext.Provider value={{ ...mockContext, canProjectSubmitForReview: true, canProjectSubmitForApproval: true }}>
        <ProjectClosureWorkflow
          projectClosure={updatedProjectClosure}
          onProjectClosureUpdated={onProjectClosureUpdated}
        />
      </projectManagementAppContext.Provider>
    );
    
    // After successful update and re-render, status becomes "Sent for Review" (id 2).
    // With canProjectSubmitForApproval: true, it should show "Decide Review" button.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    });
    await waitFor(() => expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });

  // Test Case 9: `onProjectClosureUpdated` error handling
  it('logs error if onProjectClosureUpdated fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onProjectClosureUpdated = vi.fn(() => { throw new Error('Update failed'); });
    const { rerender } = renderComponent(mockProjectClosure, { canProjectSubmitForReview: true, canProjectSubmitForApproval: true }, onProjectClosureUpdated);

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(new Error('Update failed'));
    });
    consoleErrorSpy.mockRestore();
    
    // Simulate parent component re-rendering with updated status (even though callback threw error)
    const updatedProjectClosure = {
      ...mockProjectClosure,
      workflowHistory: {
        ...mockProjectClosure.workflowHistory!,
        statusId: 2, // Status changed to "Sent for Review"
      }
    };
    
    rerender(
      <projectManagementAppContext.Provider value={{ ...mockContext, canProjectSubmitForReview: true, canProjectSubmitForApproval: true }}>
        <ProjectClosureWorkflow
          projectClosure={updatedProjectClosure}
          onProjectClosureUpdated={onProjectClosureUpdated}
        />
      </projectManagementAppContext.Provider>
    );
    
    // Even with error, localStatusId updates. With canProjectSubmitForApproval: true, it should show "Decide Review" button.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Decide Review/i })).toBeInTheDocument();
    });
    await waitFor(() => expect(screen.queryByText('Sent for Review')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });

  // Test Case 10: Dialog cancellation
  it('handles dialog cancellation correctly', async () => {
    const onProjectClosureUpdated = vi.fn();
    renderComponent(mockProjectClosure, { canProjectSubmitForReview: true }, onProjectClosureUpdated);

    fireEvent.click(screen.getByRole('button', { name: /Send for Review/i }));
    fireEvent.click(screen.getByText('Close')); // Click the close button in the mock dialog

    expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();
    expect(onProjectClosureUpdated).not.toHaveBeenCalled();
    // Status remains "Initial". With canProjectSubmitForReview: true, it should still show "Send for Review" button.
    expect(screen.getByRole('button', { name: /Send for Review/i })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Initial')).not.toBeInTheDocument()); // Ensure Chip is not rendered
  });
});





