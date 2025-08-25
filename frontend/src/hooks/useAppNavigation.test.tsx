import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useAppNavigation } from './useAppNavigation';
import { projectManagementAppContext } from '../App';
import { useProject } from '../context/ProjectContext';
import { Project, OpportunityTracking } from '../models';
import { ProjectStatus } from '../types';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

// Mock projectManagementAppContext
const mockSetSelectedProject = vi.fn();
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
const mockSetProjectId = vi.fn();
vi.mock('../context/ProjectContext', () => ({
  useProject: () => ({
    setProjectId: mockSetProjectId,
  }),
}));

describe('useAppNavigation', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as vi.Mock).mockReturnValue(mockNavigate);
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
    const mockProject: Project = { id: '123', name: 'Test Project', description: '', status: ProjectStatus.ACTIVE, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' };

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
    const mockProject: Project = { id: '456', name: 'Another Project', description: '', status: ProjectStatus.COMPLETED, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' };

    it('should navigate to project details with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectDetails(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockSetProjectId).toHaveBeenCalledWith(String(mockProject.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/project-management/project`);
    });

    it('should navigate to project management without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectDetails(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockSetProjectId).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/project-management');
    });
  });

  describe('navigateToGoNoGoForm', () => {
    const mockProject: OpportunityTracking = { id: 789, name: 'GoNoGo Opp', description: '', status: ProjectStatus.PENDING, type: '' };

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
    const mockProject: OpportunityTracking = { id: 101, name: 'Bid Prep Opp', description: '', status: ProjectStatus.IN_PROGRESS, type: '' };

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
    const mockProject: Project = { id: '202', name: 'Project Resources', description: '', status: ProjectStatus.ACTIVE, projectNo: '', typeOfJob: '', sector: '', priority: '', clientName: '', typeOfClient: '', region: '', office: '', currency: '', estimatedProjectFee: 0, details: '', createdAt: '', updatedAt: '', seniorProjectManagerId: '', regionalManagerId: '', projectManagerId: '', estimatedProjectCost: 0, letterOfAcceptance: false, opportunityTrackingId: 0, feeType: '' };

    it('should navigate to project resources with project ID if project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectResources(mockProject);
      });
      expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProject);
      expect(mockSetProjectId).toHaveBeenCalledWith(String(mockProject.id));
      expect(mockNavigate).toHaveBeenCalledWith(`/project-management/project/resources`);
    });

    it('should navigate to project management without project ID if no project is provided', () => {
      const { result } = renderHook(() => useAppNavigation());
      act(() => {
        result.current.navigateToProjectResources(undefined);
      });
      expect(mockSetSelectedProject).not.toHaveBeenCalled();
      expect(mockSetProjectId).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/project-management');
    });
  });
});
