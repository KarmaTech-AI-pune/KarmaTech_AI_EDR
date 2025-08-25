import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectDetails, useProjectDetailsContext } from './ProjectDetails';
import { useProject } from '../../context/ProjectContext';
import { projectApi } from '../../services/projectApi';
import { getUserById } from '../../services/userApi';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Project } from '../../models';

// Mock the external dependencies
jest.mock('../../context/ProjectContext');
jest.mock('../../services/projectApi');
jest.mock('../../services/userApi');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Outlet: jest.fn(() => <div data-testid="outlet" />),
  useOutletContext: jest.fn(),
}));

const mockUseProject = useProject as jest.Mock;
const mockProjectApiGetById = projectApi.getById as jest.Mock;
const mockGetUserById = getUserById as jest.Mock;
const mockUseOutletContext = useOutletContext as jest.Mock;

describe('ProjectDetails Component', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    projectManagerId: 'pm1',
    seniorProjectManagerId: 'spm1',
    regionalManagerId: 'rm1',
    workName: 'Test Work Name',
    status: 'Active',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    budget: 100000,
    currency: 'USD',
    progress: 50,
    lastUpdated: '2023-06-01',
    client: 'Test Client',
    description: 'A test project description',
    opportunityId: 'opp1',
    bidPreparationId: 'bid1',
    jobStartFormId: 'jsf1',
    goNoGoDecisionId: 'gng1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: '1' });
    mockProjectApiGetById.mockResolvedValue(mockProject);
    mockGetUserById.mockImplementation((id: string) => {
      if (id === 'pm1') return Promise.resolve({ id: 'pm1', name: 'Project Manager' });
      if (id === 'spm1') return Promise.resolve({ id: 'spm1', name: 'Senior Project Manager' });
      if (id === 'rm1') return Promise.resolve({ id: 'rm1', name: 'Regional Manager' });
      return Promise.resolve(null);
    });
    mockUseOutletContext.mockReturnValue({ project: mockProject, managerNames: {} });
  });

  test('should display a loading spinner when project data is being fetched', () => {
    mockProjectApiGetById.mockReturnValueOnce(new Promise(() => {})); // Never resolves
    render(<ProjectDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should display an error message if fetching project data fails', async () => {
    mockProjectApiGetById.mockRejectedValueOnce(new Error('Network error'));
    render(<ProjectDetails />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  test('should display a warning if no project ID is provided', async () => {
    mockUseProject.mockReturnValue({ projectId: null });
    render(<ProjectDetails />);
    await waitFor(() => {
      expect(screen.getByText('No project selected')).toBeInTheDocument();
    });
  });

  test('should display a warning if project is not found', async () => {
    mockProjectApiGetById.mockResolvedValueOnce(null);
    render(<ProjectDetails />);
    await waitFor(() => {
      expect(screen.getByText('Project not found')).toBeInTheDocument();
    });
  });

  test('should display project title and manager names on successful data fetch', async () => {
    render(<ProjectDetails />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalledWith('pm1');
      expect(mockGetUserById).toHaveBeenCalledWith('spm1');
      expect(mockGetUserById).toHaveBeenCalledWith('rm1');
    });

    // Check if SideMenu and Outlet are rendered
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  test('should handle cases where manager IDs are null or undefined', async () => {
    const projectWithoutManagers: Project = {
      ...mockProject,
      projectManagerId: undefined,
      seniorProjectManagerId: null,
      regionalManagerId: undefined,
    };
    mockProjectApiGetById.mockResolvedValueOnce(projectWithoutManagers);

    render(<ProjectDetails />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(mockGetUserById).not.toHaveBeenCalledWith(undefined);
    expect(mockGetUserById).not.toHaveBeenCalledWith(null);
  });

  test('getProjectTitle should return project name if available', () => {
    const { getProjectTitle } = require('./ProjectDetails'); // Import directly to test
    const projectWithName = { name: 'Project A' };
    expect(getProjectTitle(projectWithName)).toBe('Project A');
  });

  test('getProjectTitle should return workName if name is not available', () => {
    const { getProjectTitle } = require('./ProjectDetails');
    const projectWithWorkName = { workName: 'Work B' };
    expect(getProjectTitle(projectWithWorkName)).toBe('Work B');
  });

  test('getProjectTitle should return "Project Details" if neither name nor workName are available', () => {
    const { getProjectTitle } = require('./ProjectDetails');
    const projectWithoutNameOrWorkName = { id: '1' };
    expect(getProjectTitle(projectWithoutNameOrWorkName)).toBe('Project Details');
  });

  test('getProjectTitle should return "Project Details" for null project', () => {
    const { getProjectTitle } = require('./ProjectDetails');
    expect(getProjectTitle(null)).toBe('Project Details');
  });

  test('useProjectDetailsContext should return the context from Outlet', () => {
    const mockContextValue = { project: mockProject, managerNames: { pm1: 'Project Manager' } };
    mockUseOutletContext.mockReturnValue(mockContextValue);

    const TestComponent = () => {
      const context = useProjectDetailsContext();
      return (
        <div>
          <span>{context.project.name}</span>
          <span>{context.managerNames.pm1}</span>
        </div>
      );
    };

    render(<TestComponent />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });
});
