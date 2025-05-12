import React from 'react';
import { render } from '@testing-library/react';
import { ResourceManagement } from './ResourceManagement';

describe('ResourceManagement Component', () => {
  it('renders without errors', () => {
    render(<ResourceManagement />);
  });
});
