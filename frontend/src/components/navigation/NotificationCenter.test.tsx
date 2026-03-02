// import React from 'react';
import { render, screen } from '@testing-library/react';
import { NotificationCenter } from './NotificationCenter';
import {  describe, it, expect } from 'vitest';

describe('NotificationCenter Component', () => {
  it('renders the component with title', () => {
    render(<NotificationCenter />);
    
    // Check for the title
    const title = screen.getByText('Notifications');
    expect(title).toBeInTheDocument();
  });

  it('displays all notifications', () => {
    render(<NotificationCenter />);
    
    // Check for notification messages
    expect(screen.getByText('New project assigned')).toBeInTheDocument();
    expect(screen.getByText('Task deadline approaching')).toBeInTheDocument();
    expect(screen.getByText('Resource allocation updated')).toBeInTheDocument();
  });

  it('displays dates for each notification', () => {
    render(<NotificationCenter />);
    
    // Check for notification dates
    expect(screen.getByText('Received on: 2023-05-01')).toBeInTheDocument();
    expect(screen.getByText('Received on: 2023-05-15')).toBeInTheDocument();
    expect(screen.getByText('Received on: 2023-05-30')).toBeInTheDocument();
  });

  it('renders the correct number of notifications', () => {
    render(<NotificationCenter />);
    
    // Check that there are exactly 3 notifications
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });

  it('renders notifications in the correct order', () => {
    render(<NotificationCenter />);
    
    // Get all list items
    const listItems = screen.getAllByRole('listitem');
    
    // Check that the first item contains the first notification
    expect(listItems[0]).toHaveTextContent('New project assigned');
    expect(listItems[0]).toHaveTextContent('Received on: 2023-05-01');
    
    // Check that the second item contains the second notification
    expect(listItems[1]).toHaveTextContent('Task deadline approaching');
    expect(listItems[1]).toHaveTextContent('Received on: 2023-05-15');
    
    // Check that the third item contains the third notification
    expect(listItems[2]).toHaveTextContent('Resource allocation updated');
    expect(listItems[2]).toHaveTextContent('Received on: 2023-05-30');
  });

  it('applies correct styling to the notification container', () => {
    const { container } = render(<NotificationCenter />);
    
    // Check for the Box component with styling
    // Note: This is a more implementation-specific test that might be brittle
    // if the styling approach changes
    const boxElement = container.firstChild;
    expect(boxElement).toHaveStyle('padding: 16px'); // p: 2 translates to 16px
    expect(boxElement).toHaveStyle('border-radius: 8px');
  });
});

