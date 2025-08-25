import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectOverview from './ProjectOverview';
import { useProjectDetailsContext } from './ProjectDetails';
import { Project } from '../../models';
import { ProjectStatus } from '../../types/index'; // Import ProjectStatus

// Mock the useProjectDetailsContext hook
jest.mock('./ProjectDetails', () => ({
  ...jest.requireActual('./ProjectDetails'),
  useProjectDetailsContext: jest.fn(),
}));

const mockUseProjectDetailsContext = useProjectDetailsContext as jest.Mock;

describe('ProjectOverview Component', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    projectNo: 'PROJ-001',
    typeOfJob: 'Development',
    sector: 'IT',
    priority: 'High',
    clientName: 'Client A',
    typeOfClient: 'Enterprise',
    region: 'North America',
    office: 'New York',
    projectManagerId: 'pm1',
    seniorProjectManagerId: 'spm1',
    regionalManagerId: 'rm1',
    estimatedProjectCost: 500000,
    estimatedProjectFee: 100000,
    currency: 'USD',
    feeType: 'Fixed',
    startDate: '2023-01-15T00:00:00Z',
    endDate: '2023-12-31T00:00:00Z',
    status: ProjectStatus.InProgress,
    // Removed 'workName' as it's not in Project type
    // Removed 'budget', 'progress', 'lastUpdated', 'client', 'description', 'opportunityId', 'bidPreparationId', 'jobStartFormId', 'goNoGoDecisionId' as they are not in Project type
    createdAt: '2023-01-01T00:00:00Z', // Added required property
    updatedAt: '2023-01-01T00:00:00Z', // Added required property
    letterOfAcceptance: true, // Added required property
    details: 'Project details here', // Added missing optional property
    opportunityTrackingId: 123, // Added missing optional property
  };

  const mockManagerNames = {
    pm1: 'Project Manager One',
    spm1: 'Senior PM One',
    rm1: 'Regional Manager One',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProjectDetailsContext.mockReturnValue({
      project: mockProject,
      managerNames: mockManagerNames,
    });
  });

  test('should display all project information correctly', () => {
    render(<ProjectOverview />);

    // Project Information
    expect(screen.getByText('Project Information')).toBeInTheDocument();
    expect(screen.getByText('Project Number')).toBeInTheDocument();
    expect(screen.getByText('PROJ-001')).toBeInTheDocument();
    expect(screen.getByText('Type of Job')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Sector')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    // Client Information
    expect(screen.getByText('Client Information')).toBeInTheDocument();
    expect(screen.getByText('Client Name')).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText('Type of Client')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('Region')).toBeInTheDocument();
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('Office')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();

    // Management
    expect(screen.getByText('Management')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Project Manager One')).toBeInTheDocument();
    expect(screen.getByText('Senior Project Manager')).toBeInTheDocument();
    expect(screen.getByText('Senior PM One')).toBeInTheDocument();
    expect(screen.getByText('Regional Manager')).toBeInTheDocument();
    expect(screen.getByText('Regional Manager One')).toBeInTheDocument();

    // Financial Details
    expect(screen.getByText('Financial Details')).toBeInTheDocument();
    expect(screen.getByText('Estimated Project Cost')).toBeInTheDocument();
    expect(screen.getByText('$500,000.00')).toBeInTheDocument();
    expect(screen.getByText('Estimated Project Fee')).toBeInTheDocument();
    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
    expect(screen.getByText('Fee Type')).toBeInTheDocument();
    expect(screen.getByText('Fixed')).toBeInTheDocument();

    // Timeline
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('December 31, 2023')).toBeInTheDocument();
  });

  test('should display "Not specified" for missing project information', () => {
    const projectWithMissingInfo = {
      ...mockProject,
      projectNo: undefined,
      clientName: '',
      startDate: undefined,
    };
    mockUseProjectDetailsContext.mockReturnValue({
      project: projectWithMissingInfo,
      managerNames: mockManagerNames,
    });

    render(<ProjectOverview />);

    expect(screen.getAllByText('Not specified')).toHaveLength(2); // For Project Number and Start Date
  });

  test('should display "Not assigned" for missing manager IDs', () => {
    const projectWithMissingManagers = {
      ...mockProject,
      projectManagerId: undefined,
      seniorProjectManagerId: null,
      regionalManagerId: 'nonExistentId',
    };
    mockUseProjectDetailsContext.mockReturnValue({
      project: projectWithMissingManagers,
      managerNames: mockManagerNames, // Still provide mockManagerNames, but it won't have the IDs
    });

    render(<ProjectOverview />);

    expect(screen.getAllByText('Not assigned')).toHaveLength(3); // PM, SPM, RM
  });

  test('should correctly format currency values', () => {
    render(<ProjectOverview />);
    expect(screen.getByText('$500,000.00')).toBeInTheDocument();
    expect(screen.getByText('$100,000.00')).toBeInTheDocument();
  });

  test('should correctly format date values', () => {
    render(<ProjectOverview />);
    expect(screen.getByText('January 15, 2023')).toBeInTheDocument();
    expect(screen.getByText('December 31, 2023')).toBeInTheDocument();
  });
});
