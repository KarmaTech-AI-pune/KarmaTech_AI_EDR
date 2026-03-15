import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import GoNoGoFormWrapper from './GoNoGoFormWrapper';
import { projectManagementAppContext } from '../App';

// Mock the child component
vi.mock('./forms/GoNoGoForm', () => ({
  default: ({ onDecisionStatusChange }: any) => (
    <div data-testid="mock-gonogo-form">
      <button 
        data-testid="go-btn"
        onClick={() => onDecisionStatusChange('GO', 2)}
      >
        GO
      </button>
      <button 
        data-testid="nogo-btn"
        onClick={() => onDecisionStatusChange('NO GO', 2)}
      >
        NO GO
      </button>
    </div>
  )
}));

// Mock navigation hook
const mockNavigateToBusinessDevelopmentDetails = vi.fn();
vi.mock('../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({
    navigateToBusinessDevelopmentDetails: mockNavigateToBusinessDevelopmentDetails,
  })
}));

describe('GoNoGoFormWrapper Component', () => {
  const mockContext = {
    selectedProject: { id: 1, name: 'Test Project' },
    currentGoNoGoDecision: { id: 10, status: 0 },
    setCurrentGoNoGoDecision: vi.fn(),
    setGoNoGoDecisionStatus: vi.fn(),
    setGoNoGoVersionNumber: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (contextValue = mockContext) => {
    return render(
      <projectManagementAppContext.Provider value={contextValue as any}>
        <GoNoGoFormWrapper />
      </projectManagementAppContext.Provider>
    );
  };

  it('renders the GoNoGoForm correctly', () => {
    renderComponent();
    expect(screen.getByTestId('mock-gonogo-form')).toBeInTheDocument();
  });

  it('handles GO decision updates correctly and navigates back', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('go-btn'));

    expect(mockContext.setCurrentGoNoGoDecision).toHaveBeenCalledWith({
      id: 10,
      status: 1 // 1 for GO
    });
    expect(mockContext.setGoNoGoDecisionStatus).toHaveBeenCalledWith('GO');
    expect(mockContext.setGoNoGoVersionNumber).toHaveBeenCalledWith(2);
    expect(mockNavigateToBusinessDevelopmentDetails).toHaveBeenCalledWith(mockContext.selectedProject);
  });

  it('handles NO GO decision updates correctly and navigates back', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('nogo-btn'));

    expect(mockContext.setCurrentGoNoGoDecision).toHaveBeenCalledWith({
      id: 10,
      status: 0 // 0 for NO GO
    });
    expect(mockContext.setGoNoGoDecisionStatus).toHaveBeenCalledWith('NO GO');
    expect(mockContext.setGoNoGoVersionNumber).toHaveBeenCalledWith(2);
    expect(mockNavigateToBusinessDevelopmentDetails).toHaveBeenCalledWith(mockContext.selectedProject);
  });

  it('does not crack if context functions are missing', () => {
    // Omitting state setters and test if no error occurs
    const incompleteContext = {
      selectedProject: { id: 1 }
    };
    
    renderComponent(incompleteContext as any);
    
    // Clicking should not throw, though no spy calls happen. 
    fireEvent.click(screen.getByTestId('go-btn'));
    expect(mockNavigateToBusinessDevelopmentDetails).toHaveBeenCalledWith(incompleteContext.selectedProject);
  });
});
