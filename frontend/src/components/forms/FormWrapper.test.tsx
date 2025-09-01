import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { FormWrapper } from './FormWrapper';
import { ProjectHeaderWidget } from '../widgets/ProjectHeaderWidget';
import { projectManagementAppContext } from '../../App';
import { Project } from '../../models/projectModel';
import { ProjectStatus } from '../../types'; // Import ProjectStatus

// Mock external dependencies
vi.mock('../widgets/ProjectHeaderWidget', () => ({
  ProjectHeaderWidget: vi.fn(({ project }) => (
    <div data-testid="project-header-widget">Project Header for {project.name}</div>
  )),
}));

vi.mock('../../App', () => ({
  projectManagementAppContext: React.createContext({
    selectedProject: undefined, // Default to no selected project
  }),
}));

// Type assertions for mocked functions
const mockProjectHeaderWidget = vi.mocked(ProjectHeaderWidget);

const mockProject: Project = {
  id: '1',
  name: 'Test Project',
  projectManagerId: 'pm1',
  seniorProjectManagerId: 'spm123',
  regionalManagerId: 'rm456',
  status: ProjectStatus.InProgress, // Use enum
  projectNo: 'TP-001',
  typeOfJob: 'Development',
  sector: 'IT',
  clientName: 'Test Client',
  typeOfClient: 'Enterprise',
  estimatedProjectCost: 100000,
  estimatedProjectFee: 20000,
  currency: 'USD',
  letterOfAcceptance: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  priority: 'High',
  region: 'North',
  office: 'Main',
  details: 'Project details',
  startDate: '2023-01-01T00:00:00Z',
  endDate: '2023-12-31T00:00:00Z',
  opportunityId: 123,
  opportunityTrackingId: 456,
  feeType: 'Fixed', // Added missing property
};

describe('FormWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children directly if no project is selected', () => {
    render(
      <projectManagementAppContext.Provider value={{ selectedProject: null } as any}>
        <FormWrapper>
          <div data-testid="child-content">Child Content</div>
        </FormWrapper>
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByTestId('project-header-widget')).not.toBeInTheDocument();
  });

  it('should render ProjectHeaderWidget and children if a project is selected', () => {
    render(
      <projectManagementAppContext.Provider value={{ selectedProject: mockProject } as any}>
        <FormWrapper>
          <div data-testid="child-content">Child Content</div>
        </FormWrapper>
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByTestId('project-header-widget')).toBeInTheDocument();
    expect(screen.getByText(`Project Header for ${mockProject.name}`)).toBeInTheDocument();
    expect(mockProjectHeaderWidget).toHaveBeenCalledWith({ project: mockProject }, {});
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should handle selectedProject being an OpportunityTracking object (not render ProjectHeaderWidget)', () => {
    const mockOpportunity = {
      id: 1,
      workName: 'Test Opportunity',
      // ... other OpportunityTracking properties
    };
    render(
      <projectManagementAppContext.Provider value={{ selectedProject: mockOpportunity } as any}>
        <FormWrapper>
          <div data-testid="child-content">Child Content</div>
        </FormWrapper>
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.queryByTestId('project-header-widget')).not.toBeInTheDocument();
  });
});
