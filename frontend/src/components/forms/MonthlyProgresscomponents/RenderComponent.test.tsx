import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RenderComponent from './RenderComponent';
import { useFormControls } from '../../../hooks/MontlyProgress/useForm';

// Mock the useFormControls hook
vi.mock('../../../hooks/MontlyProgress/useForm', () => ({
  useFormControls: vi.fn(),
}));

describe('RenderComponent', () => {
  const mockTabs = [
    { id: '1', label: 'Tab 1', component: <div data-testid="comp-1">Component 1</div> },
    { id: '2', label: 'Tab 2', component: <div data-testid="comp-2">Component 2</div> },
    { id: '3', label: 'Tab 3', component: <div data-testid="comp-3">Component 3</div> },
  ];

  it('renders all components and toggles visibility via display property', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 0 });
    render(<RenderComponent tabs={mockTabs as any} />);

    // Tab 1 should be visible (block)
    const comp1 = screen.getByTestId('comp-1').parentElement;
    expect(window.getComputedStyle(comp1!).display).toBe('block');

    // Tab 2 should be hidden (none)
    const comp2 = screen.getByTestId('comp-2').parentElement;
    expect(window.getComputedStyle(comp2!).display).toBe('none');
  });

  it('updates visibility when page index changes', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 1 });
    render(<RenderComponent tabs={mockTabs as any} />);

    // Tab 2 should now be visible
    const comp2 = screen.getByTestId('comp-2').parentElement;
    expect(window.getComputedStyle(comp2!).display).toBe('block');

    // Tab 1 should be hidden
    const comp1 = screen.getByTestId('comp-1').parentElement;
    expect(window.getComputedStyle(comp1!).display).toBe('none');
  });

  it('renders correctly even if current index is out of bounds', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 99 });
    render(<RenderComponent tabs={mockTabs as any} />);

    // All should be hidden
    mockTabs.forEach((_, index) => {
      const comp = screen.getByTestId(`comp-${index + 1}`).parentElement;
      expect(window.getComputedStyle(comp!).display).toBe('none');
    });
  });
});
