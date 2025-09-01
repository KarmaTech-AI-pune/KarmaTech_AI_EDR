import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    <div data-testid="input-register-dialog">
      {open && (
        <div>
          <span>Input Register Dialog</span>
          <button onClick={() => onSave(initialData || { id: 'new-id', projectId: projectId, dataReceived: 'New Data', receiptDate: '2023-01-01', receivedFrom: 'New Sender', filesFormat: 'PDF', noOfFiles: 1, storagePath: 'Path', check: true, checkedBy: 'Checker', checkedDate: '2023-01-01', custodian: 'Custodian', remarks: '', fitForPurpose: true })}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
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
    });
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

    expect(screen.queryByText('Input Register Dialog')).not.toBeInTheDocument();
  });

  it('should create a new input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving new data

    await waitFor(() => {
      expect(screen.getByText('Successfully created new input register entry (Database ID: new-id)')).toBeInTheDocument();
      expect(screen.queryByText('Input Register Dialog')).not.toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument(); // New entry should be added
    });
  });

  it('should edit an existing input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('Edit')[0]); // Click edit for the first item (id: 1)

    expect(screen.getByTestId('input-register-dialog')).toBeInTheDocument();
    expect(screen.getByText('Input Register Dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save' })); // Simulate saving updated data

    await waitFor(() => {
      expect(screen.getByText('Successfully updated input register entry (Database ID: 1)')).toBeInTheDocument();
      expect(screen.queryByText('Input Register Dialog')).not.toBeInTheDocument();
    });
  });

  it('should delete an input register entry', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('Delete')[0]); // Click delete for the first item (id: 1)

    await waitFor(() => {
      expect(mockDeleteInputRegister).toHaveBeenCalledWith('1');
      expect(screen.getByText('Successfully deleted input register entry (Database ID: 1)')).toBeInTheDocument();
      expect(screen.queryByText('Data 1')).not.toBeInTheDocument(); // Verify item is removed from display
    });
  });

  it('should display error message if loading input register fails', async () => {
    mockGetInputRegisterByProject.mockRejectedValue(new Error('Failed to fetch data'));
    render(<InputRegisterForm />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load input register data')).toBeInTheDocument();
    });
  });

  it('should display error message if deleting input register fails', async () => {
    mockDeleteInputRegister.mockRejectedValue(new Error('Failed to delete'));
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete entry')).toBeInTheDocument();
    });
  });

  it('should show "Fit for Purpose" chip with success color if true', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const fitForPurposeChip = screen.getAllByText('Fit for Purpose')[0];
    expect(fitForPurposeChip).toBeInTheDocument();
    expect(fitForPurposeChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(fitForPurposeChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CheckCircleIcon"]');
  });

  it('should show "Fit for Purpose" chip with default color if false', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const fitForPurposeChip = screen.getAllByText('Fit for Purpose')[1];
    expect(fitForPurposeChip).toBeInTheDocument();
    expect(fitForPurposeChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    expect(fitForPurposeChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CancelIcon"]');
  });

  it('should show "Checked" chip with success color if true', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const checkedChip = screen.getAllByText('Checked')[0];
    expect(checkedChip).toBeInTheDocument();
    expect(checkedChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(checkedChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CheckCircleIcon"]');
  });

  it('should show "Checked" chip with default color if false', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const checkedChip = screen.getAllByText('Checked')[1];
    expect(checkedChip).toBeInTheDocument();
    expect(checkedChip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorDefault');
    expect(checkedChip.closest('.MuiChip-root')).toContainHTML('svg[data-testid="CancelIcon"]');
  });

  it('should expand and collapse accordion details', async () => {
    render(<InputRegisterForm />);
    await waitFor(() => expect(mockGetInputRegisterByProject).toHaveBeenCalled());

    const firstAccordionSummary = screen.getByText('Data 1').closest('.MuiAccordionSummary-root');
    expect(firstAccordionSummary).toBeInTheDocument();

    // Initially collapsed, details should not be visible
    expect(screen.queryByText('Files Information')).not.toBeVisible();

    // Expand
    fireEvent.click(firstAccordionSummary!);
    expect(screen.getByText('Files Information')).toBeVisible();

    // Collapse
    fireEvent.click(firstAccordionSummary!);
    expect(screen.queryByText('Files Information')).not.toBeVisible();
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
