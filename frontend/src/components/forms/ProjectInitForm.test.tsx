import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ProjectInitForm from './ProjectInitForm';

// Mock the context hooks
vi.mock('../../context/ProjectContext', () => ({
  useProject: () => ({ programId: '10' })
}));

vi.mock('../../context/FormDisabledContext', () => ({
  useFormDisabled: () => ({ isFormDisabled: false })
}));

describe('ProjectInitForm', () => {
  const mockApprovalManagers = [{ id: '1', name: 'Alice Approval' }];
  const mockProjectManagers = [{ id: '2', name: 'Bob Project' }];
  const mockSeniorProjectManagers = [{ id: '3', name: 'Charlie Senior' }];

  const baseProps = {
    approvalManagers: mockApprovalManagers,
    projectManagers: mockProjectManagers,
    seniorProjectManagers: mockSeniorProjectManagers,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with required fields', () => {
    render(<ProjectInitForm {...baseProps} />);
    
    expect(screen.getByLabelText(/^Project Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Project Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Client Name/i)).toBeInTheDocument();
    
    // Check if dropdowns have the passed values available (use exact match to avoid Senior Project Manager collision)
    const pmSelect = screen.getByLabelText(/^Project Manager/i);
    expect(pmSelect).toBeInTheDocument();
  });

  it('calculates estimated project fee when fee type is Percentage', async () => {
    render(<ProjectInitForm {...baseProps} />);
    
    // Change Fee Type to Percentage
    const feeTypeSelect = screen.getByLabelText(/^Fee Type/i);
    fireEvent.mouseDown(feeTypeSelect);
    const percentageOption = screen.getByRole('option', { name: 'Percentage' });
    fireEvent.click(percentageOption);

    // Enter Cost
    const costInput = document.querySelector('input[name="estimatedProjectCost"]') as HTMLInputElement;
    fireEvent.change(costInput, { target: { value: '1000' } });

    // Enter Percentage
    const percentageInput = document.querySelector('input[name="percentage"]') as HTMLInputElement;
    fireEvent.change(percentageInput, { target: { value: '10' } });

    // Assuming calculation happens: 1000 * (10 / 100) = 100
    const feeInput = document.querySelector('input[name="estimatedProjectFee"]') as HTMLInputElement;
    await waitFor(() => {
      expect(feeInput.value).toContain('100');
    });
  });

  it('triggers onSubmit with constructed data', async () => {
    const mockOnSubmit = vi.fn();
    render(<ProjectInitForm {...baseProps} onSubmit={mockOnSubmit} />);

    // Fill all required fields
    fireEvent.change(screen.getByLabelText(/^Project Name/i), { target: { value: 'Test Project' } });
    fireEvent.change(screen.getByLabelText(/^Project Number/i), { target: { value: 'PROJ-123' } });
    fireEvent.change(screen.getByLabelText(/^Client Name/i), { target: { value: 'Acme Corp' } });
    
    // Fill required native selects (Material UI handles Select slightly differently but we can mock change on the input itself if it has a name)
    const pmInput = document.querySelector('input[name="projectManagerId"]') as HTMLInputElement;
    fireEvent.change(pmInput, { target: { value: '2' } });

    const spmInput = document.querySelector('input[name="seniorProjectManagerId"]') as HTMLInputElement;
    fireEvent.change(spmInput, { target: { value: '3' } });

    const rmInput = document.querySelector('input[name="regionalManagerId"]') as HTMLInputElement;
    fireEvent.change(rmInput, { target: { value: '1' } });

    fireEvent.change(screen.getByLabelText(/^Estimated Project Cost/i), { target: { value: '5000' } });
    
    const currencyInput = document.querySelector('input[name="currency"]') as HTMLInputElement;
    fireEvent.change(currencyInput, { target: { value: 'USD' } });

    fireEvent.change(screen.getByLabelText(/^Start Date/i), { target: { value: '2023-01-01' } });
    fireEvent.change(screen.getByLabelText(/^End Date/i), { target: { value: '2023-12-31' } });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled();
      const submittedData = mockOnSubmit.mock.calls[0][0];
      expect(submittedData.name).toBe('Test Project');
      expect(submittedData.projectNo).toBe('PROJ-123');
      expect(submittedData.clientName).toBe('Acme Corp');
    });
  });

  it('triggers onCancel when Cancel button is clicked', () => {
    render(<ProjectInitForm {...baseProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(baseProps.onCancel).toHaveBeenCalledTimes(1);
  });
});
