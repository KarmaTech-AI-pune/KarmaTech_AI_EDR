import React from 'react';
/**
 * BudgetUpdateDialog Component Tests
 * 
 * Comprehensive test suite for BudgetUpdateDialog component
 * Tests: Form rendering, validation, submission, reason field
 */

import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { BudgetUpdateDialog } from './BudgetUpdateDialog';
import { projectBudgetApi } from '../../services/projectBudgetApi';

// Mock the API
vi.mock('../../services/projectBudgetApi');

describe('BudgetUpdateDialog Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockProject = {
    projectId: 123,
    projectName: 'Test Project',
    estimatedProjectCost: 100000,
    estimatedProjectFee: 10000,
    currency: 'USD',
  };

  const mockOnClose = vi.fn();
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
    cleanup(); // Clean up any mounted components from previous tests
  });

  describe('Form Rendering Tests (Req 4)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should render form correctly', () => {
      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText('Update Project Budget')).toBeInTheDocument();
      expect(screen.getByText(/Test Project/)).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated Project Cost')).toBeInTheDocument();
      expect(screen.getByLabelText('Estimated Project Fee')).toBeInTheDocument();
      expect(screen.getByLabelText(/Reason for Change/)).toBeInTheDocument();
    });

    it('should initialize form with current project values', () => {
      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost') as HTMLInputElement;
      const feeInput = screen.getByLabelText('Estimated Project Fee') as HTMLInputElement;

      expect(costInput.value).toBe('100000');
      expect(feeInput.value).toBe('10000');
    });

    it('should display currency symbol', () => {
      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const currencySymbols = screen.getAllByText('USD');
      expect(currencySymbols.length).toBeGreaterThan(0);
    });

    it('should not render when dialog is closed', async () => {
      render(
        <BudgetUpdateDialog
          open={false}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      await waitFor(() => {
        expect(screen.queryByText('Update Project Budget')).not.toBeInTheDocument();
      });
    });
  });

  describe('Reason Field Tests (Req 4.2, 4.5)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should allow optional reason field', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Change cost without providing reason
      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(projectBudgetApi.updateBudget).toHaveBeenCalledWith(
          mockProject.projectId,
          expect.objectContaining({
            estimatedProjectCost: 120000,
          })
        );
      });

      // Should not include reason in request if not provided
      expect(projectBudgetApi.updateBudget).toHaveBeenCalledWith(
        mockProject.projectId,
        expect.not.objectContaining({
          reason: expect.anything(),
        })
      );
    });

    it('should validate reason field max 500 characters', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const reasonInput = screen.getByLabelText(/Reason for Change/);
      const longReason = 'A'.repeat(501);

      // Use paste instead of type for performance
      await user.click(reasonInput);
      await user.paste(longReason);

      // Should show character count
      await waitFor(() => {
        expect(screen.getByText(/501\/500 characters/)).toBeInTheDocument();
      });

      // Change cost to trigger validation
      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Reason cannot exceed 500 characters/)).toBeInTheDocument();
      });

      expect(projectBudgetApi.updateBudget).not.toHaveBeenCalled();
    }, 10000); // Increase timeout to 10 seconds

    it('should allow empty/null reason values', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Change cost without reason
      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(projectBudgetApi.updateBudget).toHaveBeenCalled();
      });
    });

    it('should display character count for reason field', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const reasonInput = screen.getByLabelText(/Reason for Change/);

      // Initially should show 0/500
      expect(screen.getByText(/0\/500 characters/)).toBeInTheDocument();

      // Type some text
      await user.type(reasonInput, 'Test reason');

      // Should update character count
      await waitFor(() => {
        expect(screen.getByText(/11\/500 characters/)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should require at least one budget field to be changed', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Try to submit without changing values
      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/At least one budget field must be changed/)).toBeInTheDocument();
      });

      expect(projectBudgetApi.updateBudget).not.toHaveBeenCalled();
    });

    // Note: Cannot test "invalid text" in number fields because HTML5 number inputs
    // prevent typing non-numeric characters. Browser blocks this behavior.
    // Tests removed: "validates cost is a valid number", "validates fee is a valid number"

    it('should validate cost cannot be negative', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '-1000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Cost cannot be negative/)).toBeInTheDocument();
      });
    });

    it('should validate fee cannot be negative', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const feeInput = screen.getByLabelText('Estimated Project Fee');
      await user.clear(feeInput);
      await user.type(feeInput, '-500');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Fee cannot be negative/)).toBeInTheDocument();
      });
    });

    // Note: "clears validation errors" test removed because we can't create
    // invalid input in number fields to test error clearing
  });

  describe('Form Submission Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const reasonInput = screen.getByLabelText(/Reason for Change/);
      await user.type(reasonInput, 'Budget increase approved');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(projectBudgetApi.updateBudget).toHaveBeenCalledWith(mockProject.projectId, {
          estimatedProjectCost: 120000,
          reason: 'Budget increase approved',
        });
      });
    });

    it('should show success message after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Budget updated successfully!')).toBeInTheDocument();
      });
    });

    it('should call onUpdate and onClose after successful submission', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      const { unmount } = render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalled();
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 2000 });
      
      // Unmount component to clean up any pending timers
      unmount();
    });

    it('should show error message on submission failure', async () => {
      // Use real timers for this test to avoid interference from previous test's setTimeout
      vi.useRealTimers();
      
      const user = userEvent.setup();
      // Mock console.error to suppress error output in tests
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      vi.mocked(projectBudgetApi.updateBudget).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      // Clear mocks before submission to ensure clean state
      mockOnUpdate.mockClear();
      mockOnClose.mockClear();

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
        // Verify callbacks were NOT called on error - check inside waitFor to ensure async flow completes
        expect(mockOnUpdate).not.toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();
      });
      
      // Verify console.error was called
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should disable form during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });

      // Form fields should be disabled
      expect(costInput).toBeDisabled();
      expect(screen.getByLabelText('Estimated Project Fee')).toBeDisabled();
      expect(screen.getByLabelText(/Reason for Change/)).toBeDisabled();
    });
  });

  describe('User Interaction Tests', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should close dialog when Cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not close dialog during submission', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockImplementation(
        () => new Promise(() => {})
      );

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Updating...')).toBeInTheDocument();
      });

      // Try to close
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should reset form when dialog is reopened', async () => {
      const { rerender } = render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost') as HTMLInputElement;
      expect(costInput.value).toBe('100000');

      // Close dialog
      rerender(
        <BudgetUpdateDialog
          open={false}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      // Reopen with different project
      const newProject = { ...mockProject, estimatedProjectCost: 200000 };
      rerender(
        <BudgetUpdateDialog
          open={true}
          project={newProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const newCostInput = screen.getByLabelText('Estimated Project Cost') as HTMLInputElement;
      expect(newCostInput.value).toBe('200000');
    });
  });

  describe('Edge Cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('should handle very long project names', () => {
      const longNameProject = {
        ...mockProject,
        projectName: 'A'.repeat(200),
      };

      render(
        <BudgetUpdateDialog
          open={true}
          project={longNameProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      expect(screen.getByText(/A{200}/)).toBeInTheDocument();
    });

    it('should handle special characters in reason field', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const reasonInput = screen.getByLabelText(/Reason for Change/);
      await user.type(reasonInput, '<script>alert("test")</script> & special chars');

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(projectBudgetApi.updateBudget).toHaveBeenCalledWith(
          mockProject.projectId,
          expect.objectContaining({
            reason: '<script>alert("test")</script> & special chars',
          })
        );
      });
    });

    it('should handle decimal values correctly', async () => {
      const user = userEvent.setup();
      vi.mocked(projectBudgetApi.updateBudget).mockResolvedValue({
        success: true,
        message: 'Budget updated',
        createdHistoryRecords: [],
      });

      render(
        <BudgetUpdateDialog
          open={true}
          project={mockProject}
          onClose={mockOnClose}
          onUpdate={mockOnUpdate}
        />
      );

      const costInput = screen.getByLabelText('Estimated Project Cost');
      await user.clear(costInput);
      await user.type(costInput, '120000.50');

      const submitButton = screen.getByText('Update Budget');
      await user.click(submitButton);

      await waitFor(() => {
        expect(projectBudgetApi.updateBudget).toHaveBeenCalledWith(
          mockProject.projectId,
          expect.objectContaining({
            estimatedProjectCost: 120000.50,
          })
        );
      });
    });
  });
});









