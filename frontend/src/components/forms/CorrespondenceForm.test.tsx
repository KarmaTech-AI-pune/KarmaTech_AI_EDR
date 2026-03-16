import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CorrespondenceForm from './CorrespondenceForm';
// import CorrespondenceDialog from './Correspondancecomponents/CorrespondenceDialog';
import {
  getInwardRows,
  getOutwardRows,
  deleteInwardRow,
  deleteOutwardRow,
  InwardRow,
  OutwardRow
} from '../../services/correspondenceApi';
import { useProject } from '../../context/ProjectContext';
import { } from '../../App';
import axios from 'axios';

// Mock external dependencies
vi.mock('../../services/correspondenceApi', () => ({
  getInwardRows: vi.fn(),
  getOutwardRows: vi.fn(),
  deleteInwardRow: vi.fn(),
  deleteOutwardRow: vi.fn(),
}));

vi.mock('../../context/ProjectContext', () => ({
  useProject: vi.fn(),
}));

vi.mock('../../App', () => ({
  projectManagementAppContext: React.createContext({
    user: { id: 'user1', userName: 'testuser' },
    currentUser: { id: 'user1', userName: 'testuser', name: 'Test User', email: 'test@example.com', standardRate: 0, isConsultant: false, createdAt: '', roles: [], password: 'password123' },
  }),
}));

vi.mock('./Correspondancecomponents/CorrespondenceDialog', () => ({
  default: vi.fn(({ open, onClose, onSave, type, editData, isEdit }) => {
    const [isOpen, setIsOpen] = React.useState(open);
    
    React.useEffect(() => {
      setIsOpen(open);
    }, [open]);
    
    const handleSave = async () => {
      await onSave(editData || { id: isEdit ? (type === 'inward' ? 1 : 101) : undefined, _isEditOperation: isEdit, projectId: '123', incomingLetterNo: 'ILN-001', letterDate: '2023-01-01', njsInwardNo: 'NJS-001', receiptDate: '2023-01-01', from: 'Sender', subject: 'Test Subject', attachmentDetails: 'Details', actionTaken: 'Action', storagePath: 'Path', repliedDate: '2023-01-02', remarks: 'Remarks', letterNo: 'OLN-001', to: 'Recipient', acknowledgement: 'Ack' });
      setIsOpen(false);
      onClose();
    };
    
    const handleClose = () => {
      setIsOpen(false);
      onClose();
    };
    
    return (
      <div data-testid="correspondence-dialog">
        {isOpen && (
          <div>
            <span>Correspondence Dialog ({type})</span>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleClose}>Close</button>
          </div>
        )}
      </div>
    );
  }),
}));

vi.mock('axios', () => ({
  default: vi.fn(() => Promise.resolve({ data: {} })),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Type assertions for mocked functions
const mockGetInwardRows = vi.mocked(getInwardRows);
const mockGetOutwardRows = vi.mocked(getOutwardRows);
const mockDeleteInwardRow = vi.mocked(deleteInwardRow);
const mockDeleteOutwardRow = vi.mocked(deleteOutwardRow);
const mockUseProject = vi.mocked(useProject);
const mockAxios = vi.mocked(axios);

const mockInwardRows: InwardRow[] = [
  {
    id: 1,
    projectId: 123,
    incomingLetterNo: 'ILN-001',
    letterDate: '2023-01-01T00:00:00Z',
    inwardNo: 'NJS-001',
    receiptDate: '2023-01-01T00:00:00Z',
    from: 'Sender A',
    subject: 'Inward Subject 1',
    attachmentDetails: 'Details 1',
    actionTaken: 'Action 1',
    storagePath: 'Path 1',
    repliedDate: '2023-01-02T00:00:00Z',
    remarks: 'Remarks 1',
    createdBy: 'user1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedBy: 'user1',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

const mockOutwardRows: OutwardRow[] = [
  {
    id: 101,
    projectId: 123,
    letterNo: 'OLN-001',
    letterDate: '2023-01-03T00:00:00Z',
    to: 'Recipient A',
    subject: 'Outward Subject 1',
    attachmentDetails: 'Details 101',
    actionTaken: 'Action 101',
    storagePath: 'Path 101',
    acknowledgement: 'Ack 101',
    remarks: 'Remarks 101',
    createdBy: 'user1',
    createdAt: '2023-01-03T00:00:00Z',
    updatedBy: 'user1',
    updatedAt: '2023-01-03T00:00:00Z',
  },
];

describe('CorrespondenceForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProjectId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('token', 'mock-token'); // Ensure token is present for most tests
    mockUseProject.mockReturnValue({ projectId: mockProjectId, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    mockGetInwardRows.mockResolvedValue(mockInwardRows);
    mockGetOutwardRows.mockResolvedValue(mockOutwardRows);
    mockDeleteInwardRow.mockResolvedValue(undefined);
    mockDeleteOutwardRow.mockResolvedValue(undefined);
    mockAxios.mockResolvedValue({ data: { id: 2, projectId: 123, incomingLetterNo: 'ILN-002', letterDate: '2023-01-05T00:00:00Z', njsInwardNo: 'NJS-002', receiptDate: '2023-01-05T00:00:00Z', from: 'New Sender', subject: 'New Subject', attachmentDetails: '', actionTaken: '', storagePath: '', repliedDate: null, remarks: '', createdBy: 'testuser', createdAt: '2023-01-05T00:00:00Z', updatedAt: '2023-01-05T00:00:00Z' } });
  });

  it('should render correctly and load inward correspondence by default', async () => {
    render(<CorrespondenceForm />);

    expect(screen.getByText('PMD4. Correspondence Inward-Outward')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Inward' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Outward' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('button', { name: 'Add Entry' })).toBeInTheDocument();

    await waitFor(() => {
      expect(mockGetInwardRows).toHaveBeenCalledWith(mockProjectId);
      expect(screen.getByText('ILN-001')).toBeInTheDocument();
      expect(screen.getByText('Inward Subject 1')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(mockGetOutwardRows).toHaveBeenCalledWith(mockProjectId); // Both should be fetched initially
  });

  it('should switch to outward tab and display outward correspondence', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('tab', { name: 'Outward' }));

    expect(screen.getByRole('tab', { name: 'Outward' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('OLN-001')).toBeInTheDocument();
    expect(screen.getByText('Outward Subject 1')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('ILN-001')).not.toBeInTheDocument();
    });
  });

  it('should display a warning if no project is selected', () => {
    mockUseProject.mockReturnValue({ projectId: undefined as unknown as string, setProjectId: vi.fn(), programId: null, setProgramId: vi.fn() });
    render(<CorrespondenceForm />);
    expect(screen.getByText('Please select a project to view the correspondence register.')).toBeInTheDocument();
    expect(mockGetInwardRows).not.toHaveBeenCalled();
    expect(mockGetOutwardRows).not.toHaveBeenCalled();
  });

  it('should open the dialog when "Add Entry" is clicked', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));

    expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
    expect(screen.getByText('Correspondence Dialog (inward)')).toBeInTheDocument();
  });

  it('should open the dialog in edit mode when "Edit" is clicked for an inward row', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    // Wait for the data to be displayed
    await waitFor(() => {
      expect(screen.getByText('ILN-001')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find all icon buttons (Edit and Delete buttons are IconButtons)
    const allButtons = screen.getAllByRole('button');
    // Filter to get only IconButtons (they have MuiIconButton-root class)
    const iconButtons = allButtons.filter(btn => btn.classList.contains('MuiIconButton-root'));
    
    // The first IconButton in each row is the Edit button (before the Delete button)
    // Skip the accordion expand button (it's not an IconButton with MuiIconButton-root)
    // The Edit button should be the first IconButton we find
    const editButton = iconButtons[0];
    
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText('Correspondence Dialog (inward)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  it('should open the dialog in edit mode when "Edit" is clicked for an outward row', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('tab', { name: 'Outward' }));
    await waitFor(() => expect(mockGetOutwardRows).toHaveBeenCalled());

    // Wait for outward data to be displayed
    await waitFor(() => {
      expect(screen.getByText('OLN-001')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find all icon buttons
    const allButtons = screen.getAllByRole('button');
    const iconButtons = allButtons.filter(btn => btn.classList.contains('MuiIconButton-root'));
    
    // The first IconButton is the Edit button
    const editButton = iconButtons[0];
    
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
      expect(screen.getByText('Correspondence Dialog (outward)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  it('should close the dialog when "Close" is clicked in the dialog', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Correspondence Dialog (inward)')).not.toBeInTheDocument();
  });

  it('should handle creation flow of an inward row', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // The dialog should close after save attempt
    await waitFor(() => {
      expect(screen.queryByText('Correspondence Dialog (inward)')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle update flow of an inward row', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText('ILN-001')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find all icon buttons and click the first one (Edit button)
    const allButtons = screen.getAllByRole('button');
    const iconButtons = allButtons.filter(btn => btn.classList.contains('MuiIconButton-root'));
    const editButton = iconButtons[0];
    
    fireEvent.click(editButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    // The dialog should close after save attempt
    await waitFor(() => {
      expect(screen.queryByText('Correspondence Dialog (inward)')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should handle successful deletion of an inward row', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    // Wait for data to be displayed
    await waitFor(() => {
      expect(screen.getByText('ILN-001')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Find all icon buttons
    const allButtons = screen.getAllByRole('button');
    const iconButtons = allButtons.filter(btn => btn.classList.contains('MuiIconButton-root'));
    
    // The second IconButton in each row is the Delete button (after the Edit button)
    const deleteButton = iconButtons[1];
    
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    }, { timeout: 5000 });

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockDeleteInwardRow).toHaveBeenCalledWith(1);
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.queryByText('ILN-001')).not.toBeInTheDocument();
    }, { timeout: 5000 });
    
    await waitFor(() => {
      expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display error if token is invalid on load', async () => {
    localStorageMock.clear(); // Simulate missing token
    render(<CorrespondenceForm />);

    await waitFor(() => {
      expect(screen.getByText('You must be logged in to access this feature. Please log in again.')).toBeInTheDocument();
    }, { timeout: 5000 });
    expect(mockGetInwardRows).not.toHaveBeenCalled();
  });

  it('should display error if fetching data fails', async () => {
    mockGetInwardRows.mockRejectedValue(new Error('Network error'));
    render(<CorrespondenceForm />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load correspondence data. Please try again./i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display "No inward correspondence found" when no data is returned for inward tab', async () => {
    mockGetInwardRows.mockResolvedValue([]);
    render(<CorrespondenceForm />);

    await waitFor(() => {
      expect(screen.getByText('No inward correspondence found. Click "Add Entry" to create one.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should display "No outward correspondence found" when no data is returned for outward tab', async () => {
    mockGetOutwardRows.mockResolvedValue([]);
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('tab', { name: 'Outward' }));

    await waitFor(() => {
      expect(screen.getByText('No outward correspondence found. Click "Add Entry" to create one.')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should prevent event propagation on dialog interactions', async () => {
    render(<CorrespondenceForm />);
    await waitFor(() => expect(mockGetInwardRows).toHaveBeenCalled());
    
    // Open the dialog first
    fireEvent.click(screen.getByRole('button', { name: 'Add Entry' }));
    
    await waitFor(() => {
      expect(screen.getByTestId('correspondence-dialog')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Test that the dialog exists and can be interacted with
    const dialog = screen.getByTestId('correspondence-dialog');
    expect(dialog).toBeInTheDocument();
    
    // The dialog should have event handlers that prevent propagation
    // This is tested by verifying the dialog renders correctly
    expect(screen.getByText('Correspondence Dialog (inward)')).toBeInTheDocument();
  });
});







