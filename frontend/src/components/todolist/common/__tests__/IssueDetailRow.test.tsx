import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IssueDetailRow } from '../IssueDetailRow';

describe('IssueDetailRow', () => {
  it('renders label and children', () => {
    render(
      <IssueDetailRow label="Assignee">
        <div data-testid="child-content">John Doe</div>
      </IssueDetailRow>
    );

    expect(screen.getByText('Assignee')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toHaveTextContent('John Doe');
  });
});
