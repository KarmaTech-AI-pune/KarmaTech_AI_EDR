import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { IssueTypeIcon } from '../IssueTypeIcon';

describe('IssueTypeIcon', () => {
  it('renders an icon for specific issue types', () => {
    const { container } = render(<IssueTypeIcon issueType="Bug" />);
    // Check if an SVG or icon font rendered
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
