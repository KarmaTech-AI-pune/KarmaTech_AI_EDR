import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ChangeControlForm from './ChangeControlForm';
import { ChangeControl } from '../../models';

import {
  getChangeControlsByProjectId,
  createChangeControl,
  updateChangeControl,
  deleteChangeControl
} from '../../api/changeControlApi';
import { useProject } from '../../context/ProjectContext';

// Mock external dependencies
vi.mock('../../api/changeControlApi', () => ({
  getChangeControlsByProjectId: vi.fn(),
  createChangeControl: vi.fn(),
  updateChangeControl: vi.fn(),
  deleteChangeControl: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('./ChangeControlcomponents/ChangeControlDialog', () => ({
  ChangeControlDialog: vi.fn(({ open, onClose, onSave, editData }) => (
    <div data-testid="change-control-dialog">
      {open && (
        <div>
          <span>Change Control Dialog</span>
          <button onClick={() => onSave(editData || { /* mock new data */ })}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  )),
}));

vi.mock('../common/ChangeControlWorkflow', () => ({
  default: vi.fn(({ changeControl, onChangeControlUpdated }) => (
    <div data-testid={`workflow-${changeControl.id}`}>
      Workflow for {changeControl.srNo}
      <button onClick={onChangeControlUpdated}>Update Workflow</button>
    </div>
  )),
}));

// Type assertions for mocked functions
const mockGetChangeControlsByProjectId = vi.mocked(getChangeControlsByProjectId);
const mockCreateChangeControl = vi.mocked(createChangeControl);
const mockUpdateChangeControl = vi.mocked(updateChangeControl);
const mockDeleteChangeControl = vi.mocked(deleteChangeControl);
const mockUseProject = vi.mocked(useProject);

const mockChangeControls: ChangeControl[] = [
  {
    id: 1,
    projectId: 123,
    srNo: 1,
    dateLogged: '2023-01-01T00:00:00Z',
    originator: 'John Doe',
    description: 'Initial change request',
    costImpact: 'Low',
    timeImpact: 'None',
    resourcesImpact: 'None',
    qualityImpact: 'None',
    changeOrderStatus: 'Pending',
    clientApprovalStatus: 'Pending',
    claimSituation: 'No',
  },
  {
    id: 2,
    projectId: 123,
    srNo: 2,
    dateLogged: '2023-01-05T00:00:00Z',
    originator: 'Jane Smith',
    description: 'Second change request',
    costImpact: 'Medium',
    timeImpact: 'Medium',
    resourcesImpact: 'High',
    qualityImpact: 'Low',
    changeOrderStatus: 'Approved',
    clientApprovalStatus: 'Approved',
    claimSituation: 'Yes',
  },
];

describe('ChangeControlForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn() });
    mockGetChangeControlsByProjectId.mockResolvedValue(mockChangeControls);
    mockCreateChangeControl.mockImplementation(async (projectId, data) => ({
      ...data,
      id: Math.floor(Math.random() * 1000), // Simulate new numeric ID
      projectId: parseInt(projectId as string),
      srNo: data.srNo || 1, // Ensure srNo is present
      dateLogged: data.dateLogged || new Date().toISOString(),
      originator: data.originator || '',
      description: data.description || '',
      costImpact: data.costImpact || '',
      timeImpact: data.timeImpact || '',
      resourcesImpact: data.resourcesImpact || '',
      qualityImpact: data.qualityImpact || '',
      changeOrderStatus: data.changeOrderStatus || '',
      clientApprovalStatus: data.clientApprovalStatus || '',
      claimSituation: data.claimSituation || '',
    }));
    mockUpdateChangeControl.mockImplementation(async (projectId, id, data) => ({
      ...data,
      id: id as number, // Cast id to number
      projectId: parseInt(projectId as string),
      srNo: data.srNo || 1,
      dateLogged: data.dateLogged || new Date().toISOString(),
      originator: data.originator || '',
      description: data.description || '',
      costImpact: data.costImpact || '',
      timeImpact: data.timeImpact || '',
      resourcesImpact: data.resourcesImpact || '',
      qualityImpact: data.qualityImpact || '',
      changeOrderStatus: data.changeOrderStatus || '',
      clientApprovalStatus: data.clientApprovalStatus || '',
      claimSituation: data.claimSituation || '',
    }));
    mockDeleteChangeControl.mockResolvedValue(undefined);
  });

  it('should render correctly and load change controls', async () => {
    render(<ChangeControlForm />);

    expect(screen.getByText('PMD6. Change Control Register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Change Control' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetChangeControlsByProjectId).toHaveBeenCalledWith(mockProjectId);
      expect(screen.getByText(/#1/)).toBeInTheDocument();
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Initial change request/i)).toBeInTheDocument();
      expect(screen.getByText(/#2/)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Second change request/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined, setProjectId: vi.fn(), programId: 'p1', setProgramId: vi.fn() } as any);
    render(<ChangeControlForm />);
    expect(screen.getByTestId('no-project-alert')).toBeInTheDocument();
    expect(screen.getByText(/Please select a project/i)).toBeInTheDocument();
    expect(mockGetChangeControlsByProjectId).not.toHaveBeenCalled();
  });

  it('should open the dialog when "Add Change Control" is clicked', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Change Control' }));

    expect(screen.getByTestId('change-control-dialog')).toBeInTheDocument();
    expect(screen.getByText('Change Control Dialog')).toBeInTheDocument();
  });

  it('should close the dialog when "Close" is clicked in the dialog', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Change Control' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByText(/Change Control Dialog/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should create a new change control', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Change Control' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving new data

    await waitFor(() => {
      expect(mockCreateChangeControl).toHaveBeenCalledTimes(1);
      expect(mockCreateChangeControl).toHaveBeenCalledWith(
        parseInt(mockProjectId),
        expect.objectContaining({ srNo: 3 }) // Expect next SrNo
      );
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.queryByText(/Change Control Dialog/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should edit an existing change control', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('edit')[0]); // Click edit for the first item (id: 1)

    expect(screen.getByTestId('change-control-dialog')).toBeInTheDocument();
    expect(screen.getByText('Change Control Dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving updated data

    await waitFor(() => {
      expect(mockUpdateChangeControl).toHaveBeenCalledTimes(1);
      expect(mockUpdateChangeControl).toHaveBeenCalledWith(
        parseInt(mockProjectId),
        1, // Expect id 1 to be updated
        expect.any(Object)
      );
    }, { timeout: 5000 });

    await waitFor(() => { 
      expect(screen.queryByText(/Change Control Dialog/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should delete a change control', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('delete')[0]); // Click delete for the first item (id: 1)

    await waitFor(() => {
      expect(mockDeleteChangeControl).toHaveBeenCalledTimes(1);
      expect(mockDeleteChangeControl).toHaveBeenCalledWith(parseInt(mockProjectId), 1);
    }, { timeout: 5000 });

    await waitFor(() => {
      expect(screen.queryByText(/John Doe/i)).not.toBeInTheDocument(); // Verify item is removed from display
    }, { timeout: 5000 });
  });

  it('should display error message if loading change controls fails', async () => {
    mockGetChangeControlsByProjectId.mockRejectedValue(new Error('Failed to fetch controls'));
    render(<ChangeControlForm />);

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to load change control data/i);
      expect(alert).toHaveTextContent(/Failed to fetch controls/i);
    }, { timeout: 5000 });
  });

  it('should display error message if saving change control fails', async () => {
    mockCreateChangeControl.mockRejectedValue(new Error('Failed to create'));
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Change Control' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to save change control/i);
      expect(alert).toHaveTextContent(/Failed to create/i);
    }, { timeout: 5000 });
  });

  it('should display error message if deleting change control fails', async () => {
    mockDeleteChangeControl.mockRejectedValue(new Error('Failed to delete'));
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('delete')[0]);

    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toHaveTextContent(/Failed to delete change control/i);
      expect(alert).toHaveTextContent(/Failed to delete/i);
    }, { timeout: 5000 });
  });

  it('should show loading spinner when data is being fetched', async () => {
    mockGetChangeControlsByProjectId.mockImplementationOnce(() => new Promise(resolve => setTimeout(() => resolve(mockChangeControls), 100)));
    render(<ChangeControlForm />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should update workflow when ChangeControlWorkflow button is clicked', async () => {
    render(<ChangeControlForm />);
    await waitFor(() => expect(mockGetChangeControlsByProjectId).toHaveBeenCalled());

    fireEvent.click(screen.getAllByRole('button', { name: 'Update Workflow' })[0]);

    // In a real scenario, this would trigger a re-render and re-fetch of change controls
    // For this mock, we just check if the handler was called.
    await waitFor(() => {
      expect(mockGetChangeControlsByProjectId).toHaveBeenCalledTimes(2); // Initial load + after workflow update
    }, { timeout: 5000 });
  });

});







