import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAppNavigation } from './useAppNavigation';
import { } from '../App';
import { } from '../context/ProjectContext';
import { Project, OpportunityTracking } from '../models';
import { ProjectStatus } from '../models/types';

// Hoist mock variables using vi.hoisted()
const { mockSetSelectedProject, mockSetProjectId, mockNavigate } = vi.hoisted(() => ({
  mockSetSelectedProject: vi.fn(),
  mockSetProjectId: vi.fn(),
  mockNavigate: vi.fn()
}));

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// Mock projectManagementAppContext
vi.mock('../App', () => ({
  projectManagementAppContext: {
    // Mock useContext to return a specific value
    // This is a simplified mock; in a real app, you might provide a more complete context object
    // For testing purposes, we only need setSelectedProject
    _currentValue: { setSelectedProject: mockSetSelectedProject },
    Consumer: ({ children }: any) => children({ setSelectedProject: mockSetSelectedProject }),
    Provider: ({ children }: any) => children,
  },
}));

// Mock useProject context
vi.mock('../context/ProjectContext', () => ({
  useProject: () => ({
    setProjectId: mockSetProjectId,
  }),
}));

describe('useAppNavigation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as import('vitest').Mock).mockReturnValue(mockNavigate);
  });

  it('should navigate to home', () => {
    const { result } = renderHook(() => useAppNavigation());
    act(() => {
      result.current.navigateToHome();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should navigate to login', () => {
    const { result } = renderHook(() => useAppNavigation());
    act(() => {
      result.current.navigateToLogin();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should navigate to business development', () => {
    const { result } = renderHook(() => useAppNavigation());
    act(() => {
      result.current.navigateToBusinessDevelopment();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/business-development');
  });

  it('should navigate to project management', () => {
    const { result } = renderHook(() => useAppNavigation());
    act(() => {
      result.current.navigateToProjectManagement();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/project-management');
  });

  it('should navigate to admin', () => {
    const { result } = renderHook(() => useAppNavigation());
    act(() => {
      result.current.navigateToAdmin();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

describe('navigateToBusinessDevelopmentDetails', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    const mockProject: Project = { id: '123', name: 'Test Project', description: '', status: ProjectStatus.InProgress, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' } as unknown as Project;

    it('should navigate to business development details with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToBusinessDevelopmentDetails(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockNavigate).toHaveBeenCalledWith(`/business-development/${mockProject.id}`);
    });

    it('should navigate to business development without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToBusinessDevelopmentDetails(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/business-development');
    });
  });

  describe('navigateToProjectDetails', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    const mockProject: Project = { id: '456', name: 'Another Project', description: '', status: ProjectStatus.Completed, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' } as unknown as Project;

    it('should navigate to project details with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectDetails(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockSetProjectId).toHaveBeenCalledWith(String(mockProject.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/program-management/projects/project`);
    });

    it('should navigate to project management without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectDetails(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockSetProjectId).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/program-management');
    });
  });

  describe('navigateToGoNoGoForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    const mockProject: OpportunityTracking = { id: 789, name: 'GoNoGo Opp', description: '', status: ProjectStatus.InProgress, type: '' } as unknown as OpportunityTracking;

    it('should navigate to GoNoGo form with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToGoNoGoForm(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockNavigate).toHaveBeenCalledWith(`/business-development/${mockProject.id}/gonogo-form`);
    });

    it('should navigate to business development without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToGoNoGoForm(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/business-development');
    });
  });

  describe('navigateToBidPreparation', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    const mockProject: OpportunityTracking = { id: 101, name: 'Bid Prep Opp', description: '', status: ProjectStatus.InProgress, type: '' } as unknown as OpportunityTracking;

    it('should navigate to Bid Preparation with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToBidPreparation(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockNavigate).toHaveBeenCalledWith(`/business-development/${mockProject.id}/bid-preparation`);
    });

    it('should navigate to business development without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToBidPreparation(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/business-development');
    });
  });

  describe('navigateToProjectResources', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    const mockProject: Project = { id: '202', name: 'Project Resources', description: '', status: ProjectStatus.InProgress, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' } as unknown as Project;

    it('should navigate to project resources with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectResources(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockSetProjectId).toHaveBeenCalledWith(String(mockProject.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/program-management/project/resources`);
    });

    it('should navigate to project management without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectResources(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockSetProjectId).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/program-management');
    });
  });
});

