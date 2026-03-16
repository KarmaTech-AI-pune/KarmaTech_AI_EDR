import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkBreakdownStructureForm from '../WorkBreakdownStructureForm';

// Mock the child components to simplify the test
vi.mock('../../components/WBSHeader', () => ({
  default: () => <div data-testid="wbs-header">WBSHeader</div>,
}));

vi.mock('../../components/WBSTable', () => ({
  default: () => <div data-testid="wbs-table">WBSTable</div>,
}));

vi.mock('../../components/WBSSummary', () => ({
  default: () => <div data-testid="wbs-summary">WBSSummary</div>,
}));

vi.mock('../../components/DeleteWBSDialog', () => ({
  default: () => <div data-testid="wbs-delete-dialog">DeleteWBSDialog</div>,
}));

// Mock Project Context using the canonical module path
vi.mock('../../../../context/ProjectContext', () => ({
  useProject: () => ({
    projectId: 1,
  }),
  ProjectProvider: ({ children }: any) => <div>{children}</div>
}));

// Mock the WBS Context completely to bypass API initialization
vi.mock('../../context/WBSContext', () => {

  return {
    useWBSDataContext: () => ({
      manpowerRows: [],
      odcRows: [],
      editMode: true,
      totalHours: 0,
      totalCost: 0,
      loading: false,
      getProjectStartDate: () => '2023-01-01',
      wbsHeaderId: 1,
      formType: 'manpower',
    }),
    useWBSActionsContext: () => ({
      setSnackbarOpen: vi.fn(),
      setSnackbarMessage: vi.fn(),
      setSnackbarSeverity: vi.fn(),
      reloadWBSData: vi.fn(),
      deleteDialog: { open: false, childCount: 0 },
      handleDeleteCancel: vi.fn(),
      handleDeleteConfirm: vi.fn(),
      onEditModeToggle: vi.fn(),
    }),
    useWBSUIStateContext: () => ({
      snackbarOpen: false,
      snackbarMessage: '',
      snackbarSeverity: 'info',
    }),
    WBSProvider: ({ children }: any) => <div>{children}</div>
  };
});

describe('WorkBreakdownStructureForm', () => {
  it('renders all main sub-components successfully when project is loaded', () => {
    render(
        <WorkBreakdownStructureForm formType="manpower" />
    );

    expect(screen.getByTestId('wbs-header')).toBeInTheDocument();
    expect(screen.getByTestId('wbs-table')).toBeInTheDocument();
    expect(screen.getByTestId('wbs-summary')).toBeInTheDocument();
    expect(screen.getByTestId('wbs-delete-dialog')).toBeInTheDocument();
  });
});
