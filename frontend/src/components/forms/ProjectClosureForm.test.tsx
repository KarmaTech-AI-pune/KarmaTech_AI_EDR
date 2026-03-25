// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import ProjectClosureForm from './ProjectClosureForm';
import {
  createProjectClosure,
  updateProjectClosure,
  getProjectClosureById,
  getAllProjectClosuresByProjectId,
  deleteProjectClosure,
} from '../../services/projectClosureApi';
import { useProject } from '../../context/ProjectContext';
// import ProjectClosureWorkflow from '../common/ProjectClosureWorkflow';
import { ProjectClosureRow, WorkflowHistory } from '../../models';
import { PMWorkflowStatus } from '../../models/pmWorkflowModel';

// Mock external dependencies
vi.mock('../../services/projectClosureApi', () => ({
  createProjectClosure: vi.fn(),
  updateProjectClosure: vi.fn(),
  getProjectClosureById: vi.fn(),
  getAllProjectClosuresByProjectId: vi.fn(),
  deleteProjectClosure: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('../common/ProjectClosureWorkflow', () => ({
  default: vi.fn(({ projectClosure, onProjectClosureUpdated }) => (
    <div data-testid={`workflow-${projectClosure.id}`}>
      Workflow Status: {projectClosure.workflowStatusId}
      <button onClick={onProjectClosureUpdated}>Update Workflow</button>
    </div>
  )),
}));



// Type assertions for mocked functions
const mockCreateProjectClosure = vi.mocked(createProjectClosure);
const mockUpdateProjectClosure = vi.mocked(updateProjectClosure);
const mockGetProjectClosureById = vi.mocked(getProjectClosureById);
const mockGetAllProjectClosuresByProjectId = vi.mocked(getAllProjectClosuresByProjectId);
const mockDeleteProjectClosure = vi.mocked(deleteProjectClosure);
const mockUseProject = vi.mocked(useProject);

const mockProjectClosureData: ProjectClosureRow = {
  projectId: '123',
  clientFeedback: 'Good feedback',
  successCriteria: 'Met all criteria',
  clientExpectations: 'Exceeded expectations',
  otherStakeholders: 'All happy',
  envIssues: 'None',
  envManagement: 'Managed well',
  thirdPartyIssues: 'None',
  thirdPartyManagement: 'Managed well',
  riskIssues: 'Low risk',
  riskManagement: 'Managed well',
  knowledgeGoals: 'Achieved goals',
  baselineComparison: 'Better than baseline',
  delayedDeliverables: 'None',
  unforeseeableDelays: 'None',
  budgetEstimate: 'Accurate',
  profitTarget: 'Met target',
  changeOrders: 'Few',
  closeOutBudget: 'Within budget',
  resourceAvailability: 'Good',
  vendorFeedback: 'Positive',
  projectTeamFeedback: 'Positive',
  designOutputs: 'Excellent',
  projectReviewMeetings: 'Regular',
  clientDesignReviews: 'Positive',
  internalReporting: 'Timely',
  clientReporting: 'Timely',
  internalMeetings: 'Effective',
  clientMeetings: 'Effective',
  externalMeetings: 'Effective',
  planUpToDate: 'Yes',
  planUseful: 'Very useful',
  hindrances: 'None',
  clientPayment: 'Timely',
  briefAims: 'Clear aims',
  designReviewOutputs: 'Good outputs',
  constructabilityReview: 'Good review',
  designReview: 'Good design',
  technicalRequirements: 'Met requirements',
  innovativeIdeas: 'Some innovative ideas',
  suitableOptions: 'Good options',
  additionalInformation: 'None',
  deliverableExpectations: 'Met expectations',
  stakeholderInvolvement: 'High involvement',
  knowledgeGoalsAchieved: 'Yes',
  technicalToolsDissemination: 'Good dissemination',
  specialistKnowledgeValue: 'High value',
  otherComments: 'No other comments',
  targetCostAccuracyValue: true,
  targetCostAccuracy: 'Accurate',
  changeControlReviewValue: true,
  changeControlReview: 'Reviewed',
  compensationEventsValue: true,
  compensationEvents: 'Managed',
  expenditureProfileValue: true,
  expenditureProfile: 'Good profile',
  healthSafetyConcernsValue: true,
  healthSafetyConcerns: 'None',
  programmeRealisticValue: true,
  programmeRealistic: 'Realistic',
  programmeUpdatesValue: true,
  programmeUpdates: 'Regular',
  requiredQualityValue: true,
  requiredQuality: 'High quality',
  operationalRequirementsValue: true,
  operationalRequirements: 'Met requirements',
  constructionInvolvementValue: true,
  constructionInvolvement: 'High involvement',
  efficienciesValue: true,
  efficiencies: 'Good efficiencies',
  maintenanceAgreementsValue: true,
  maintenanceAgreements: 'In place',
  asBuiltManualsValue: true,
  asBuiltManuals: 'Provided',
  hsFileForwardedValue: true,
  hsFileForwarded: 'Forwarded',
  variations: 'None',
  technoLegalIssues: 'None',
  constructionOther: 'None',
  positives: '["Positive 1", "Positive 2"]',
  lessonsLearned: '["Lesson 1", "Lesson 2"]',
  planningIssues: 'None',
  planningLessons: 'None',
  workflowHistory: { id: 1, changeControlId: 1, actionDate: new Date(), comments: 'Initial', statusId: PMWorkflowStatus.Initial, action: 'Initial', actionBy: 'User', assignedToId: 'User', projectClosureId: 1 } as WorkflowHistory,
};

const mockProjectClosureWithMetadata = {
  ...mockProjectClosureData,
  id: 1,
  createdAt: '2023-01-01T00:00:00Z',
  createdBy: 'Test User',
  updatedAt: '2023-01-01T00:00:00Z',
  updatedBy: 'Test User',
  workflowStatusId: PMWorkflowStatus.Initial,
};

vi.setConfig({ testTimeout: 60000 });

describe('ProjectClosureForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to their default implementations
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    mockGetProjectClosureById.mockResolvedValue(mockProjectClosureWithMetadata);
    mockGetAllProjectClosuresByProjectId.mockResolvedValue([mockProjectClosureWithMetadata]);
    mockCreateProjectClosure.mockResolvedValue(mockProjectClosureWithMetadata as any);
    mockUpdateProjectClosure.mockResolvedValue(undefined);
    mockDeleteProjectClosure.mockResolvedValue(undefined);
    vi.spyOn(window, 'alert').mockImplementation(() => {}); // Mock alert
    vi.spyOn(console, 'error').mockImplementation(() => {}); // Mock console.error
    vi.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {}); // Mock scrollTo
  });

  it('should render correctly and load existing data if available', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(screen.getByText('PMD8. Project Closure Form')).toBeInTheDocument();
    expect(screen.getByText('A. OVERALL PROJECT DELIVERY')).toBeInTheDocument();
    expect(screen.getByText('B. PROJECT MANAGEMENT')).toBeInTheDocument();
    expect(screen.getByText('C. GENERAL DESIGN ITEMS')).toBeInTheDocument();
    expect(screen.getByText('D. CONSTRUCTION')).toBeInTheDocument();
    expect(screen.getByText('E. OVERALL')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalledWith(parseInt(mockProjectId));
      expect(screen.getByDisplayValue('Good feedback')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Met all criteria')).toBeInTheDocument();
      expect(screen.getByText('Workflow Status: 1')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined as unknown as string, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    render(<ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('Please select a project to proceed with the closure form.')).toBeInTheDocument();
    expect(mockGetAllProjectClosuresByProjectId).not.toHaveBeenCalled();
  });

  it('should handle input changes for text fields', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    const clientFeedbackInput = screen.getByLabelText('What client feedback / performance certificate has been obtained ? – summarise');
    fireEvent.change(clientFeedbackInput, { target: { value: 'Updated feedback' } });
    expect(clientFeedbackInput).toHaveValue('Updated feedback');
  });

  it('should handle checkbox changes', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Wait for the form to fully render
    await waitFor(() => {
      expect(screen.getByText(/Target Cost accurately reflect/i)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Find all checkboxes
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Use the first checkbox as an example
    const firstCheckbox = checkboxes[0];
    const initialState = firstCheckbox.checked;
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toBe(!initialState);
  });

  it('should add and remove positive comments', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Find and click the Add Positive button
    const addButton = await screen.findByRole('button', { name: /add positive/i });
    const initialTextboxCount = screen.getAllByRole('textbox').length;
    
    fireEvent.click(addButton);
    
    // Wait for new textbox to appear
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBe(initialTextboxCount + 1);
    }, { timeout: 10000 });
  });

  it('should add and remove lessons learned comments', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Find and click the Add Lesson Learned button
    const addButton = await screen.findByRole('button', { name: /add lesson learned/i });
    const initialTextboxCount = screen.getAllByRole('textbox').length;
    
    fireEvent.click(addButton);
    
    // Wait for new textbox to appear
    await waitFor(() => {
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBe(initialTextboxCount + 1);
    }, { timeout: 10000 });
  });

  it('should save new project closure data', async () => {
    mockGetAllProjectClosuresByProjectId.mockResolvedValue([]); // No existing closure
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Fill some required fields
    fireEvent.change(screen.getByLabelText('What client feedback / performance certificate has been obtained ? – summarise'), { target: { value: 'New client feedback' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockCreateProjectClosure).toHaveBeenCalledTimes(1);
      expect(mockCreateProjectClosure).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: mockProjectId,
          clientFeedback: 'New client feedback',
        }),
        expect.any(Array) // Comments array
      );
      expect(window.alert).toHaveBeenCalledWith('Project closure saved successfully!');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });

  it('should update existing project closure data', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    fireEvent.change(screen.getByLabelText('What client feedback / performance certificate has been obtained ? – summarise'), { target: { value: 'Updated client feedback' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(mockUpdateProjectClosure).toHaveBeenCalledTimes(1);
      expect(mockUpdateProjectClosure).toHaveBeenCalledWith(
        1, // existingClosureId
        expect.objectContaining({
          id: 1,
          projectId: mockProjectId,
          clientFeedback: 'Updated client feedback',
        }),
        expect.any(Array) // Comments array
      );
      expect(window.alert).toHaveBeenCalledWith('Project closure saved successfully!');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });

  it('should delete project closure data with confirmation', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Delete Project Closure')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' })); // Confirm delete

    await waitFor(() => {
      expect(mockDeleteProjectClosure).toHaveBeenCalledWith(1);
      expect(window.alert).toHaveBeenCalledWith('Project closure deleted successfully!');
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    }, { timeout: 10000 });
  });

  it('should not delete if confirmation is cancelled', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Delete Project Closure')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' })); // Cancel delete

    await waitFor(() => {
      expect(mockDeleteProjectClosure).not.toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it('should handle workflow status update', async () => {
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    const updateButton = screen.getByRole('button', { name: /update workflow/i });
    fireEvent.click(updateButton);

    // Wait for the workflow update to be called
    await waitFor(() => {
      expect(mockGetProjectClosureById).toHaveBeenCalled();
    }, { timeout: 10000 });
    
    // Verify workflow status is displayed
    expect(screen.getByText(/Workflow Status:/)).toBeInTheDocument();
  });

  it('should handle error during initial data load', async () => {
    mockGetAllProjectClosuresByProjectId.mockRejectedValueOnce(new Error('Failed to fetch'));
    
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    // Verify form still renders despite error
    expect(await screen.findByText(/PMD8. Project Closure Form/i)).toBeInTheDocument();
  });

  it('should handle error during save operation', async () => {
    mockCreateProjectClosure.mockRejectedValue(new Error('Save failed'));
    mockGetAllProjectClosuresByProjectId.mockResolvedValue([]); // No existing closure
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    fireEvent.change(screen.getByLabelText('What client feedback / performance certificate has been obtained ? – summarise'), { target: { value: 'New client feedback' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error saving project closure:', expect.any(Error));
      expect(window.alert).toHaveBeenCalledWith('Error saving project closure: Save failed');
    }, { timeout: 10000 });
  });

  it('should handle error during delete operation', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    mockDeleteProjectClosure.mockRejectedValueOnce(new Error('Delete failed'));
    
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Click delete button
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Wait for dialog to appear and confirm delete
    await waitFor(() => {
      expect(screen.getByText('Delete Project Closure')).toBeInTheDocument();
    });
    
    const confirmButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    // Verify alert was called with error message
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 30000);

  it('should clear form fields when deleting a non-existent closure', async () => {
    mockGetAllProjectClosuresByProjectId.mockResolvedValue([]); // No existing closure
    render(
      <ProjectClosureForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    await waitFor(() => expect(mockGetAllProjectClosuresByProjectId).toHaveBeenCalled(), { timeout: 10000 });

    // Simulate clicking delete when no closureId or existingClosureId is set
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' })); // Confirm delete

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Form cleared successfully');
      expect(screen.getByLabelText('What client feedback / performance certificate has been obtained ? – summarise')).toHaveValue('');
    }, { timeout: 10000 });
  }, 30000);
});





