import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PriorityProjectsPanel from './PriorityProjectsPanel';

describe('PriorityProjectsPanel Component', () => {
  const mockProjects = [
    {
      id: "p1",
      name: "Project A",
      region: "North America",
      status: "cost_overrun" as const,
      severity: "P5" as const,
      delay: 5,
      budget: 100000,
      spent: 80000,
      timeline: "Q4 2024",
      issues: ["Budget overrun", "Timeline delay"]
    }
  ];

  const mockSuggestions = [
    {
      id: 1,
      title: "Reallocate Resources",
      description: "Move 2 devs to Project A",
      type: "warning" as const,
      icon: "users"
    },
    {
      id: 2,
      title: "Approve Budget",
      description: "Approve additional 10k budget",
      type: "success" as const,
      icon: "check"
    }
  ];

  it('renders projects and AI suggestions correctly', () => {
    render(
      <PriorityProjectsPanel 
        projects={mockProjects} 
        suggestions={mockSuggestions} 
        onViewActionPlan={vi.fn()} 
      />
    );

    expect(screen.getByText('Projects Needing Attention')).toBeInTheDocument();
    expect(screen.getByText('1 Critical')).toBeInTheDocument();
    
    // Validates child ProjectCard render context
    expect(screen.getByText('Project A')).toBeInTheDocument();
    
    // AI Suggestions
    expect(screen.getByText('AI Suggestions')).toBeInTheDocument();
    
    expect(screen.getByText('Reallocate Resources')).toBeInTheDocument();
    expect(screen.getByText('Move 2 devs to Project A')).toBeInTheDocument();
    
    expect(screen.getByText('Approve Budget')).toBeInTheDocument();
    expect(screen.getByText('Approve additional 10k budget')).toBeInTheDocument();
  });
});
