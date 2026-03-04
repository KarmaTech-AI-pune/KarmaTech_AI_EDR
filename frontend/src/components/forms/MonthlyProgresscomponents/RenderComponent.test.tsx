import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import RenderComponent from './RenderComponent';
import { useFormControls } from '../../../hooks/MontlyProgress/useForm';

vi.mock('../../../hooks/MontlyProgress/useForm', () => ({
  useFormControls: vi.fn(),
}));

describe('RenderComponent', () => {
  const mockTabs = [
    { label: 'Tab 1', component: <div data-testid="comp-1">Component 1</div> },
    { label: 'Tab 2', component: <div data-testid="comp-2">Component 2</div> },
    { label: 'Tab 3', component: null },
  ];

  it('renders the component corresponding to current page index', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 0 });
    render(<RenderComponent tabs={mockTabs as any} />);
    expect(screen.getByTestId('comp-1')).toBeInTheDocument();
    expect(screen.queryByTestId('comp-2')).not.toBeInTheDocument();
  });

  it('renders another component when index changes', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 1 });
    render(<RenderComponent tabs={mockTabs as any} />);
    expect(screen.getByTestId('comp-2')).toBeInTheDocument();
    expect(screen.queryByTestId('comp-1')).not.toBeInTheDocument();
  });

  it('returns null if the component is null', () => {
    (useFormControls as any).mockReturnValue({ currentPageIndex: 2 });
    const { container } = render(<RenderComponent tabs={mockTabs as any} />);
    expect(container.firstChild).toBeNull();
  });
});
