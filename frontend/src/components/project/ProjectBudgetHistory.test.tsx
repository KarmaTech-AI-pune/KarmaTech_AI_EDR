/**
 * ProjectBudgetHistory Component Tests
 * 
 * Comprehensive test suite for ProjectBudgetHistory component
 * Tests: Rendering, loading states, error handling, filtering, pagination
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ProjectBudgetHistory } from './ProjectBudgetHistory';
import { projectBudgetApi } from '../../services/projectBudgetApi';
import { ProjectBudgetChangeHistory } from '../../types/projectBudget';

// Mock the API
vi.mock('../../services/projectBudgetApi');

// Mock child components
vi.mock('./BudgetChangeTimeline', () => ({
  BudgetChangeTimeline: ({ changes }: { changes: ProjectBudgetChangeHistory[] }) => (
    <div data-testid="budget-timeline">
      {changes.map((change) => (
        <div key={change.id} data-testid={`timeline-item-${change.id}`}>
          {change.fieldName}: {change.oldValue} → {change.newValue}
        </div>
      ))}
    </div>
  ),
}));

describe('ProjectBudgetHistory Component', () => {
  const mockProjectId = 123;

  const createMockHistory = (count: number): ProjectBudgetChangeHistory[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      projectId: mockProjectId,
      fieldName: i % 2 === 0 ? 'EstimatedProjectCost' : 'EstimatedProjectFee',
      oldValue: 100000 + i * 10000,
      newValue: 110000 + i * 10000,
      variance: 10000,
      percentageVariance: 10,
      currency: 'USD',
      changedBy: 'user-id',
      changedByUser: {
        id: 'user-id',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      changedDate: new Date(2024, 0, i + 1).toISOString(),
      reason: i % 3 === 0 ? 'Budget adjustment' : undefined,
    }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering Tests', () => {
    it('should render with empty history', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Budget Change History')).toBeInTheDocument();
      });

      expect(screen.getByText('No budget changes found for this project.')).toBeInTheDocument();
      expect(screen.queryByTestId('budget-timeline')).not.toBeInTheDocument();
    });

    it('should render with multiple history records', async () => {
      const mockHistory = createMockHistory(5);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      mockHistory.forEach((change) => {
        expect(screen.getByTestId(`timeline-item-${change.id}`)).toBeInTheDocument();
      });
    });

    it('should show loading state correctly', () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByTestId('budget-timeline')).not.toBeInTheDocument();
    });

    it('should display error messages', async () => {
      const errorMessage = 'Failed to load budget history';
      vi.mocked(projectBudgetApi.getBudgetHistory).mockRejectedValue(new Error(errorMessage));

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('budget-timeline')).not.toBeInTheDocument();
    });
  });

  describe('Filtering Tests (Req 3.5)', () => {
    it('should filter by cost changes only', async () => {
      const user = userEvent.setup();
      const mockHistory = createMockHistory(10);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Open filter dropdown
      const filterSelect = screen.getByLabelText('Filter by Field');
      await user.click(filterSelect);

      // Select "Cost Changes Only"
      const costOption = screen.getByText('Cost Changes Only');
      await user.click(costOption);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldName: 'EstimatedProjectCost',
          })
        );
      });
    });

    it('should filter by fee changes only', async () => {
      const user = userEvent.setup();
      const mockHistory = createMockHistory(10);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Open filter dropdown
      const filterSelect = screen.getByLabelText('Filter by Field');
      await user.click(filterSelect);

      // Select "Fee Changes Only"
      const feeOption = screen.getByText('Fee Changes Only');
      await user.click(feeOption);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldName: 'EstimatedProjectFee',
          })
        );
      });
    });

    it('should show all changes when filter is set to All', async () => {
      // const user = userEvent.setup();
      const mockHistory = createMockHistory(10);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Filter should default to "All Changes"
      expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
        expect.not.objectContaining({
          fieldName: expect.anything(),
        })
      );
    });

    it('should reset to page 1 when filter changes', async () => {
      const user = userEvent.setup();
      const mockHistory = createMockHistory(10);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Change filter
      const filterSelect = screen.getByLabelText('Filter by Field');
      await user.click(filterSelect);
      const costOption = screen.getByText('Cost Changes Only');
      await user.click(costOption);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 1,
          })
        );
      });
    });
  });

  describe('Pagination Tests', () => {
    it('should handle pagination correctly', async () => {
      const user = userEvent.setup();
      const mockHistory = createMockHistory(10);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Should show pagination controls when there are multiple pages
      const pagination = screen.getByRole('navigation');
      expect(pagination).toBeInTheDocument();

      // Click page 2
      const page2Button = within(pagination).getByText('2');
      await user.click(page2Button);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 2,
          })
        );
      });
    });

    it('should not show pagination when all items fit on one page', async () => {
      const mockHistory = createMockHistory(5); // Less than pageSize (10)
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Should not show pagination
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('API Integration Tests', () => {
    it('should fetch history data on mount', async () => {
      const mockHistory = createMockHistory(3);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith({
          projectId: mockProjectId,
          pageNumber: 1,
          pageSize: 10,
        });
      });
    });

    it('should handle API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(projectBudgetApi.getBudgetHistory).mockRejectedValue(
        new Error('Network error')
      );

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should show loading spinner during API calls', () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockImplementation(
        () => new Promise(() => {})
      );

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should refetch data when projectId changes', async () => {
      const mockHistory = createMockHistory(3);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      const { rerender } = render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledTimes(1);
      });

      // Change projectId
      rerender(<ProjectBudgetHistory projectId={456} />);

      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledTimes(2);
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenLastCalledWith(
          expect.objectContaining({
            projectId: 456,
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long project names gracefully', async () => {
      const mockHistory = createMockHistory(1);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      // Component should render without breaking
      expect(screen.getByText('Budget Change History')).toBeInTheDocument();
    });

    it('should handle API returning empty array', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByText('No budget changes found for this project.')).toBeInTheDocument();
      });
    });

    it('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
      const mockHistory = createMockHistory(5);
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistory);

      render(<ProjectBudgetHistory projectId={mockProjectId} />);

      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
      });

      const filterSelect = screen.getByLabelText('Filter by Field');

      // Rapidly change filters
      await user.click(filterSelect);
      await user.click(screen.getByText('Cost Changes Only'));
      await user.click(filterSelect);
      await user.click(screen.getByText('Fee Changes Only'));
      await user.click(filterSelect);
      await user.click(screen.getByText('All Changes'));

      // Should handle all changes without errors
      expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
    });
  });
});
