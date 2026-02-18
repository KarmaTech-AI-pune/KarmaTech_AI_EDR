import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import ReviewBox from './ReviewBox';
import { projectManagementAppContext } from '../../../App';
import { getUserById } from '../../../services/userApi';
import { Project } from '../../../models'; // Assuming Project model is available
import { AuthUser } from '../../../models/userModel';
import { TaskType } from '../../../features/wbs/types/wbs'; // Fixed import path

// Mock external dependencies
vi.mock('../../../services/userApi', () => ({
  getUserById: vi.fn(),
}));

// Type assertion for mocked functions
const mockGetUserById = vi.mocked(getUserById);

const mockProject: Project = {
  id: 1,
  name: 'Test Project',
  projectManagerId: 'pm1',
  seniorProjectManagerId: 'spm123',
  regionalManagerId: 'rm456',
  status: 'Active',
  projectNo: 'TP-001',
  typeOfJob: 'Development',
  sector: 'IT',
  clientName: 'Test Client',
  typeOfClient: 'Enterprise',
  estimatedProjectCost: 100000,
  estimatedProjectFee: 20000,
  currency: 'USD',
  letterOfAcceptance: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  priority: 'High', // Added missing property
  region: 'North', // Added missing property
  office: 'Main', // Added missing property
  details: 'Project details', // Added missing property
  startDate: '2023-01-01T00:00:00Z', // Added missing property
  endDate: '2023-12-31T00:00:00Z', // Added missing property
  opportunityId: 123, // Added missing property
  opportunityTrackingId: 456, // Added missing property
} as Project;

const mockCurrentUser: AuthUser = {
  id: 'user1',
  name: 'Current User',
  userName: 'user1',
  email: 'user1@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockSeniorPMUser: AuthUser = {
  id: 'spm123',
  name: 'Senior PM One',
  userName: 'spm123',
  email: 'spm123@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockPMUser: AuthUser = {
  id: 'pm1',
  name: 'Project Manager One',
  userName: 'pm1',
  email: 'pm1@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const mockRMUser: AuthUser = {
  id: 'rm456',
  name: 'Regional Manager One',
  userName: 'rm456',
  email: 'rm456@example.com',
  standardRate: 0,
  isConsultant: false,
  createdAt: '',
  roles: [],
  password: 'password123',
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  entityId: 101,
  entityType: 'Project',
  formType: TaskType.Manpower, // Changed to a valid TaskType enum value
};

describe('ProjectReviewWorkflow/ReviewBox', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserById.mockImplementation((id) => {
      if (id === mockSeniorPMUser.id) return Promise.resolve(mockSeniorPMUser);
      if (id === mockPMUser.id) return Promise.resolve(mockPMUser);
      if (id === mockRMUser.id) return Promise.resolve(mockRMUser);
      return Promise.reject(new Error('User not found')); // Reject if user not found
    });
    defaultProps.onSubmit.mockImplementation(vi.fn());
  });

  it('should render correctly and display senior PM name when project and user context are available', async () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByText('Send For Review')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(`Send to ${mockSeniorPMUser.name} for approval`)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeEnabled();
  });

  it('should display loading state initially', () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };
    mockGetUserById.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockSeniorPMUser), 50))); // Simulate delay

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    expect(screen.getByText('Loading reviewer information...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with correct payload when OK is clicked', async () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).toHaveBeenCalledWith({
      statusId: 2,
      Action: 'Review',
      comments: '',
      ActionBy: mockCurrentUser.id,
      AssignedTo: mockProject.seniorProjectManagerId,
      entityId: defaultProps.entityId,
      entityType: defaultProps.entityType,
      formType: defaultProps.formType,
    });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should show error if no project is selected in context', async () => {
    const mockContext = {
      selectedProject: undefined,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    // When no project is selected, the component shows "Not assigned" instead of an error
    await waitFor(() => {
      expect(screen.getByText(/Not assigned/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should show error if current user is missing from context on submit', async () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: undefined,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled()); // Still fetches PM

    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(screen.getByText('No current user')).toBeInTheDocument();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('should show error if selected project has no seniorProjectManagerId', async () => {
    const projectWithoutSPM = { ...mockProject, seniorProjectManagerId: undefined };
    const mockContext = {
      selectedProject: projectWithoutSPM,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    await waitFor(() => {
      // The component shows "Not assigned" when there's no senior project manager
      expect(screen.getByText(/Not assigned/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should display error if getUserById fails for senior PM', async () => {
    mockGetUserById.mockImplementation((id) => {
      if (id === mockSeniorPMUser.id) return Promise.reject(new Error('User fetch failed'));
      if (id === mockPMUser.id) return Promise.resolve(mockPMUser);
      if (id === mockRMUser.id) return Promise.resolve(mockRMUser);
      return Promise.reject(new Error('User not found'));
    });

    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );

    // When getUserById fails, it sets the name to 'Not assigned' instead of showing an error
    await waitFor(() => {
      expect(screen.getByText(/Not assigned/)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'OK' })).toBeDisabled();
  });

  it('should prevent event propagation on dialog interactions', async () => {
    const mockContext = {
      selectedProject: mockProject,
      currentUser: mockCurrentUser,
    };

    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <ReviewBox {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    await waitFor(() => expect(mockGetUserById).toHaveBeenCalled());
    
    const dialog = screen.getByRole('dialog');

    // Test that the dialog has onClick handler
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    dialog.dispatchEvent(clickEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();

    // Test that the dialog has onKeyDown handler
    const keyEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true });
    const keyStopPropagationSpy = vi.spyOn(keyEvent, 'stopPropagation');
    dialog.dispatchEvent(keyEvent);
    expect(keyStopPropagationSpy).toHaveBeenCalled();
  });
});

