import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BDocuments } from './BDocuments';

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

describe('BDocuments', () => {
  it('renders the Documents title and placeholder text', () => {
    render(<BDocuments />);

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Document management section will be implemented here')).toBeInTheDocument();
  });

  it('uses Material-UI Box and Paper components', () => {
    render(<BDocuments />);

    expect(screen.getByTestId('mock-box')).toBeInTheDocument();
    expect(screen.getByTestId('mock-paper')).toBeInTheDocument();
  });
});
