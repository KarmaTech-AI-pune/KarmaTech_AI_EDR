import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TodolistHeader } from './TodolistHeader';

describe('TodolistHeader', () => {
  it('renders correctly with default props', () => {
    render(
      <TodolistHeader
        searchTerm=""
        setSearchTerm={vi.fn()}
        quickFilters={{ 'Only My Issues': false }}
        setQuickFilters={vi.fn()}
        setShowCreateModal={vi.fn()}
      />
    );
    expect(screen.getByPlaceholderText('Search tasks...')).toBeInTheDocument();
  });

  it('renders sprint plan if provided', () => {
    const mockSprint = {
      sprintName: 'Alpha Sprint',
      sprintNumber: 1,
      startDate: '2023-01-01',
      endDate: '2023-01-14',
      sprintGoal: 'Finish everything'
    } as any;

    render(
      <TodolistHeader
        searchTerm=""
        setSearchTerm={vi.fn()}
        quickFilters={{}}
        setQuickFilters={vi.fn()}
        setShowCreateModal={vi.fn()}
        sprintPlan={mockSprint}
      />
    );

    expect(screen.getByText(/Alpha Sprint/)).toBeInTheDocument();
    expect(screen.getByText(/Goal: Finish everything/)).toBeInTheDocument();
  });

  it('handles search term changes', () => {
    const setSearchTermMock = vi.fn();
    render(
      <TodolistHeader
        searchTerm="Initial"
        setSearchTerm={setSearchTermMock}
        quickFilters={{}}
        setQuickFilters={vi.fn()}
        setShowCreateModal={vi.fn()}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search tasks...');
    fireEvent.change(searchInput, { target: { value: 'New search' } });

    expect(setSearchTermMock).toHaveBeenCalledWith('New search');
  });
});
