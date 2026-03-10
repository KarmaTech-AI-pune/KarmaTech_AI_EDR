import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header Component', () => {
  it('renders title and subtitle correctly', () => {
    render(<Header />);

    expect(screen.getByText('Project Management Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Strategic Project Analysis & Resource Management')).toBeInTheDocument();
  });

  it('renders dropdown and buttons', () => {
    render(<Header />);

    expect(screen.getByText('All Regions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });

  it('can change region via select', () => {
    render(<Header />);

    const selectButton = screen.getByRole('combobox');
    fireEvent.mouseDown(selectButton);

    const listbox = screen.getByRole('listbox');
    fireEvent.click(within(listbox).getByText('North America'));

    // Verify it changed
    expect(screen.getAllByText('North America').length).toBeGreaterThan(0);
  });
});
