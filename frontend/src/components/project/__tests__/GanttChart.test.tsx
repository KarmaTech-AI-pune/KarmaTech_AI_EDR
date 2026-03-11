import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GanttChart } from '../GanttChart';
import { WBSStructureAPI } from '../../../features/wbs/services/wbsApi';
import { transformWbsToGantt } from '../../../features/wbs/utils/wbsToGantt';

// Mock dependencies
vi.mock('../../../features/wbs/services/wbsApi', () => ({
  WBSStructureAPI: {
    getProjectWBS: vi.fn()
  }
}));

vi.mock('../../../features/wbs/utils/wbsToGantt', () => ({
  transformWbsToGantt: vi.fn()
}));

// Mock wx-react-gantt to avoid actual rendering issues in jsdom
vi.mock('wx-react-gantt', () => ({
  Willow: ({ children }: { children: React.ReactNode }) => <div data-testid="willow-mock">{children}</div>,
  Gantt: () => <div data-testid="gantt-mock">Gantt Chart</div>
}));

describe('GanttChart', () => {
  const projectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Return a promise that doesn't resolve immediately to test loading state
    (WBSStructureAPI.getProjectWBS as any).mockImplementation(() => new Promise(() => {}));
    
    render(<GanttChart projectId={projectId} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders correctly with data', async () => {
    const mockWbsData = { tasks: [{ id: 1, name: 'Task 1' }] };
    const mockGanttData = {
      tasks: [{ id: 1, text: 'Task 1', start_date: '2023-01-01', duration: 5 }],
      links: []
    };

    (WBSStructureAPI.getProjectWBS as any).mockResolvedValue(mockWbsData);
    (transformWbsToGantt as any).mockReturnValue(mockGanttData);

    render(<GanttChart projectId={projectId} />);

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(WBSStructureAPI.getProjectWBS).toHaveBeenCalledWith(projectId);
    expect(transformWbsToGantt).toHaveBeenCalledWith(mockWbsData.tasks);
    expect(screen.getByTestId('willow-mock')).toBeInTheDocument();
    expect(screen.getByTestId('gantt-mock')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (WBSStructureAPI.getProjectWBS as any).mockRejectedValue(new Error('Network Error'));

    render(<GanttChart projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch WBS data.')).toBeInTheDocument();
    });
  });
});
