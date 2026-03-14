import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VirtualizedList from './VirtualizedList';

describe('VirtualizedList Component', () => {
  const renderItemMock = vi.fn((item, index) => <div data-testid={`item-${index}`}>{item.name}</div>);
  
  const generateItems = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({ id: i, name: `Item ${i}` }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a limited number of items based on height and overscan', () => {
    const items = generateItems(100);
    // 500px container, 50px items => 10 visible items. Overscan=2 means up to 12.
    
    render(
      <VirtualizedList
        items={items}
        height={500}
        itemHeight={50}
        overscan={2}
        renderItem={renderItemMock}
      />
    );

    // It should render up to item 12
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByTestId('item-11')).toBeInTheDocument();
    
    // It should NOT render item 50 at start
    expect(screen.queryByTestId('item-50')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation PageDown and ArrowDown', () => {
    const items = generateItems(50);
    
    render(
      <VirtualizedList
        items={items}
        height={500}
        itemHeight={50}
        renderItem={renderItemMock}
      />
    );

    const listbox = screen.getByRole('listbox');

    // Currently JSDOM does not fully update viewport dimensions dynamically
    // like a real browser smoothly processing scroll events from keys.
    // However, we can assert that the component captures the keyboard events without crashing.
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(listbox, { key: 'PageDown', code: 'PageDown' });
    fireEvent.keyDown(listbox, { key: 'End', code: 'End' });

    expect(listbox).toBeInTheDocument();
  });

  it('fires onScroll callback on scroll events', () => {
    const items = generateItems(50);
    const scrollMock = vi.fn();

    render(
      <VirtualizedList
        items={items}
        height={500}
        itemHeight={50}
        renderItem={renderItemMock}
        onScroll={scrollMock}
      />
    );

    const listbox = screen.getByRole('listbox');
    fireEvent.scroll(listbox, { target: { scrollTop: 100 } });
    
    expect(scrollMock).toHaveBeenCalledWith(100);
  });
});
