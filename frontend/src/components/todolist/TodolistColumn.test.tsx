import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TodolistColumn } from './TodolistColumn';

// Mock react-beautiful-dnd to bypass complex context requirements
vi.mock('@hello-pangea/dnd', () => ({
  Droppable: ({ children }: any) => children({
    innerRef: vi.fn(),
    droppableProps: {
      'data-rbd-droppable-context-id': '1',
      'data-rbd-droppable-id': 'test-id',
    },
    placeholder: <div data-testid="droppable-placeholder" />
  }, { isDraggingOver: false })
}));

describe('TodolistColumn', () => {
  it('renders title and empty state', () => {
    render(
      <TodolistColumn
        id="To Do"
        title="To Do"
        color="red"
        issues={[]}
        onIssueClick={vi.fn()}
        onToggleFlag={vi.fn()}
        setShowCreateModal={vi.fn()}
      />
    );

    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByTestId('droppable-placeholder')).toBeInTheDocument();
  });
});
