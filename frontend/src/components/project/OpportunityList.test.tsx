
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OpportunityList from './OpportunityList';

// Mock OpportunityItem to avoid rendering its complex children and API calls
vi.mock('./OpportunityItem', () => ({
  OpportunityItem: ({ opportunity }: any) => (
    <div data-testid="mock-opportunity-item">
      {opportunity.workName}
    </div>
  ),
}));

describe('OpportunityList', () => {
  const mockOpportunities = [
    {
      id: 1,
      workName: 'Test Opportunity 1',
    },
    {
      id: 2,
      workName: 'Test Opportunity 2',
    }
  ];

  it('renders an empty message when no opportunities are provided', () => {
    render(<OpportunityList opportunities={[]} />);
    expect(screen.getByText('No opportunities found')).toBeInTheDocument();
  });

  it('renders a custom empty message when provided', () => {
    render(<OpportunityList opportunities={[]} emptyMessage="Custom empty message" />);
    expect(screen.getByText('Custom empty message')).toBeInTheDocument();
  });

  it('renders a list of opportunities', () => {
    render(
      <OpportunityList
        opportunities={mockOpportunities as any}
        onOpportunityDeleted={vi.fn()}
        onOpportunityUpdated={vi.fn()}
      />
    );

    const items = screen.getAllByTestId('mock-opportunity-item');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Test Opportunity 1');
    expect(items[1]).toHaveTextContent('Test Opportunity 2');
  });
});
