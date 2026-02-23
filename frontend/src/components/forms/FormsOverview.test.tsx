// import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import FormsOverview from './FormsOverview';
import { useProject } from '../../context/ProjectContext';
import { GanttChart } from '../project/GanttChart';

// Mock external dependencies
vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('../project/GanttChart', () => ({
  GanttChart: vi.fn(({ projectId }) => (
    <div data-testid="gantt-chart">Gantt Chart for Project: {projectId}</div>
  )),
}));

// Type assertions for mocked functions
const mockUseProject = vi.mocked(useProject);
const mockGanttChart = vi.mocked(GanttChart);

describe('FormsOverview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without GanttChart if projectId is null', () => {
    mockUseProject.mockReturnValue({ projectId: null, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    render(<FormsOverview onFormSelect={vi.fn()} />);

    expect(screen.queryByTestId('gantt-chart')).not.toBeInTheDocument();
  });

  it('should render GanttChart if projectId is present', () => {
    const mockProjectId = 'proj123';
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    render(<FormsOverview onFormSelect={vi.fn()} />);

    expect(screen.getByTestId('gantt-chart')).toBeInTheDocument();
    expect(screen.getByText(`Gantt Chart for Project: ${mockProjectId}`)).toBeInTheDocument();
    expect(mockGanttChart).toHaveBeenCalledWith({ projectId: mockProjectId }, {});
  });

  it('should pass onFormSelect prop without using it directly in rendering', () => {
    const mockOnFormSelect = vi.fn();
    mockUseProject.mockReturnValue({ projectId: null, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    render(<FormsOverview onFormSelect={mockOnFormSelect} />);

    // The onFormSelect prop is not directly rendered by FormsOverview,
    // so we just ensure it doesn't cause errors and is passed down if needed.
    // In this component, it's not used, so we just check for no errors.
    expect(mockOnFormSelect).not.toHaveBeenCalled();
  });
});

