import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PriorityIcon } from '../PriorityIcon';

describe('PriorityIcon', () => {
  it('renders an icon for specific priority', () => {
    const { container } = render(<PriorityIcon priority="High" />);
    // Check if an SVG rendered
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
