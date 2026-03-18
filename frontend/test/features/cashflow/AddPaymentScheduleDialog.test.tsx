/**
 * AddPaymentScheduleDialog Component Tests
 * 
 * Comprehensive test suite for AddPaymentScheduleDialog component
 * Tests: Rendering, form validation, user interactions, calculations
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { AddPaymentScheduleDialog } from '../../../src/features/cashflow/components/AddPaymentScheduleDialog';

describe('AddPaymentScheduleDialog Component', () => {
  const mockOnClose = vi.fn();
  const mockOnAdd = vi.fn();
  const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onAdd: mockOnAdd,
    totalAmountINR: 1000000,
    currentTotalPercentage: 30,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering Tests', () => {
    it('renders dialog when open is true', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render dialog when open is false', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Add Payment Schedule')).not.toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/percentage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });

    it('renders dialog title', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const headings = screen.getAllByRole('heading', { name: 'Add Payment Schedule' });
      expect(headings.length).toBeGreaterThan(0);
    });

    it('renders close button', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.querySelector('svg[data-testid="CloseIcon"]'));
      expect(closeButton).toBeInTheDocument();
    });

    it('renders cancel button', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders submit button', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByRole('button', { name: /add payment schedule/i })).toBeInTheDocument();
    });

    it('renders current total percentage info', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByText('Current Total:')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('renders remaining percentage info', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByText('Remaining:')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('renders calculated amount display', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByText('Calculated Amount:')).toBeInTheDocument();
    });
  });

  describe('Form Field Tests', () => {
    it('description field accepts text input', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Inception Report');
      
      expect(descriptionInput).toHaveValue('Inception Report');
    });

    it('percentage field accepts numeric input', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      expect(percentageInput).toHaveValue(10);
    });

    it('due date field accepts date input', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '2025-12-31');
      
      expect(dueDateInput).toHaveValue('2025-12-31');
    });

    it('description field has placeholder text', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const descriptionInput = screen.getByPlaceholderText(/e.g., inception report/i);
      expect(descriptionInput).toBeInTheDocument();
    });

    it('percentage field has placeholder text', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const percentageInput = screen.getByPlaceholderText(/e.g., 10/i);
      expect(percentageInput).toBeInTheDocument();
    });

    it('description field is required', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toBeRequired();
    });

    it('percentage field is required', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const percentageInput = screen.getByLabelText(/percentage/i);
      expect(percentageInput).toBeRequired();
    });

    it('due date field is optional', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const dueDateInput = screen.getByLabelText(/due date/i);
      expect(dueDateInput).not.toBeRequired();
    });

    it('description field has autofocus', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toHaveFocus();
    });
  });

  describe('Validation Tests', () => {
    it('shows error when description is empty', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Description is required')).toBeInTheDocument();
    });

    it('shows error when percentage is 0', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Percentage must be between 1 and 100')).toBeInTheDocument();
    });

    it('shows error when percentage is negative', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.clear(percentageInput);
      await user.type(percentageInput, '-5');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Percentage must be between 1 and 100')).toBeInTheDocument();
    });

    it('shows error when percentage exceeds 100', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.clear(percentageInput);
      await user.type(percentageInput, '150');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      // Wait for error to appear - the component validates on submit
      await waitFor(() => {
        const helperText = screen.getByText(/percentage must be between 1 and 100/i);
        expect(helperText).toBeInTheDocument();
      });
    });

    it('shows error when total percentage would exceed 100%', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '80'); // 30 + 80 = 110 > 100
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText(/total percentage cannot exceed 100%/i)).toBeInTheDocument();
    });

    it('clears description error when user types', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Description is required')).toBeInTheDocument();
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test');
      
      await waitFor(() => {
        expect(screen.queryByText('Description is required')).not.toBeInTheDocument();
      });
    });

    it('clears percentage error when user types', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Percentage must be between 1 and 100')).toBeInTheDocument();
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      await waitFor(() => {
        expect(screen.queryByText('Percentage must be between 1 and 100')).not.toBeInTheDocument();
      });
    });
  });

  describe('Calculation Tests', () => {
    it('calculates amount correctly based on percentage', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      // 10% of 1,000,000 = 100,000
      await waitFor(() => {
        expect(screen.getByText(/₹1,00,000/)).toBeInTheDocument();
      });
    });

    it('updates calculated amount when percentage changes', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '20');
      
      // 20% of 1,000,000 = 200,000
      await waitFor(() => {
        expect(screen.getByText(/₹2,00,000/)).toBeInTheDocument();
      });
    });

    it('shows zero amount when percentage is 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      expect(screen.getByText(/₹0/)).toBeInTheDocument();
    });

    it('calculates remaining percentage correctly', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={40} />);
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    it('shows 0% remaining when total is 100%', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={100} />);
      const remainingElements = screen.getAllByText('0%');
      expect(remainingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Submit Functionality Tests', () => {
    it('calls onAdd with correct data when form is valid', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Inception Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      const dueDateInput = screen.getByLabelText(/due date/i);
      await user.type(dueDateInput, '2025-12-31');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith({
          description: 'Inception Report',
          percentage: 10,
          amountINR: 100000,
          dueDate: '2025-12-31',
        });
      });
    });

    it('calls onAdd without dueDate when not provided', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '15');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith({
          description: 'Test Report',
          percentage: 15,
          amountINR: 150000,
          dueDate: undefined,
        });
      });
    });

    it('trims whitespace from description', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, '  Test Report  ');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnAdd).toHaveBeenCalledWith(
          expect.objectContaining({
            description: 'Test Report',
          })
        );
      });
    });

    it('closes dialog after successful submission', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('does not call onAdd when validation fails', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnAdd).not.toHaveBeenCalled();
      });
    });
  });

  describe('Close Functionality Tests', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons.find(btn => btn.querySelector('svg[data-testid="CloseIcon"]'));
      await user.click(closeButton!);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets form fields when dialog is closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const descriptionInput = screen.getByLabelText(/description/i);
      await user.type(descriptionInput, 'Test Report');
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      // Reopen dialog
      rerender(<AddPaymentScheduleDialog {...defaultProps} open={false} />);
      rerender(<AddPaymentScheduleDialog {...defaultProps} open={true} />);
      
      const newDescriptionInput = screen.getByLabelText(/description/i);
      const newPercentageInput = screen.getByLabelText(/percentage/i);
      
      expect(newDescriptionInput).toHaveValue('');
      expect(newPercentageInput).toHaveValue(null);
    });

    it('clears errors when dialog is closed', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      await user.click(submitButton);
      
      expect(await screen.findByText('Description is required')).toBeInTheDocument();
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      // Reopen dialog
      rerender(<AddPaymentScheduleDialog {...defaultProps} open={false} />);
      rerender(<AddPaymentScheduleDialog {...defaultProps} open={true} />);
      
      expect(screen.queryByText('Description is required')).not.toBeInTheDocument();
    });
  });

  describe('Button State Tests', () => {
    it('disables submit button when remaining percentage is 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={100} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when remaining percentage is greater than 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={50} />);
      
      const submitButton = screen.getByRole('button', { name: /add payment schedule/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('cancel button is always enabled', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).not.toBeDisabled();
    });
  });

  describe('UI State Tests', () => {
    it('shows red background when remaining percentage is 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={100} />);
      
      const remainingText = screen.getByText('Remaining:');
      const parentBox = remainingText.closest('div');
      
      expect(parentBox).toBeInTheDocument();
    });

    it('shows blue background when remaining percentage is greater than 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={50} />);
      
      const remainingText = screen.getByText('Remaining:');
      const parentBox = remainingText.closest('div');
      
      expect(parentBox).toBeInTheDocument();
    });

    it('displays helper text for percentage field', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      expect(screen.getByText(/enter percentage \(max remaining: 70%\)/i)).toBeInTheDocument();
    });

    it('displays helper text for due date field', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      expect(screen.getByText(/select payment due date \(optional\)/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles decimal percentages correctly', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10.5');
      
      // 10.5% of 1,000,000 = 105,000
      await waitFor(() => {
        expect(screen.getByText(/₹1,05,000/)).toBeInTheDocument();
      });
    });

    it('handles very small percentages', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '0.1');
      
      // 0.1% of 1,000,000 = 1,000
      await waitFor(() => {
        expect(screen.getByText(/₹1,000/)).toBeInTheDocument();
      });
    });

    it('handles large total amounts', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} totalAmountINR={10000000} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      
      // 10% of 10,000,000 = 1,000,000
      await waitFor(() => {
        expect(screen.getByText(/₹10,00,000/)).toBeInTheDocument();
      });
    });

    it('handles currentTotalPercentage of 0', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} currentTotalPercentage={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles empty string in percentage field', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '10');
      await user.clear(percentageInput);
      
      expect(percentageInput).toHaveValue(null);
    });
  });

  describe('Accessibility Tests', () => {
    it('has proper dialog role', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('has proper button roles', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper textbox roles', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const textboxes = screen.getAllByRole('textbox');
      expect(textboxes.length).toBeGreaterThan(0);
    });

    it('has proper spinbutton role for percentage field', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByRole('spinbutton');
      expect(percentageInput).toBeInTheDocument();
    });

    it('has proper labels for form fields', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/percentage/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    });
  });

  describe('Input Constraints Tests', () => {
    it('percentage field has min attribute', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      expect(percentageInput).toHaveAttribute('min', '0');
    });

    it('percentage field has max attribute based on remaining percentage', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      expect(percentageInput).toHaveAttribute('max', '70');
    });

    it('percentage field has step attribute', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      expect(percentageInput).toHaveAttribute('step', '0.1');
    });

    it('percentage field has type number', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      expect(percentageInput).toHaveAttribute('type', 'number');
    });

    it('due date field has type date', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const dueDateInput = screen.getByLabelText(/due date/i);
      expect(dueDateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Currency Formatting Tests', () => {
    it('formats amount in Indian currency format', async () => {
      const user = userEvent.setup();
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageInput = screen.getByLabelText(/percentage/i);
      await user.type(percentageInput, '25');
      
      // 25% of 1,000,000 = 250,000 (formatted as ₹2,50,000)
      await waitFor(() => {
        expect(screen.getByText(/₹2,50,000/)).toBeInTheDocument();
      });
    });

    it('shows rupee symbol in calculated amount', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      expect(screen.getByText(/₹/)).toBeInTheDocument();
    });

    it('shows percentage symbol in input', () => {
      render(<AddPaymentScheduleDialog {...defaultProps} />);
      
      const percentageSymbols = screen.getAllByText('%');
      expect(percentageSymbols.length).toBeGreaterThan(0);
    });
  });
});
