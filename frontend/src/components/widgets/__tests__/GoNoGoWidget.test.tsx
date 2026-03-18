import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GoNoGoWidget from '../GoNoGoWidget';
import { authApi } from '../../../dummyapi/authApi';
import { goNoGoApi } from '../../../dummyapi/api';
import { projectManagementAppContext } from '../../../App';

// Mock dependencies
vi.mock('../../../dummyapi/authApi', () => ({
  authApi: {
    getCurrentUser: vi.fn()
  }
}));

vi.mock('../../../dummyapi/api', () => ({
  goNoGoApi: {
    getByProjectId: vi.fn()
  }
}));

vi.mock('../../../hooks/useAppNavigation', () => ({
  useAppNavigation: () => ({
    navigateToGoNoGoForm: vi.fn()
  })
}));

describe('GoNoGoWidget', () => {
  const mockContextValue = {
    setCurrentGoNoGoDecision: vi.fn()
  };

  const renderWidget = () => {
    return render(
      <projectManagementAppContext.Provider value={mockContextValue as any}>
        <GoNoGoWidget projectId={1} project={{ id: 1 } as any} />
      </projectManagementAppContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays permission warning when auth has not resolved permissions', async () => {
    // When auth promise never resolves, canViewBusinessDevelopment stays false,
    // and the data-fetch useEffect immediately sets loading=false, showing permission warning
    const authPromise = new Promise(() => { });
    (authApi.getCurrentUser as any).mockReturnValue(authPromise);
    
    renderWidget();
    await waitFor(() => {
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument();
    });
  });

  it('displays permission warning if user lacks rights', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: { permissions: [] } // No VIEW_BUSINESS_DEVELOPMENT
    });

    renderWidget();

    await waitFor(() => {
      expect(screen.getByText(/You do not have permission/i)).toBeInTheDocument();
    });
  });

  it('displays Make Decision button if no decision exists but user has rights', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: { permissions: ['VIEW_BUSINESS_DEVELOPMENT', 'EDIT_BUSINESS_DEVELOPMENT'] }
    });
    // Return no existing decision data
    (goNoGoApi.getByProjectId as any).mockResolvedValue(null);

    renderWidget();

    await waitFor(() => {
      expect(screen.getByText(/No decision has been made yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /make decision/i })).toBeInTheDocument();
    });
  });

  it('displays Go/No Go decision data when available', async () => {
    (authApi.getCurrentUser as any).mockResolvedValue({
      roleDetails: { permissions: ['VIEW_BUSINESS_DEVELOPMENT'] }
    });
    
    (goNoGoApi.getByProjectId as any).mockResolvedValue({
      status: 'Green',
      totalScore: 85,
      bidType: 'Standard',
      sector: 'IT',
      tenderFee: 500,
      marketingPlanScore: 8
    });

    renderWidget();

    await waitFor(() => {
      expect(screen.getByText(/Total Score:/i)).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText(/Bid Type: Standard/i)).toBeInTheDocument();
    });

    // Toggle detailed scores
    const detailedScoresBtn = screen.getByText(/Detailed Criteria Scores/i);
    fireEvent.click(detailedScoresBtn);

    await waitFor(() => {
      expect(screen.getByText(/Marketing Plan: 8/i)).toBeInTheDocument();
    });
  });
});
