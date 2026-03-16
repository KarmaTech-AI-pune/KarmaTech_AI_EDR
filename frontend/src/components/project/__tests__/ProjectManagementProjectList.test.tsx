import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProjectManagementProjectList } from '../ProjectManagementProjectList';
import { ProjectStatus } from '../../../types/index';

// Mock child components
vi.mock('../ProjectItem', () => ({
  ProjectItem: ({ project }: any) => <div data-testid={`project-item-${project.id}`}>{project.name}</div>
}));

vi.mock('../ProjectInitializationDialog', () => ({
  ProjectInitializationDialog: () => <div data-testid="initialization-dialog">Dialog</div>
}));

describe('ProjectManagementProjectList', () => {
  const mockProjects = [
    { id: '1', name: 'Project A', status: ProjectStatus.InProgress },
    { id: '2', name: 'Project B', status: ProjectStatus.Opportunity },
  ];

  it('renders empty message when no projects are provided', () => {
    render(<ProjectManagementProjectList projects={[]} />);
    expect(screen.getByText('No active projects found')).toBeInTheDocument();
  });

  it('renders a list of ProjectItems when projects are provided', () => {
    render(<ProjectManagementProjectList projects={mockProjects as any} />);
    
    expect(screen.getByTestId('project-item-1')).toBeInTheDocument();
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByTestId('project-item-2')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });

  it('renders the initialization dialog', () => {
    render(<ProjectManagementProjectList projects={[]} />);
    expect(screen.getByTestId('initialization-dialog')).toBeInTheDocument();
  });
});
