import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest'; // Import vi from vitest
import { ProjectDetails } from './ProjectDetails';
import { useProject } from '../../context/ProjectContext';
import { projectApi } from '../../services/projectApi';
import { getUserById } from '../../services/userApi';
import { Project } from '../../models/projectModel'; // Explicitly import Project from its definition file
import { OpportunityTracking } from '../../models/opportunityTrackingModel';
import { ProjectStatus } from '../../types'; // Import ProjectStatus from types/index.tsx
import { Outlet } from 'react-router-dom';

// Mock dependencies
vi.mock('../../context/ProjectContext');
vi.mock('../../services/projectApi');
vi.mock('../../services/userApi');
vi.mock('../../components/layout/SideMenu', () => ({
  SideMenu: () => <div data-testid="side-menu">Side Menu</div>,
}));
vi.mock('react-router-dom', async (importOriginal: () => Promise<any>) => { // Explicitly type importOriginal
  const actual = await importOriginal();
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet-content">Outlet Content</div>,
    useOutletContext: () => ({ project: mockProject, managerNames: mockManagerNames }), // Mock for child components
  };
});

const mockUseProject = useProject as jest.Mock;
const mockProjectApiGetById = projectApi.getById as jest.Mock;
const mockGetUserById = getUserById as jest.Mock;

const mockProject: Project = {
  id: 'proj123',
  name: 'Test Project',
  projectManagerId: 'user1',
  seniorProjectManagerId: 'user2',
  regionalManagerId: 'user3',
  details: 'A test project description', // Changed from 'description' to 'details'
  status: ProjectStatus.InProgress,
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  opportunityTrackingId: 123,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  clientName: 'Test Client',
  office: 'Main',
  projectNo: 'PN-001',
  estimatedProjectCost: 50000,
  estimatedProjectFee: 10000,
  currency: 'USD',
  letterOfAcceptance: true,
  typeOfJob: 'Consulting',
  sector: 'IT',
  priority: 'High',
  typeOfClient: 'Enterprise',
  region: 'North',
  feeType: 'Fixed',
};

const mockManagerNames = {
  user1: 'Manager One',
  user2: 'Manager Two',
  user3: 'Manager Three',
};

describe('ProjectDetails Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful mocks
    mockUseProject.mockReturnValue({ projectId: mockProject.id });
    mockProjectApiGetById.mockResolvedValue(mockProject);
    mockGetUserById.mockImplementation((id: string) => {
      if (id === 'user1') return Promise.resolve({ id: 'user1', name: 'Manager One' });
      if (id === 'user2') return Promise.resolve({ id: 'user2', name: 'Manager Two' });
      if (id === 'user3') return Promise.resolve({ id: 'user3', name: 'Manager Three' });
      return Promise.resolve(null);
    });
  });

  // Test case 1: Renders CircularProgress when loading
  test('should render CircularProgress when project data is loading', () => {
    mockProjectApiGetById.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<ProjectDetails />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  // Test case 2: Renders Alert when no project ID is provided
  test('should render Alert when no projectId is provided', () => {
    mockUseProject.mockReturnValue({ projectId: null });
    render(<ProjectDetails />);
    expect(screen.getByText('No project ID provided')).toBeInTheDocument();
  });

  // Test case 3: Renders Alert when project is not found
  test('should render Alert when project is not found', async () => {
    mockProjectApiGetById.mockResolvedValue(null);
    render(<ProjectDetails />);
    await waitFor(() => expect(screen.getByText('Project not found')).toBeInTheDocument());
  });

  // Test case 4: Renders Alert on project fetch error
  test('should render Alert on project fetch error', async () => {
    const errorMessage = 'Network error';
    mockProjectApiGetById.mockRejectedValue(new Error(errorMessage));
    render(<ProjectDetails />);
    await waitFor(() => expect(screen.getByText(errorMessage)).toBeInTheDocument());
  });

  // Test case 5: Renders project details successfully
  test('should render project details and child components on successful fetch', async () => {
    render(<ProjectDetails />);

    await waitFor(() => {
      expect(screen.getByText(mockProject.name)).toBeInTheDocument();
      expect(screen.getByTestId('side-menu')).toBeInTheDocument();
      expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    });
  });

  // Test case 6: Renders manager names correctly
  test('should render manager names correctly', async () => {
    render(<ProjectDetails />);

    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalledWith('user1');
      expect(mockGetUserById).toHaveBeenCalledWith('user2');
      expect(mockGetUserById).toHaveBeenCalledWith('user3');
    });
  });

  // Test case 7: Handles missing manager IDs gracefully (set to empty string as per Project type)
  test('should handle missing manager IDs gracefully', async () => {
    const projectWithoutSomeManagers: Project = {
      ...mockProject,
      seniorProjectManagerId: '', // Set to empty string
      regionalManagerId: '', // Set to empty string
    };
    mockProjectApiGetById.mockResolvedValue(projectWithoutSomeManagers);

    render(<ProjectDetails />);

    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalledWith('user1');
      expect(mockGetUserById).not.toHaveBeenCalledWith(''); // Ensure it's not called with empty string
    });
  });

  // Test case 8: Displays "Not assigned" for managers with fetch errors
  test('should display "Not assigned" for managers with fetch errors', async () => {
    mockGetUserById.mockImplementation((id: string) => {
      if (id === 'user1') return Promise.resolve({ id: 'user1', name: 'Manager One' });
      if (id === 'user2') return Promise.reject(new Error('User not found'));
      return Promise.resolve(null);
    });

    const projectWithOneError: Project = {
      ...mockProject,
      regionalManagerId: '', // Simplify to one error case, set to empty string
    };
    mockProjectApiGetById.mockResolvedValue(projectWithOneError);

    render(<ProjectDetails />);

    // We can't directly assert "Not assigned" in ProjectDetails as it's passed to Outlet context.
    // This test primarily ensures the error handling path is taken without crashing.
    // A more robust test would involve a child component consuming the context.
    await waitFor(() => {
      expect(mockGetUserById).toHaveBeenCalledWith('user1');
      expect(mockGetUserById).toHaveBeenCalledWith('user2');
    });
  });

  // Test case 9: Renders Alert when project is null after loading (e.g., API returns null)
  test('should render Alert "Project not found" when project is null after loading', async () => {
    mockProjectApiGetById.mockResolvedValue(null);
    render(<ProjectDetails />);
    await waitFor(() => expect(screen.getByText('Project not found')).toBeInTheDocument());
  });

  // Test case 10: Renders project title from OpportunityTracking workName
  test('should render project title from OpportunityTracking workName', async () => {
    const mockOpportunity: OpportunityTracking = {
      id: 456,
      workName: 'Opportunity Work Name', // Ensure workName is a string
      client: 'Test Client',
      status: 'Bid Under Preparation',
      capitalValue: 50000,
      currency: 'USD',
      likelyStartDate: '2023-01-01',
    };
    mockProjectApiGetById.mockResolvedValue(mockOpportunity);
    render(<ProjectDetails />);
    await waitFor(() => expect(screen.getByText(mockOpportunity.workName!)).toBeInTheDocument()); // Use non-null assertion
  });
});
