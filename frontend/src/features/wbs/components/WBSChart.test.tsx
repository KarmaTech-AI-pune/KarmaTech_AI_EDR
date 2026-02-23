// import React from 'react';
import {  describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { WBSChart } from './WBSChart';

describe('WBSChart Component', () => {
  it('renders without errors', () => {
    render(<WBSChart />);
  });
});

