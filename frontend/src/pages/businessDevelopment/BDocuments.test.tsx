import { vi, describe, it, expect, afterEach } from 'vitest';
// import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BDocuments } from './BDocuments';

// Mock Material-UI components to avoid complex rendering issues in unit tests
// Consolidating into a single mock for @mui/material to support named imports
vi.mock('@mui/material', () => ({
  __esModule: true,
  Box: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
  Paper: vi.fn(({ children, ...props }) => <div {...props} data-testid="mock-paper">{children}</div>),
  Typography: vi.fn(({ children, variant, ...props }) => <span data-testid={`mock-typography-${variant}`} {...props}>{children}</span>),
}));

describe('BDocuments', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

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
