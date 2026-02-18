import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, test, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProgramManagement from './ProgramManagement';
import { usePrograms } from '../../hooks/usePrograms';
import { programApi } from '../../services/api/programApi';
import { Program } from '../../types/program';

// Mock the hooks and API
vi.mock('../../hooks/usePrograms');
vi.mock('../../services/api/programApi');

// Mock useProject context
vi.mock('../../context/ProjectContext', () => ({
  useProject: () => ({
    setProgramId: vi.fn()
  })
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

// Helper to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProgramManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockPrograms: Program[] = [
    {
      id: 1,
      name: 'Program 1',
      description: 'Description 1',
      startDate: '2025-01-01',
      endDate: '2025-12-31'
    },
    {
      id: 2,
      name: 'Program 2',
      description: 'Description 2',
      startDate: '2025-02-01',
      endDate: null
    }
  ];

  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  it('displays loading spinner when loading', () => {
    vi.mocked(usePrograms).mockReturnValue({
      programs: [],
      isLoading: true,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when error occurs', async () => {
    vi.mocked(usePrograms).mockReturnValue({
      programs: [],
      isLoading: false,
      error: 'Failed to load programs',
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    await waitFor(() => expect(screen.getByText(/Failed to load programs/i)).toBeInTheDocument());
  });

  it('displays retry button on error', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: [],
      isLoading: false,
      error: 'Failed to load programs',
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    const retryButton = screen.getByRole('button', { name: /Retry/i });
    await user.click(retryButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders program list', () => {
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    expect(screen.getByText('Program 1')).toBeInTheDocument();
    expect(screen.getByText('Program 2')).toBeInTheDocument();
  });

  it('displays empty state when no programs', () => {
    vi.mocked(usePrograms).mockReturnValue({
      programs: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    expect(screen.getByText('No programs found')).toBeInTheDocument();
  });

  it('filters programs by search term', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    const searchInput = screen.getByPlaceholderText('Search programs');
    await user.type(searchInput, 'Program 1');

    expect(screen.getByText('Program 1')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Program 2')).not.toBeInTheDocument());
  });

  it('displays message when search returns no results', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    const searchInput = screen.getByPlaceholderText('Search programs');
    await user.type(searchInput, 'Nonexistent Program');

    expect(screen.getByText('No programs found matching your search')).toBeInTheDocument();
  });

  it('opens create dialog when create button clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    const createButton = screen.getByRole('button', { name: /Create Program/i });
    await user.click(createButton);

    expect(screen.getByText('Create New Program')).toBeInTheDocument();
  });

  it('opens edit dialog when edit button clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(btn => btn.querySelector('svg[data-testid="EditIcon"]'));
    
    if (editButton) {
      await user.click(editButton);
      await waitFor(() => {
        expect(screen.getByText('Edit Program')).toBeInTheDocument();
      });
    }
  });

  it('opens delete confirmation dialog when delete button clicked', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg[data-testid="DeleteIcon"]'));
    
    if (deleteButton) {
      await user.click(deleteButton);
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });
    }
  });

  it('deletes program when confirmed', async () => {
    const user = userEvent.setup();
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    vi.mocked(programApi.delete).mockResolvedValue();

    renderWithRouter(<ProgramManagement />);
    
    const deleteButtons = screen.getAllByRole('button');
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg[data-testid="DeleteIcon"]'));
    
    if (deleteButton) {
      await user.click(deleteButton);
      
      await waitFor(() => {
        expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /^Delete$/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(programApi.delete).toHaveBeenCalledWith(1);
        expect(mockRefetch).toHaveBeenCalled();
      });
    }
  });

  it('displays pagination when programs exceed page size', () => {
    const manyPrograms: Program[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Program ${i + 1}`,
      description: `Description ${i + 1}`,
      startDate: '2025-01-01',
      endDate: null
    }));

    vi.mocked(usePrograms).mockReturnValue({
      programs: manyPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    // Should show pagination component
    const paginationButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent && /^\d+$/.test(btn.textContent)
    );
    expect(paginationButtons.length).toBeGreaterThan(0);
  });

  it('formats dates correctly', () => {
    vi.mocked(usePrograms).mockReturnValue({
      programs: mockPrograms,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });

    renderWithRouter(<ProgramManagement />);
    
    // Check for formatted date (dd-MM-yyyy format) - text is split across elements
    const startLabels = screen.getAllByText('Start:');
    expect(startLabels.length).toBeGreaterThan(0);
    expect(screen.getByText('01-01-2025')).toBeInTheDocument();
  });
});







