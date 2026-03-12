import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InlineEdit } from '../InlineEdit';

describe('InlineEdit', () => {
  it('renders value and enters edit mode on click', () => {
    const onSaveMock = vi.fn();
    render(<InlineEdit value="Initial Value" onSave={onSaveMock} />);
    
    const displayValue = screen.getByText('Initial Value');
    expect(displayValue).toBeInTheDocument();
    
    // Click to edit
    fireEvent.click(displayValue);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Initial Value');
    
    // Change value
    fireEvent.change(input, { target: { value: 'New Value' } });
    
    // Trigger save via enter
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    
    expect(onSaveMock).toHaveBeenCalledWith('New Value');
  });
});
