import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeatureForm from './FeatureForm';

describe('FeatureForm Component', () => {
  it('renders correctly in Add mode', () => {
    render(
      <FeatureForm 
        open={true} 
        feature={null} 
        onClose={vi.fn()} 
        onSubmit={vi.fn()} 
      />
    );

    expect(screen.getByText('Add New Feature')).toBeInTheDocument();
    
    // Check initial blank fields
    const nameInput = screen.getByLabelText(/Feature Name/i);
    expect(nameInput).toHaveValue('');
    
    // Verify default Is Active checkbox is inherently checked by default per specifications
    const activeCheckbox = screen.getByLabelText(/Is Active/i);
    expect(activeCheckbox).toBeChecked();

    const saveBtn = screen.getByRole('button', { name: /save/i });
    expect(saveBtn).toBeInTheDocument();
  });

  it('renders correctly in Edit mode reading given feature props', () => {
    const mockFeature = {
      id: 1,
      name: 'Existing Feature',
      description: 'Legacy code',
      isActive: false
    };

    render(
      <FeatureForm 
        open={true} 
        feature={mockFeature} 
        onClose={vi.fn()} 
        onSubmit={vi.fn()} 
      />
    );

    expect(screen.getByText('Edit Feature')).toBeInTheDocument();
    
    const nameInput = screen.getByLabelText(/Feature Name/i);
    expect(nameInput).toHaveValue('Existing Feature');

    const descInput = screen.getByLabelText(/Description/i);
    expect(descInput).toHaveValue('Legacy code');

    const activeCheckbox = screen.getByLabelText(/Is Active/i);
    expect(activeCheckbox).not.toBeChecked();
  });

  it('validates required fields through Zod schema before simulating submit', async () => {
    const mockSubmit = vi.fn();
    render(
      <FeatureForm 
        open={true} 
        feature={null} 
        onClose={vi.fn()} 
        onSubmit={mockSubmit} 
      />
    );

    // Click submit without entering data
    const submitBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.submit(submitBtn.closest('form')!); // Direct form submission

    // Wait for the Zod resolver errors to paint the DOM with error helper texts
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('submits valid data correctly', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(true);
    const mockOnClose = vi.fn();

    render(
      <FeatureForm 
        open={true} 
        feature={null} 
        onClose={mockOnClose} 
        onSubmit={mockSubmit} 
      />
    );

    fireEvent.change(screen.getByLabelText(/Feature Name/i), { target: { value: 'New Test Feature' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Does cool new things' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'New Test Feature',
        description: 'Does cool new things',
        isActive: true
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
