import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FeaturesList from './FeaturesList';

describe('FeaturesList', () => {
  const mockFeatures = [
    {
      id: 1,
      name: 'Feature A',
      description: 'Desc A',
      isActive: true,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-02'
    },
    {
      id: 2,
      name: 'Feature B',
      description: 'Desc B',
      isActive: false,
      createdAt: '2023-01-03',
      updatedAt: '2023-01-04'
    }
  ];

  it('renders "No features found" when feature list is empty', () => {
    render(<FeaturesList features={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No features found. Click "Add Feature" to create one./i)).toBeInTheDocument();
  });

  it('renders a list of features with correct status chips', () => {
    render(<FeaturesList features={mockFeatures} onEdit={vi.fn()} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Feature A')).toBeInTheDocument();
    expect(screen.getByText('Desc A')).toBeInTheDocument();
    
    expect(screen.getByText('Feature B')).toBeInTheDocument();
    expect(screen.getByText('Desc B')).toBeInTheDocument();
    
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onEdit with the correct feature when edit is clicked', () => {
    const mockOnEdit = vi.fn();
    render(<FeaturesList features={mockFeatures} onEdit={mockOnEdit} onDelete={vi.fn()} />);
    
    const editButtons = screen.getAllByRole('button', { name: /Edit feature/i });
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockFeatures[0]);
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete with the correct feature id when delete is clicked', () => {
    const mockOnDelete = vi.fn();
    render(<FeaturesList features={mockFeatures} onEdit={vi.fn()} onDelete={mockOnDelete} />);
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete feature/i });
    fireEvent.click(deleteButtons[1]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(2);
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });
});
