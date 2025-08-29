import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteWBSDialog from './DeleteWBSDialog';

const defaultProps = {
  open: true,
  childCount: 3,
  onCancel: vi.fn(),
  onConfirm: vi.fn(),
};

describe('DeleteWBSDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    render(<DeleteWBSDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('This action will delete this row and 3 rows. Are you sure you want to proceed?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should render correct text when childCount is 1', () => {
    render(<DeleteWBSDialog {...defaultProps} childCount={1} />);
    
    expect(screen.getByText('This action will delete this row and 1 row. Are you sure you want to proceed?')).toBeInTheDocument();
  });

  it('should call onCancel when Cancel button is clicked', () => {
    render(<DeleteWBSDialog {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);
    
    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm when Delete button is clicked', () => {
    render(<DeleteWBSDialog {...defaultProps} />);
    
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);
    
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('should not render if open prop is false', () => {
    render(<DeleteWBSDialog {...defaultProps} open={false} />);
    
    // Check if the dialog title is not in the document
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });
});
