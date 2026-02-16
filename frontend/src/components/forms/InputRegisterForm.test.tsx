import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import InputRegisterForm from './InputRegisterForm';
import InputRegisterDialog from './InputRegisterformcomponents/InputRegisterDialog';
import { deleteInputRegister, getInputRegisterByProject } from '../../api/inputRegisterApi';
import { useProject } from '../../context/ProjectContext';
import { InputRegisterRow } from '../../models';

// Mock external dependencies
vi.mock('../../api/inputRegisterApi', () => ({
  deleteInputRegister: vi.fn(),
  getInputRegisterByProject: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('./InputRegisterformcomponents/InputRegisterDialog', () => ({
  default: vi.fn(({ open, onClose, onSave, initialData, projectId }) => (
    open ? (
      <div data-testid="input-register-dialog">
        <div>
          <span>Input Register Dialog</span>
          <button onClick={() => onSave(initialData || { id: 'new-id', projectId: projectId, dataReceived: 'New Data', receiptDate: '2023-01-01', receivedFrom: 'New Sender', filesFormat: 'PDF', noOfFiles: 1, storagePath: 'Path', check: true, checkedBy: 'Checker', checkedDate: '2023-01-01', custodian: 'Custodian', remarks: '', fitForPurpose: true })}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    ) : null
  )),
}));

// Type assertions for mocked functions
const mockDeleteInputRegister = vi.mocked(deleteInputRegister);
const mockGetInputRegisterByProject = vi.mocked(getInputRegisterByProject);
const mockUseProject = vi.mocked(useProject);

const mockInputRows: InputRegisterRow[] = [
  {
    id: '1',
    projectId: '123',
    dataReceived: 'Data 1',
    receiptDate: '2023-01-01',
    receivedFrom: 'Sender A',
    filesFormat: 'PDF',
    noOfFiles: 5,
    storagePath: '/path/to/files1',
    check: true,
    checkedBy: 'Checker 1',
    checkedDate: '2023-01-02',
    custodian: 'Custodian 1',
    remarks: 'Remarks 1',
    fitForPurpose: true,
  },
  {
    id: '2',
    projectId: '123',
    dataReceived: 'Data 2',
    receiptDate: '2023-01-03',
    receivedFrom: 'Sender B',
    filesFormat: 'Excel',
    noOfFiles: 2,
    storagePath: '/path/to/files2',
    check: false,
    checkedBy: 'Checker 2',
    checkedDate: '2023-01-04',
    custodian: 'Custodian 2',
    remarks: 'Remarks 2',
    fitForPurpose: false,
  },
];

describe('InputRegisterForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn() });
    mockGetInputRegisterByProject.mockResolvedValue(mockInputRows);
    mockDeleteInputRegister.mockResolvedValue(true);
  });

  it('should render correctly and load input register entries', async () => {
    render(<InputRegisterForm />);

    expect(screen.getByText('PMD3. Input Register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetInputRegisterByProject).toHaveBeenCalledWith(mockProjectId);
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('Data 1')).toBeInTheDocument();
      expect(screen.getByText('Sender A')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('Data 2')).toBeInTheDocument();
      expect(screen.getByText('Sender B')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined, setProjectId: vi.fn() });
    render(<InputRegisterForm />);
    expect(screen.getByText('Please select a project to view the input register.')).toBeInTheDocument();
    expect(mockGetInputRegisterByProject).not.toHaveBeenCalled();
  });

  it('should open the dialog when "Add Entry" is clicked', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(screen.getByTestId('input-register-dialog')).toBeInTheDocument();
    expect(screen.getByText('Input Register Dialog')).toBeInTheDocument();
  });

  it('should close the dialog when "Close" is clicked in the dialog', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(screen.queryByTestId('input-register-dialog')).not.toBeInTheDocument();
    });
  });

  it('should create a new input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving new data

    await waitFor(() => {
      expect(screen.getByText('Successfully created new input register entry (Database ID: new-id)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('input-register-dialog')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('#3')).toBeInTheDocument(); // New entry should be added
    });
  });

  it('should edit an existing input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const editButtons = screen.getAllByTestId('EditIcon');
    fireEvent.click(editButtons[0]); // Click edit for the first item (id: 1)

    expect(screen.getByTestId('input-register-dialog')).toBeInTheDocument();
    expect(screen.getByText('Input Register Dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving updated data

    await waitFor(() => {
      expect(screen.getByText('Successfully updated input register entry (Database ID: 1)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByTestId('input-register-dialog')).not.toBeInTheDocument();
    });
  });

  it('should delete an input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]); // Click delete for the first item (id: 1)

    await waitFor(() => {
      expect(mockDeleteInputRegister).toHaveBeenCalledWith('1');
      expect(screen.getByText('Successfully deleted input register entry (Database ID: 1)')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Data 1')).not.toBeInTheDocument(); // Verify item is removed from display
    });
  });

  it('should display error message if loading input register fails', async () => {
    mockGetInputRegisterByProject.mockRejectedValue(new Error('Failed to fetch data'));
    render(<InputRegisterForm />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load input register data/i)).toBeInTheDocument();
    });
  });

  it('should display error message if deleting input register fails', async () => {
    mockDeleteInputRegister.mockRejectedValue(new Error('Failed to delete'));
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const deleteButtons = screen.getAllByTestId('DeleteIcon');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Failed to delete entry/i)).toBeInTheDocument();
    });
  });

  it('should show "Fit for Purpose" chip with success color if true', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const chips = screen.getAllByText('Fit for Purpose');
    const fitForPurposeChip = chips[0];
    expect(fitForPurposeChip).toBeInTheDocument();
    
    const chipRoot = fitForPurposeChip.closest('.MuiChip-root');
    expect(chipRoot).toHaveClass('MuiChip-colorSuccess');
    expect(within(chipRoot as HTMLElement).getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });

  it('should show "Fit for Purpose" chip with default color if false', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const chips = screen.getAllByText('Fit for Purpose');
    const fitForPurposeChip = chips[1];
    expect(fitForPurposeChip).toBeInTheDocument();
    
    const chipRoot = fitForPurposeChip.closest('.MuiChip-root');
    expect(chipRoot).toHaveClass('MuiChip-colorDefault');
    expect(within(chipRoot as HTMLElement).getByTestId('CancelIcon')).toBeInTheDocument();
  });

  it('should show "Checked" chip with success color if true', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const chips = screen.getAllByText('Checked');
    const checkedChip = chips[0];
    expect(checkedChip).toBeInTheDocument();
    
    const chipRoot = checkedChip.closest('.MuiChip-root');
    expect(chipRoot).toHaveClass('MuiChip-colorSuccess');
    expect(within(chipRoot as HTMLElement).getByTestId('CheckCircleIcon')).toBeInTheDocument();
  });

  it('should show "Checked" chip with default color if false', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const chips = screen.getAllByText('Checked');
    const checkedChip = chips[1];
    expect(checkedChip).toBeInTheDocument();
    
    const chipRoot = checkedChip.closest('.MuiChip-root');
    expect(chipRoot).toHaveClass('MuiChip-colorDefault');
    expect(within(chipRoot as HTMLElement).getByTestId('CancelIcon')).toBeInTheDocument();
  });

  it('should expand and collapse accordion details', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const firstAccordionSummary = screen.getByText('Data 1').closest('.MuiAccordionSummary-root');
    expect(firstAccordionSummary).toBeInTheDocument();

    // Initially collapsed, details should not be visible
    const filesInfos = screen.queryAllByText('Files Information');
    expect(filesInfos.length).toBeGreaterThan(0);
    expect(filesInfos[0]).not.toBeVisible();

    // Expand
    fireEvent.click(firstAccordionSummary!);
    await waitFor(() => {
      const fileInfosVisible = screen.getAllByText('Files Information');
      expect(fileInfosVisible[0]).toBeVisible();
    });

    // Collapse
    fireEvent.click(firstAccordionSummary!);
    await waitFor(() => {
      const fileInfosHidden = screen.queryAllByText('Files Information');
      expect(fileInfosHidden[0]).not.toBeVisible();
    });
  });

  it('should handle rapid clicks on Add Entry button without opening multiple dialogs', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' })); // Rapid click

    expect(screen.getByTestId('input-register-dialog')).toBeInTheDocument();
    expect(screen.getByText('Input Register Dialog')).toBeInTheDocument();
    // Verify that the dialog is only opened once
    expect(screen.getAllByText('Input Register Dialog')).toHaveLength(1);
  });
});







