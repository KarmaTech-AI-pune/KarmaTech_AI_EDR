import React from 'react';
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Example test', () => {
  it('renders a simple component', () => {
    render(<div data-testid="test-element">Hello, Testing Library!</div>)
    expect(screen.getByTestId('test-element')).toHaveTextContent('Hello, Testing Library!')
  })
})

