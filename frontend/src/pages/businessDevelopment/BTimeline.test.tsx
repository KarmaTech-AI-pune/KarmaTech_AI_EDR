import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BTimeline } from './BTimeline';

// Mock Material-UI components to avoid complex rendering issues in unit tests
jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
}));
jest.mock('@mui/material/Paper', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-paper">{children}</div>),
}));
jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: jest.fn(({ children, variant, ...props }) => <span data-testid={`mock-typography-${variant}`} {...props}>{children}</span>),
}));

describe('BTimeline', () => {
  it('renders the Timeline title and placeholder text', () => {
    render(<BTimeline />);

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Opportunity timeline section will be implemented here')).toBeInTheDocument();
  });

  it('uses Material-UI Box and Paper components', () => {
    render(<BTimeline />);

    expect(screen.getByTestId('mock-box')).toBeInTheDocument();
    expect(screen.getByTestId('mock-paper')).toBeInTheDocument();
  });
});
