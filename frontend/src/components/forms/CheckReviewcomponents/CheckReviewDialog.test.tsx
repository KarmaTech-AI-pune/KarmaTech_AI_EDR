import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CheckReviewDialog } from './CheckReviewDialog';
import { projectManagementAppContext } from '../../../App';

// Mock API integrations
vi.mock('../../../services/userApi', () => ({
  getAllUsers: vi.fn().mockResolvedValue([{ id: '1', name: 'User One' }])
}));

vi.mock('../../../features/wbs/services/wbsApi', () => ({
  WBSStructureAPI: {
    getProjectWBS: vi.fn().mockResolvedValue({
      tasks: [
        { id: 1, level: 3, title: 'Activity A', assignedUserId: 'emp1' },
      ]
    })
  }
}));

vi.mock('../../../services/resourceApi', () => ({
  ResourceAPI: {
    getAllEmployees: vi.fn().mockResolvedValue([
      { id: 'emp1', name: 'Employee One' },
      { id: 'emp2', name: 'Employee Two' }
    ])
  }
}));

describe('CheckReviewDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  const baseProps = {
    open: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    nextActivityNo: 'ACT-001',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const customRender = (ui: React.ReactElement) => {
    return render(
      <projectManagementAppContext.Provider value={{ selectedProject: { id: 101 } } as any}>
        {ui}
      </projectManagementAppContext.Provider>
    );
  };

  it('renders correctly for adding a new check review', async () => {
    customRender(<CheckReviewDialog {...baseProps} />);
    
    expect(screen.getByText('Add Check Review - Activity No: ACT-001')).toBeInTheDocument();
    
    // Ensure inputs exist
    expect(screen.getByLabelText(/Document Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Document Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/File Name/i)).toBeInTheDocument();
    
    await waitFor(() => {
      // Data loading finishes
    });
  });

  it('filters out non-numeric characters from Document Number input', async () => {
    customRender(<CheckReviewDialog {...baseProps} />);
    
    const docNumberInput = screen.getByLabelText(/Document Number/i) as HTMLInputElement;
    fireEvent.change(docNumberInput, { target: { value: '12abc34' } });
    fireEvent.input(docNumberInput);

    // Because we trigger an event where e.currentTarget.value replaces out non-numeric,
    // let's verify if '12abc34' is prevented from registering letters.
    // Testing specific regex DOM replacements is tricky, but asserting value states helps:
    expect(docNumberInput.value).not.toBe('12abc34');
    expect(docNumberInput.value).toBe('1234');
  });

  it('populates fields properly when editData is supplied', () => {
    const editData = {
      id: '1',
      projectId: '1',
      activityNo: 'A-2',
      activityName: 'Test Activity',
      objective: 'Testing Objective',
      references: 'Standard XYZ',
      documentNumber: '1001',
      documentName: 'Test Doc',
      fileName: 'test.pdf',
      qualityIssues: 'None',
      completion: 'Y',
      checkedBy: '2023-10-10',
      approvedBy: '2023-11-10',
      actionTaken: 'Reviewed',
      maker: 'emp1',
      checker: 'emp2'
    };

    customRender(<CheckReviewDialog {...baseProps} editData={editData} />);
    
    expect(screen.getByText('Edit Check Review')).toBeInTheDocument();
    expect((screen.getByLabelText(/Objective/i) as HTMLInputElement).value).toBe('Testing Objective');
    expect((screen.getByLabelText(/Document Number/i) as HTMLInputElement).value).toBe('1001');
    expect((screen.getByLabelText(/Document Name/i) as HTMLInputElement).value).toBe('Test Doc');
    
    // Verify checkbox state
    const completionCheckbox = screen.getByRole('checkbox', { name: /Completion/i });
    expect(completionCheckbox).toBeChecked();
  });

  it('successfully saves data and closes dialog', async () => {
    customRender(<CheckReviewDialog {...baseProps} />);
    
    fireEvent.change(screen.getByLabelText(/Objective/i), { target: { value: 'New Objective' } });
    fireEvent.change(screen.getByLabelText(/Document Number/i), { target: { value: '999' } });
    
    fireEvent.click(screen.getByRole('button', { name: /Save/i }));
    
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      
      const savedPayload = mockOnSave.mock.calls[0][0];
      expect(savedPayload.objective).toBe('New Objective');
      expect(savedPayload.documentNumber).toBe('999');
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('cancels dialog when cancel button clicked', () => {
    customRender(<CheckReviewDialog {...baseProps} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnSave).not.toHaveBeenCalled();
  });
});
