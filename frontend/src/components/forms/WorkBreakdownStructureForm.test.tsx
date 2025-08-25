import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WorkBreakdownStructureForm from './WorkBreakdownStructureForm';
import { useProject } from '../../context/ProjectContext';
import { WBSStructureAPI, WBSOptionsAPI } from '../../services/wbsApi';
import { ResourceAPI } from '../../services/resourceApi';
import { TaskType, WBSRowData, WBSOption } from '../../types/wbs';
import { resourceRole } from '../../models/resourceRoleModel';
import { Employee } from '../../models/employeeModel';

// Import the actual components to be mocked for type inference
import NotificationSnackbar from '../widgets/NotificationSnackbar';
import DeleteWBSDialog from '../dialogbox/DeleteWBSDialog';
import WBSHeader from './WBSformcomponents/WBSHeader';
import WBSTable from './WBSformcomponents/WBSTable';
import WBSSummary from './WBSformcomponents/WBSSummary';

// Mock dependencies
vi.mock('../../context/ProjectContext');
vi.mock('../../services/wbsApi');
vi.mock('../../services/resourceApi');
vi.mock('../widgets/NotificationSnackbar');
vi.mock('../dialogbox/DeleteWBSDialog');
vi.mock('./WBSformcomponents/WBSHeader');
vi.mock('./WBSformcomponents/WBSTable');
vi.mock('./WBSformcomponents/WBSSummary');

const mockUseProject = useProject as unknown as vi.Mock;
const mockGetProjectWBS = WBSStructureAPI.getProjectWBS as unknown as vi.Mock;
const mockSetProjectWBS = WBSStructureAPI.setProjectWBS as unknown as vi.Mock;
const mockGetLevel1Options = WBSOptionsAPI.getLevel1Options as unknown as vi.Mock;
const mockGetLevel2Options = WBSOptionsAPI.getLevel2Options as unknown as vi.Mock;
const mockGetAllOptions = WBSOptionsAPI.getAllOptions as unknown as vi.Mock;
const mockGetAllRoles = ResourceAPI.getAllRoles as unknown as vi.Mock;
const mockGetAllEmployees = ResourceAPI.getAllEmployees as unknown as vi.Mock;
const mockGetEmployeeById = ResourceAPI.getEmployeeById as unknown as vi.Mock;

// Mocked component implementations with explicit types
const mockNotificationSnackbar = NotificationSnackbar as unknown as vi.Mock;
const mockDeleteWBSDialog = DeleteWBSDialog as unknown as vi.Mock;
const mockWBSHeader = WBSHeader as unknown as vi.Mock;
const mockWBSTable = WBSTable as unknown as vi.Mock;
const mockWBSSummary = WBSSummary as unknown as vi.Mock;


const mockProjectId = 'test-project-id';
const mockRoles: resourceRole[] = [{ id: 'role1', name: 'Engineer', min_rate: 10, description: 'Software Engineer' }];
const mockEmployees: Employee[] = [{ id: 'emp1', name: 'John Doe', standard_rate: 50, role_id: 'role1', email: 'john@example.com', is_consultant: false, is_active: true }];
const mockLevel1Options: WBSOption[] = [{ id: 'l1-1', name: 'Level 1 Task 1', level: 1, is_active: true }];
const mockLevel2Options: WBSOption[] = [{ id: 'l2-1', name: 'Level 2 Task 1', level: 2, parentId: 'l1-1', is_active: true }];
const mockLevel3OptionsMap = {
  'Level 2 Task 1': [{ id: 'l3-1', name: 'Level 3 Task 1', level: 3, parentId: 'l2-1', is_active: true }],
};

const mockWbsData: WBSRowData[] = [
  {
    id: 'task1',
    level: 1,
    title: 'Task 1',
    role: null,
    name: null,
    assignedUserId: null,
    costRate: 0,
    plannedHours: { '2023': { 'January': 10 } },
    odc: 0,
    odcHours: 0,
    totalHours: 10,
    totalCost: 0,
    parentId: null,
    taskType: TaskType.Manpower,
    unit: 'month',
    resource_role: null,
    resource_role_name: null,
  },
];

describe('WorkBreakdownStructureForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProject.mockReturnValue({ projectId: mockProjectId });
    mockGetProjectWBS.mockResolvedValue(mockWbsData);
    mockSetProjectWBS.mockResolvedValue(undefined);
    mockGetLevel1Options.mockResolvedValue(mockLevel1Options);
    mockGetLevel2Options.mockResolvedValue(mockLevel2Options);
    mockGetAllOptions.mockResolvedValue({ level3: mockLevel3OptionsMap });
    mockGetAllRoles.mockResolvedValue(mockRoles);
    mockGetAllEmployees.mockResolvedValue(mockEmployees);
    mockGetEmployeeById.mockImplementation((id: string) =>
      Promise.resolve(mockEmployees.find(emp => emp.id === id))
    );

    // Reset mock implementations for child components
    mockNotificationSnackbar.mockImplementation(() => <div data-testid="notification-snackbar">Snackbar</div>);
    mockDeleteWBSDialog.mockImplementation(({ open, onCancel, onConfirm }: { open: boolean; onCancel: () => void; onConfirm: () => void }) => (
      open ? (
        <div data-testid="delete-wbs-dialog">
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </div>
      ) : null
    ));
    mockWBSHeader.mockImplementation(({ title, onAddMonth, onEditModeToggle, editMode }: { title: string; onAddMonth: () => void; onEditModeToggle: () => void; editMode: boolean }) => (
      <div data-testid="wbs-header">
        <h2>{title}</h2>
        <button onClick={onAddMonth}>Add Month</button>
        <button onClick={onEditModeToggle}>{editMode ? 'Disable Edit' : 'Enable Edit'}</button>
      </div>
    ));
    mockWBSTable.mockImplementation(({ rows, months, editMode, onAddRow, onDeleteRow, onLevelChange, onRoleChange, onUnitChange, onEmployeeChange, onCostRateChange, onHoursChange, onODCChange, onResourceRoleChange }: { rows: WBSRowData[]; months: string[]; editMode: boolean; onAddRow: (level: number, parentId?: string) => void; onDeleteRow: (rowId: string) => void; onLevelChange: (rowId: string, value: string) => void; onRoleChange: (rowId: string, roleId: string) => void; onUnitChange: (rowId: string, unitValue: string) => void; onEmployeeChange: (rowId: string, employeeIdOrName: string) => void; onCostRateChange: (rowId: string, value: string) => void; onHoursChange: (rowId: string, month: string, value: string) => void; onODCChange: (rowId: string, value: string) => void; onResourceRoleChange: (rowId: string, value: string) => void; }) => (
      <div data-testid="wbs-table">
        {rows.map((row: WBSRowData) => (
          <div key={row.id} data-testid={`wbs-row-${row.id}`}>
            <span>{row.title}</span>
            <button onClick={() => onDeleteRow(row.id)}>Delete</button>
            <button onClick={() => onAddRow(row.level + 1, row.id)}>Add Child</button>
            <input
              data-testid={`title-input-${row.id}`}
              value={row.title}
              onChange={(e) => onLevelChange(row.id, e.target.value)}
              readOnly={!editMode}
            />
            {months.map((month: string) => (
              <input
                key={month}
                data-testid={`hours-input-${row.id}-${month}`}
                value={row.plannedHours?.[month.split(' ')[1]]?.[month.split(' ')[0]] || ''}
                onChange={(e) => onHoursChange(row.id, month, e.target.value)}
                readOnly={!editMode}
              />
            ))}
          </div>
        ))}
        <button onClick={() => onAddRow(1)}>Add Level 1</button>
      </div>
    ));
    mockWBSSummary.mockImplementation(({ totalHours, totalCost, onSave, loading }: { totalHours: number; totalCost: number; onSave: () => void; loading: boolean }) => (
      <div data-testid="wbs-summary">
        <span>Total Hours: {totalHours}</span>
        <span>Total Cost: {totalCost}</span>
        <button onClick={onSave} disabled={loading}>Save</button>
      </div>
    ));
  });

  it('renders without crashing and shows loading initially', () => {
    render(<WorkBreakdownStructureForm />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders form content after data loads', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByTestId('wbs-header')).toBeInTheDocument();
      expect(screen.getByTestId('wbs-table')).toBeInTheDocument();
      expect(screen.getByTestId('wbs-summary')).toBeInTheDocument();
    });
  });

  it('displays error if no project ID is provided', async () => {
    mockUseProject.mockReturnValue({ projectId: null });
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => {
      expect(screen.getByText(/Project start date is not set/i)).toBeInTheDocument();
    });
  });

  it('fetches WBS data, options, roles, and employees on mount', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => {
      expect(mockGetProjectWBS).toHaveBeenCalledWith(mockProjectId);
      expect(mockGetLevel1Options).toHaveBeenCalledWith(0); // Manpower formType
      expect(mockGetLevel2Options).toHaveBeenCalledWith(0); // Manpower formType
      expect(mockGetAllOptions).toHaveBeenCalledWith(0); // Manpower formType
      expect(mockGetAllRoles).toHaveBeenCalledTimes(1);
      expect(mockGetAllEmployees).toHaveBeenCalledTimes(1);
    });
  });

  it('adds a new month when "Add Month" is clicked', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-header')).toBeInTheDocument());

    const addMonthButton = screen.getByRole('button', { name: /Add Month/i });
    fireEvent.click(addMonthButton);

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          months: expect.arrayContaining([expect.stringMatching(/January \d{2}/), expect.stringMatching(/February \d{2}/)]),
        }),
        {}
      );
    });
  });

  it('adds a new level 1 row when "Add Level 1" is clicked', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-table')).toBeInTheDocument());

    const addLevel1Button = screen.getByRole('button', { name: /Add Level 1/i });
    fireEvent.click(addLevel1Button);

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ id: 'task1', level: 1 }),
            expect.objectContaining({ level: 1, title: '' }), // New row
          ]),
        }),
        {}
      );
    });
  });

  it('opens delete dialog when delete button is clicked', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-row-task1')).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteWBSDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          rowId: 'task1',
          childCount: 0,
        }),
        {}
      );
    });
  });

  it('deletes a row when delete is confirmed', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-row-task1')).toBeInTheDocument());

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(mockDeleteWBSDialog).toHaveBeenCalledWith(expect.objectContaining({ open: true }), {}));

    // Simulate confirm action from the dialog
    mockDeleteWBSDialog.mock.calls[mockDeleteWBSDialog.mock.calls.length - 1][0].onConfirm();

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: [],
        }),
        {}
      );
      expect(mockDeleteWBSDialog).toHaveBeenCalledWith(expect.objectContaining({ open: false }), {});
    });
  });

  it('calls handleSubmit on save button click and toggles edit mode', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-summary')).toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSetProjectWBS).toHaveBeenCalledTimes(1);
      expect(mockWBSHeader).toHaveBeenCalledWith(
        expect.objectContaining({
          editMode: false, // Should be toggled to false after save
        }),
        {}
      );
    });
  });

  it('shows snackbar on successful save', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-summary')).toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockNotificationSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          message: 'WBS data saved successfully!',
          severity: 'success',
        }),
        {}
      );
    });
  });

  it('shows snackbar on failed save', async () => {
    mockSetProjectWBS.mockRejectedValue(new Error('API Error'));
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-summary')).toBeInTheDocument());

    const saveButton = screen.getByRole('button', { name: /Save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockNotificationSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          open: true,
          message: expect.stringContaining('Failed to save WBS data'),
          severity: 'error',
        }),
        {}
      );
    });
  });

  it('updates row title on input change', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-row-task1')).toBeInTheDocument());

    // Simulate change via the mocked WBSTable's onLevelChange prop
    mockWBSTable.mock.calls[mockWBSTable.mock.calls.length - 1][0].onLevelChange('task1', 'Updated Task 1');

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ id: 'task1', title: 'Updated Task 1' }),
          ]),
        }),
        {}
      );
    });
  });

  it('updates planned hours on input change', async () => {
    render(<WorkBreakdownStructureForm />);
    await waitFor(() => expect(screen.getByTestId('wbs-row-task1')).toBeInTheDocument());

    // Simulate change via the mocked WBSTable's onHoursChange prop
    mockWBSTable.mock.calls[mockWBSTable.mock.calls.length - 1][0].onHoursChange('task1', 'January 23', '20');

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ id: 'task1', plannedHours: { '2023': { 'January': 20 } } }),
          ]),
        }),
        {}
      );
    });
  });

  it('filters WBS data correctly for ODC formType', async () => {
    const odcWbsData: WBSRowData[] = [
      { ...mockWbsData[0], id: 'odcTask1', taskType: TaskType.ODC, title: 'ODC Task 1' },
      { ...mockWbsData[0], id: 'manpowerTask1', taskType: TaskType.Manpower, title: 'Manpower Task 1' },
    ];
    mockGetProjectWBS.mockResolvedValue(odcWbsData);

    render(<WorkBreakdownStructureForm formType="odc" />);

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ id: 'odcTask1', taskType: TaskType.ODC }),
          ]),
        }),
        {}
      );
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.not.arrayContaining([
            expect.objectContaining({ id: 'manpowerTask1', taskType: TaskType.Manpower }),
          ]),
        }),
        {}
      );
    });
  });

  it('filters WBS data correctly for manpower formType', async () => {
    const mixedWbsData: WBSRowData[] = [
      { ...mockWbsData[0], id: 'odcTask1', taskType: TaskType.ODC, title: 'ODC Task 1' },
      { ...mockWbsData[0], id: 'manpowerTask1', taskType: TaskType.Manpower, title: 'Manpower Task 1' },
    ];
    mockGetProjectWBS.mockResolvedValue(mixedWbsData);

    render(<WorkBreakdownStructureForm formType="manpower" />);

    await waitFor(() => {
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.arrayContaining([
            expect.objectContaining({ id: 'manpowerTask1', taskType: TaskType.Manpower }),
          ]),
        }),
        {}
      );
      expect(mockWBSTable).toHaveBeenCalledWith(
        expect.objectContaining({
          rows: expect.not.arrayContaining([
            expect.objectContaining({ id: 'odcTask1', taskType: TaskType.ODC }),
          ]),
        }),
        {}
      );
    });
  });
});
