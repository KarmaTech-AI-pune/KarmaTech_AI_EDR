import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import UserDialog from './UserDialog';
import { AuthUser } from '../../../models/userModel';
import { Role } from '../../../models/roleModel';
import { useRoles } from '../../../hooks/useRoles';

// Mock the useRoles hook
vi.mock('../../../hooks/useRoles', () => ({
  useRoles: vi.fn(),
}));

// Mock the AuthUser and Role types if they are complex, otherwise use simple objects
// For simplicity, we'll use simple objects here.
// If AuthUser or Role have specific methods or complex structures, more detailed mocks might be needed.

// Mock data
const mockRoles: Role[] = [
  { id: 'role1', name: 'Admin', permissions: [] },
  { id: 'role2', name: 'Editor', permissions: [] },
  { id: 'role3', name: 'Viewer', permissions: [] },
];

const mockUserForEditing: AuthUser = {
  id: 'user1',
  userName: 'johndoe',
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: '', // Password should be empty for editing
  roles: [{ id: 'role1', name: 'Admin', permissions: [] }],
  standardRate: 50,
  isConsultant: false,
  createdAt: new Date().toISOString(),
};

const defaultFormData = {
  userName: '',
  name: '',
  email: '',
  password: '',
  roles: [],
  standardRate: 0,
  isConsultant: false,
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
  editingUser: null,
  formData: defaultFormData,
  handleInputChange: vi.fn(),
  handleRoleChange: vi.fn(),
  handleCheckboxChange: vi.fn(),
};

// Mock the useRoles hook return values
const mockUseRoles = vi.mocked(useRoles);

describe('UserDialog', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock for useRoles (success state)
    mockUseRoles.mockReturnValue({
      roles: [
        { id: 'role1', name: 'Admin', permissions: [] },
        { id: 'role2', name: 'Editor', permissions: [] },
        { id: 'role3', name: 'Viewer', permissions: [] },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
      currentUserRole: null,
    });
  });

  it('should render loading state when roles are loading', () => {
    mockUseRoles.mockReturnValue({ roles: [], loading: true, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should render error message when roles fail to load', async () => {
    mockUseRoles.mockReturnValue({ roles: [], loading: false, error: new Error('Failed to load roles'), refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);
    await waitFor(() => expect(screen.getByText('Error loading roles. Please try again.')).toBeInTheDocument());
  });

  it('should render correctly for adding a new user', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: /standard rate/i })).toBeInTheDocument();
    expect(screen.getByLabelText('IsConsultant')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Roles select
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('should render correctly for editing a user', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} editingUser={mockUserForEditing} formData={mockUserForEditing} />);

    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /username/i })).toHaveValue('johndoe');
    expect(screen.getByRole('textbox', { name: /^name/i })).toHaveValue('John Doe');
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue(''); // Password field should be empty for editing
    expect(screen.getByRole('spinbutton', { name: /standard rate/i })).toHaveValue(50);
    expect(screen.getByLabelText('IsConsultant')).not.toBeChecked(); // isConsultant is false in mockUserForEditing
    expect(screen.getByText('Admin')).toBeInTheDocument(); // Role should be selected
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should enable Add button when required fields are filled', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    
    const filledFormData = {
      userName: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      roles: [{ id: 'role1', name: 'Admin', permissions: [] }],
      standardRate: 60,
      isConsultant: false,
    };
    
    render(<UserDialog {...defaultProps} formData={filledFormData} />);

    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeEnabled();
  });

  it('should show validation errors for missing required fields', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    // Wait for validation errors to appear (component shows them after submit is clicked)
    await waitFor(() => {
      expect(screen.getByText('Username is required')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText(/Standard rate must be greater than 0/i)).toBeInTheDocument();
    expect(screen.getByText('Select at least one role')).toBeInTheDocument();
  });

  it('should call handleInputChange for text fields', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    const userNameInput = screen.getByRole('textbox', { name: /username/i });
    fireEvent.change(userNameInput, { target: { name: 'userName', value: 'testuser' } });
    
    // Check that handleInputChange was called
    expect(defaultProps.handleInputChange).toHaveBeenCalled();

    const nameInput = screen.getByRole('textbox', { name: /^name/i });
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    
    // Check that handleInputChange was called again
    expect(defaultProps.handleInputChange).toHaveBeenCalledTimes(2);
  });

  it('should call handleCheckboxChange for checkbox', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    const consultantCheckbox = screen.getByLabelText('IsConsultant');
    fireEvent.click(consultantCheckbox);
    expect(defaultProps.handleCheckboxChange).toHaveBeenCalledTimes(1);
  });

  it('should call handleRoleChange when roles are selected', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    const user = userEvent.setup();
    render(<UserDialog {...defaultProps} />);

    // Get the Roles combobox (MUI Select)
    const comboboxes = screen.getAllByRole('combobox');
    const rolesSelect = comboboxes[0]; // First combobox is Roles

    // Click to open the dropdown
    fireEvent.mouseDown(rolesSelect);

    // Wait for listbox to appear
    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Find and click the Admin option
    const options = screen.getAllByRole('option');
    const adminOption = options.find(opt => opt.textContent?.includes('Admin'));
    
    if (!adminOption) throw new Error('Admin option not found');
    
    await user.click(adminOption);

    // Verify handleRoleChange was called
    expect(defaultProps.handleRoleChange).toHaveBeenCalled();
  });

  it('should call onSubmit with correct user data when adding a user', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    const testUserFormData = {
      userName: 'newuser',
      name: 'New User',
      email: 'new@example.com',
      password: 'newpassword',
      roles: [{ id: 'role2', name: 'Editor', permissions: [] }],
      standardRate: 70,
      isConsultant: true,
    };
    render(<UserDialog {...defaultProps} formData={testUserFormData} />);

    // Submit (all required fields are already filled in formData)
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should call onSubmit with correct user data when editing a user', async () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    const updatedUserFormData: AuthUser = {
      ...mockUserForEditing,
      name: 'John Doe Updated',
      standardRate: 55,
      roles: [{ id: 'role2', name: 'Editor', permissions: [] }],
    };
    render(<UserDialog {...defaultProps} editingUser={mockUserForEditing} formData={updatedUserFormData} />);

    // Save (all required fields are already filled in formData)
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', async () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});





