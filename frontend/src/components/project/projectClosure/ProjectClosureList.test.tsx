import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProjectClosureList from './ProjectClosureList';
import * as projectClosureApi from '../../../services/projectClosureApi';

vi.mock('../../../services/projectClosureApi', () => ({
  getAllProjectClosures: vi.fn(),
  deleteProjectClosure: vi.fn(),
}));

describe('ProjectClosureList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup window.confirm mock
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders loading state initially', () => {
    (projectClosureApi.getAllProjectClosures as any).mockReturnValue(new Promise(() => {}));
    render(<ProjectClosureList />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders empty state when no closures exist', async () => {
    (projectClosureApi.getAllProjectClosures as any).mockResolvedValue([]);
    render(<ProjectClosureList />);
    
    await waitFor(() => {
      expect(screen.getByText('No Project Closure Forms Found')).toBeInTheDocument();
    });
  });

  it('renders a list of project closures', async () => {
    const mockClosures = [
      { id: 1, projectId: 101, createdAt: '2023-01-01T12:00:00Z', clientFeedback: 'Great job!' },
      { id: 2, projectId: 102, createdAt: '2023-01-02T12:00:00Z', clientFeedback: 'Needs improvement' },
    ];
    (projectClosureApi.getAllProjectClosures as any).mockResolvedValue(mockClosures);

    render(<ProjectClosureList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Project ID: 101/)).toBeInTheDocument();
      expect(screen.getByText(/Great job!/)).toBeInTheDocument();
      expect(screen.getByText(/Project ID: 102/)).toBeInTheDocument();
    });
  });

  it('handles delete action', async () => {
    const mockClosures = [
      { id: 1, projectId: 101, createdAt: '2023-01-01T12:00:00Z' },
    ];
    (projectClosureApi.getAllProjectClosures as any).mockResolvedValue(mockClosures);
    (projectClosureApi.deleteProjectClosure as any).mockResolvedValue({});

    render(<ProjectClosureList />);
    
    await waitFor(() => {
      expect(screen.getByText(/Project ID: 101/)).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this project closure?');
    
    await waitFor(() => {
      expect(projectClosureApi.deleteProjectClosure).toHaveBeenCalledWith(1);
    });
  });
});
