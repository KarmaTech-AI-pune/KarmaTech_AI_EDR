/**
 * ProjectBudgetHistory Component Tests
 * 
 * Comprehensive test suite for ProjectBudgetHistory component
 * Tests: Rendering, filtering, pagination, loading states, error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { ProjectBudgetHistory } from '../../src/components/project/ProjectBudgetHistory';
import { projectBudgetApi } from '../../src/services/projectBudgetApi';
import { ProjectBudgetChangeHistory } from '../../src/types/projectBudget';

// Mock the API service
vi.mock('../../src/services/projectBudgetApi', () => ({
  projectBudgetApi: {
    getBudgetHistory: vi.fn(),
  },
}));

// Mock BudgetChangeTimeline component
vi.mock('../../src/components/project/BudgetChangeTimeline', () => ({
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

  const mockHistoryData: ProjectBudgetChangeHistory[] = [
    {
      id: 1,
      projectId: 123,
      fieldName: 'EstimatedProjectCost',
      oldValue: 100000,
      newValue: 150000,
      variance: 50000,
      percentageVariance: 50,
      currency: 'USD',
      changedBy: 'user1',
      changedByUser: {
        id: 'user1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      changedDate: '2024-01-15T10:30:00Z',
      reason: 'Scope expansion',
    },
    {
      id: 2,
      projectId: 123,
      fieldName: 'EstimatedProjectFee',
      oldValue: 10000,
      newValue: 15000,
      variance: 5000,
      percentageVariance: 50,
      currency: 'USD',
      changedBy: 'user2',
      changedByUser: {
        id: 'user2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      },
      changedDate: '2024-01-20T14:15:00Z',
      reason: 'Fee adjustment',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Component Rendering Tests', () => {
    it('renders without errors', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      expect(screen.getByText('Budget Change History')).toBeInTheDocument();
    });

    it('renders with empty history', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No budget changes found for this project.')).toBeInTheDocument();
      });
    });

    it('renders with multiple history records', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('budget-timeline')).toBeInTheDocument();
        expect(screen.getByTestId('timeline-item-1')).toBeInTheDocument();
        expect(screen.getByTestId('timeline-item-2')).toBeInTheDocument();
      });
    });

    it('shows loading state correctly', () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('displays error messages', async () => {
      const errorMessage = 'Failed to load budget history';
      vi.mocked(projectBudgetApi.getBudgetHistory).mockRejectedValue(
        new Error(errorMessage)
      );
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering Tests (Req 3.5)', () => {
    it('renders filter dropdown', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Field')).toBeInTheDocument();
      });
    });

    it('filters by cost changes only', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Field')).toBeInTheDocument();
      });
      
      const filterSelect = screen.getByLabelText('Filter by Field');
      fireEvent.mouseDown(filterSelect);
      
      const costOption = await screen.findByText('Cost Changes Only');
      fireEvent.click(costOption);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldName: 'EstimatedProjectCost',
          })
        );
      });
    });

    it('filters by fee changes only', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Field')).toBeInTheDocument();
      });
      
      const filterSelect = screen.getByLabelText('Filter by Field');
      fireEvent.mouseDown(filterSelect);
      
      const feeOption = await screen.findByText('Fee Changes Only');
      fireEvent.click(feeOption);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldName: 'EstimatedProjectFee',
          })
        );
      });
    });

    it('resets to first page when filter changes', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByLabelText('Filter by Field')).toBeInTheDocument();
      });
      
      const filterSelect = screen.getByLabelText('Filter by Field');
      fireEvent.mouseDown(filterSelect);
      
      const costOption = await screen.findByText('Cost Changes Only');
      fireEvent.click(costOption);
      
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
    it('does not show pagination for single page', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([mockHistoryData[0]]);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
      });
    });

    it('shows pagination for multiple pages', async () => {
      // Return full page size to indicate more pages
      const fullPageData = Array(10).fill(null).map((_, i) => ({
        ...mockHistoryData[0],
        id: i + 1,
      }));
      
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(fullPageData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
    });

    it('handles page change correctly', async () => {
      const fullPageData = Array(10).fill(null).map((_, i) => ({
        ...mockHistoryData[0],
        id: i + 1,
      }));
      
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(fullPageData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByRole('navigation')).toBeInTheDocument();
      });
      
      const nextPageButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextPageButton);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            pageNumber: 2,
          })
        );
      });
    });
  });

  describe('API Integration Tests', () => {
    it('fetches history data on mount', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: mockProjectId,
          })
        );
      });
    });

    it('handles API errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(projectBudgetApi.getBudgetHistory).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });

    it('shows loading spinner during API calls', () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockImplementation(
        () => new Promise(() => {})
      );
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('refetches data when projectId changes', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue(mockHistoryData);
      
      const { rerender } = render(<ProjectBudgetHistory projectId={123} />);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({ projectId: 123 })
        );
      });
      
      rerender(<ProjectBudgetHistory projectId={456} />);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({ projectId: 456 })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles very long project IDs', async () => {
      const longProjectId = 999999999;
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);
      
      render(<ProjectBudgetHistory projectId={longProjectId} />);
      
      await waitFor(() => {
        expect(projectBudgetApi.getBudgetHistory).toHaveBeenCalledWith(
          expect.objectContaining({ projectId: longProjectId })
        );
      });
    });

    it('handles empty API response', async () => {
      vi.mocked(projectBudgetApi.getBudgetHistory).mockResolvedValue([]);
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('No budget changes found for this project.')).toBeInTheDocument();
      });
    });

    it('handles malformed API response gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(projectBudgetApi.getBudgetHistory).mockRejectedValue(
        new Error('Invalid response format')
      );
      
      render(<ProjectBudgetHistory projectId={mockProjectId} />);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid response format')).toBeInTheDocument();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});
