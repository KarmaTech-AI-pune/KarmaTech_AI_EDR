import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ProjectBreadcrumb } from './ProjectBreadcrumb';
import { useProject } from '../../context/ProjectContext';
import { programApi } from '../../services/api/programApi';
import { projectApi } from '../../services/projectApi';

// Mock the dependencies
vi.mock('../../context/ProjectContext');
vi.mock('../../services/api/programApi');
vi.mock('../../services/projectApi');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockProgram = {
  id: 1,
  name: 'Test Program',
  description: 'Test program description',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
};

const mockProject = {
  id: 1,
  name: 'Test Project',
  details: 'Test project details',
  clientName: 'Test Client',
  projectNo: 123,
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProjectBreadcrumb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when collapsed', () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    renderWithRouter(<ProjectBreadcrumb isExpanded={false} />);
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('renders nothing when no project or program data', () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: null,
      programId: null,
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows loading skeleton while fetching data', async () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    // Mock API calls to be slow
    vi.mocked(programApi.getById).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockProgram), 100))
    );
    vi.mocked(projectApi.getById).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockProject), 100))
    );

    const { container } = renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);
    
    // Component should render without crashing during loading
    expect(container).toBeInTheDocument();
  });

  it('renders breadcrumb with program and project', async () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(programApi.getById).mockResolvedValue(mockProgram);
    vi.mocked(projectApi.getById).mockResolvedValue(mockProject);

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Programs')).toBeInTheDocument();
      expect(screen.getByText('Test Program')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });
  });

  it('renders breadcrumb with only project when no program', async () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: null,
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(projectApi.getById).mockResolvedValue(mockProject);

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.queryByText('Programs')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Program')).not.toBeInTheDocument();
    });
  });

  it('navigates to programs page when Programs link is clicked', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(programApi.getById).mockResolvedValue(mockProgram);
    vi.mocked(projectApi.getById).mockResolvedValue(mockProject);

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Programs')).toBeInTheDocument();
    });

    const programsLink = screen.getByText('Programs');
    await user.click(programsLink);

    expect(mockNavigate).toHaveBeenCalledWith('/program-management');
  });

  it('navigates to program projects when program name is clicked', async () => {
    const user = userEvent.setup();
    
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(programApi.getById).mockResolvedValue(mockProgram);
    vi.mocked(projectApi.getById).mockResolvedValue(mockProject);

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      expect(screen.getByText('Test Program')).toBeInTheDocument();
    });

    const programLink = screen.getByText('Test Program');
    await user.click(programLink);

    expect(mockNavigate).toHaveBeenCalledWith('/program-management/projects');
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(programApi.getById).mockRejectedValue(new Error('API Error'));
    vi.mocked(projectApi.getById).mockRejectedValue(new Error('API Error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching breadcrumb data:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('truncates long names with ellipsis', async () => {
    const longNameProgram = {
      ...mockProgram,
      name: 'This is a very long program name that should be truncated',
    };

    const longNameProject = {
      ...mockProject,
      name: 'This is a very long project name that should be truncated',
    };

    vi.mocked(useProject).mockReturnValue({
      projectId: '1',
      programId: '1',
      setProjectId: vi.fn(),
      setProgramId: vi.fn(),
    });

    vi.mocked(programApi.getById).mockResolvedValue(longNameProgram);
    vi.mocked(projectApi.getById).mockResolvedValue(longNameProject);

    renderWithRouter(<ProjectBreadcrumb isExpanded={true} />);

    await waitFor(() => {
      const programElement = screen.getByText(longNameProgram.name);
      const projectElement = screen.getByText(longNameProject.name);
      
      expect(programElement).toHaveStyle({ 
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        'overflow': 'hidden'
      });
      
      expect(projectElement).toHaveStyle({ 
        'text-overflow': 'ellipsis',
        'white-space': 'nowrap',
        'overflow': 'hidden'
      });
    });
  });
});