import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
// import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectDetails, { useProjectDetailsContext, getProjectTitle } from './ProjectDetails';
import { useProject } from '../../context/ProjectContext';
import { projectApi } from '../../services/projectApi';
import { getUserById } from '../../services/userApi';
import {  useOutletContext, MemoryRouter } from 'react-router-dom';
import { Project } from '../../models';
import { ProjectStatus } from '../../models/types';

// Mock the external dependencies
vi.mock('../../context/ProjectContext');
vi.mock('../../services/projectApi');
vi.mock('../../services/userApi');
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<any>('react-router-dom'),
  Outlet: vi.fn(() => <div data-testid="outlet" />),
  useOutletContext: vi.fn(),
}));

const mockUseProject = useProject as any;
const mockProjectApiGetById = projectApi.getById as any;
const mockGetUserById = getUserById as any;
const mockUseOutletContext = useOutletContext as any;

describe('ProjectDetails Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProject: Project = {
    id: '1',
    projectNo: 'P1',
    name: 'Test Project',
    projectManagerId: 'pm1',
    seniorProjectManagerId: 'spm1',
    regionalManagerId: 'rm1',
    status: ProjectStatus.InProgress,
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    estimatedProjectCost: 100000,
    estimatedProjectFee: 20000,
    currency: 'USD',
    feeType: 'Fixed',
    sector: 'IT',
    priority: 'High',
    clientName: 'Test Client',
    typeOfClient: 'Private',
    region: 'Global',
    office: 'Headquarters',
    typeOfJob: 'Dev',
    letterOfAcceptance: true,
    updatedAt: '2023-01-01',
    details: 'A test project description',
    opportunityTrackingId: 1,
  } as unknown as Project;

  beforeEach(() => {
    vi.clearAllMocks();
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
    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should display an error message if fetching project data fails', async () => {
    mockProjectApiGetById.mockRejectedValueOnce(new Error('Network error'));
    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument());
  });

  test('should display a warning if no project ID is provided', async () => {
    mockUseProject.mockReturnValue({ projectId: null });
    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('No project selected')).toBeInTheDocument();
    });
  });

  test('should display a warning if project is not found', async () => {
    mockProjectApiGetById.mockResolvedValueOnce(null);
    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Project not found')).toBeInTheDocument();
    });
  });

  test('should display project title and manager names on successful data fetch', async () => {
    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );

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
    const projectWithoutManagers: any = {
      ...mockProject,
      projectManagerId: undefined,
      seniorProjectManagerId: null,
      regionalManagerId: undefined,
    };
    mockProjectApiGetById.mockResolvedValueOnce(projectWithoutManagers);

    render(
      <MemoryRouter>
        <ProjectDetails />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    expect(mockGetUserById).not.toHaveBeenCalledWith(undefined);
    expect(mockGetUserById).not.toHaveBeenCalledWith(null);
  });

  test('getProjectTitle should return project name if available', () => {
    const projectWithName = { name: 'Project A', id: '1', projectNo: 'P1', typeOfJob: 'Dev', sector: 'IT', priority: 'High', clientName: 'C', typeOfClient: 'P', region: 'R', office: 'O', projectManagerId: 'pm', seniorProjectManagerId: 'spm', regionalManagerId: 'rm', estimatedProjectCost: 1, estimatedProjectFee: 1, currency: 'USD', feeType: 'F', startDate: 'S', endDate: 'E', status: ProjectStatus.InProgress, letterOfAcceptance: true, createdAt: 'C', updatedAt: 'U' } as unknown as Project;
    expect(getProjectTitle(projectWithName)).toBe('Project A');
  });

  test('getProjectTitle should return workName if name is not available', () => {
    const projectWithWorkName = { workName: 'Work B' } as any;
    expect(getProjectTitle(projectWithWorkName)).toBe('Work B');
  });

  test('getProjectTitle should return "Project Details" if neither name nor workName are available', () => {
    const projectWithoutNameOrWorkName = { id: '1' } as any;
    expect(getProjectTitle(projectWithoutNameOrWorkName)).toBe('Project Details');
  });

  test('getProjectTitle should return "Project Details" for null project', () => {
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

    render(
      <MemoryRouter>
        <TestComponent />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });
});






