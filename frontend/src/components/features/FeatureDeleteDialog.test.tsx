import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FeatureDeleteDialog from './FeatureDeleteDialog';

describe('FeatureDeleteDialog Component', () => {
  const mockFeature = {
    id: 123,
    name: 'Advanced Reporting',
    description: 'Generates complex reports',
    isActive: true,
  };

  it('renders correct dialog copy with the specific feature name', () => {
    render(
      <FeatureDeleteDialog 
        open={true} 
        feature={mockFeature} 
        onClose={vi.fn()} 
        onConfirm={vi.fn()} 
      />
    );

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete the feature/)).toBeInTheDocument();
    expect(screen.getByText(/"Advanced Reporting"/)).toBeInTheDocument();
  });

  it('triggers onConfirm when delete button is pressed', async () => {
    const mockOnConfirm = vi.fn().mockResolvedValue(true);
    const mockOnClose = vi.fn();
    
    render(
      <FeatureDeleteDialog 
        open={true} 
        feature={mockFeature} 
        onClose={mockOnClose} 
        onConfirm={mockOnConfirm} 
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(mockOnConfirm).toHaveBeenCalled();
    
    // Because handleConfirm wraps the try-catch block asynchronously around both logic calls,
    // we wait for component to fully cycle state resolves and fire onClose subsequently.
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('triggers onClose when cancel button is pressed without confirming', () => {
    const mockOnConfirm = vi.fn();
    const mockOnClose = vi.fn();
    
    render(
      <FeatureDeleteDialog 
        open={true} 
        feature={mockFeature} 
        onClose={mockOnClose} 
        onConfirm={mockOnConfirm} 
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    expect(mockOnClose).toHaveBeenCalled();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });
});
