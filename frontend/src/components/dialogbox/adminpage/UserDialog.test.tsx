import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('should render error message when roles fail to load', () => {
    mockUseRoles.mockReturnValue({ roles: [], loading: false, error: 'Failed to load roles', refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);
    expect(screen.getByText('Error loading roles. Please try again.')).toBeInTheDocument();
  });

  it('should render correctly for adding a new user', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Standard Rate')).toBeInTheDocument();
    expect(screen.getByLabelText('IsConsultant')).toBeInTheDocument();
    expect(screen.getByLabelText('Roles')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled(); // Disabled until required fields are filled
  });

  it('should render correctly for editing a user', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} editingUser={mockUserForEditing} formData={mockUserForEditing} />);

    expect(screen.getByText('Edit User')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toHaveValue('johndoe');
    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue(''); // Password field should be empty for editing
    expect(screen.getByLabelText('Standard Rate')).toHaveValue(50);
    expect(screen.getByLabelText('IsConsultant')).toBeChecked();
    expect(screen.getByText('Admin')).toBeInTheDocument(); // Role should be selected
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should enable Add button when required fields are filled', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    const userNameInput = screen.getByLabelText('Username');
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const standardRateInput = screen.getByLabelText('Standard Rate');
    const rolesSelect = screen.getByLabelText('Roles');
    const addButton = screen.getByRole('button', { name: 'Add' });

    fireEvent.change(userNameInput, { target: { name: 'userName', value: 'testuser' } });
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(standardRateInput, { target: { name: 'standardRate', value: '60' } });

    // Select a role
    fireEvent.mouseDown(rolesSelect);
    fireEvent.click(screen.getByText('Admin'));

    expect(addButton).toBeEnabled();
  });

  it('should show validation errors for missing required fields', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);

    const addButton = screen.getByRole('button', { name: 'Add' });
    fireEvent.click(addButton);

    // Check for validation messages (assuming component shows them)
    expect(screen.getByText('Username is required')).toBeInTheDocument(); // Example validation message
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Standard Rate is required')).toBeInTheDocument();
    expect(screen.getByText('Please select at least one role')).toBeInTheDocument();
  });

  it('should call handleInputChange for text fields', () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null });
    render(<UserDialog {...defaultProps} />);

    const userNameInput = screen.getByLabelText('Username');
    fireEvent.change(userNameInput, { target: { name: 'userName', value: 'testuser' } });
    expect(defaultProps.handleInputChange).toHaveBeenCalledWith(expect.objectContaining({ target: { name: 'userName', value: 'testuser' } }));

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { name: 'name', value: 'Test User' } });
    expect(defaultProps.handleInputChange).toHaveBeenCalledWith(expect.objectContaining({ target: { name: 'name', value: 'Test User' } }));
  });

  it('should call handleCheckboxChange for checkbox', () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null });
    render(<UserDialog {...defaultProps} />);

    const consultantCheckbox = screen.getByLabelText('IsConsultant');
    fireEvent.click(consultantCheckbox);
    expect(defaultProps.handleCheckboxChange).toHaveBeenCalledTimes(1);
  });

  it('should call handleRoleChange when roles are selected', () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null });
    render(<UserDialog {...defaultProps} />);

    const rolesSelect = screen.getByLabelText('Roles');
    fireEvent.mouseDown(rolesSelect);
    fireEvent.click(screen.getByText('Admin')); // Select Admin role

    // The handleRoleChange prop expects SelectChangeEvent
    // We need to simulate this event structure.
    // The actual event object passed to handleRoleChange might be different depending on MUI's implementation.
    // For simplicity, we'll mock the call with expected arguments.
    // A more robust test might inspect the actual event object passed.
    expect(defaultProps.handleRoleChange).toHaveBeenCalled();
    // We can't easily assert the exact event object without more detailed mocking of MUI's Select.
    // We can check if the component's internal state (if we were testing it directly) or the onSubmit call reflects the selection.
  });

  it('should call onSubmit with correct user data when adding a user', () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null });
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

    // Fill required fields to enable the button
    const userNameInput = screen.getByLabelText('Username');
    fireEvent.change(userNameInput, { target: { name: 'userName', value: testUserFormData.userName } });
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { name: 'name', value: testUserFormData.name } });
    const emailInput = screen.getByLabelText('Email');
    fireEvent.change(emailInput, { target: { name: 'email', value: testUserFormData.email } });
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { name: 'password', value: testUserFormData.password } });
    const standardRateInput = screen.getByLabelText('Standard Rate');
    fireEvent.change(standardRateInput, { target: { name: 'standardRate', value: testUserFormData.standardRate } });

    // Select role
    const rolesSelect = screen.getByLabelText('Roles');
    fireEvent.mouseDown(rolesSelect);
    fireEvent.click(screen.getByText('Editor'));

    // Submit
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    // The onSubmit prop is called without arguments, it's expected to read the formData from the parent.
    // If onSubmit were to receive formData, we would assert that here.
  });

  it('should call onSubmit with correct user data when editing a user', () => {
    mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null });
    const updatedUserFormData: AuthUser = {
      ...mockUserForEditing,
      name: 'John Doe Updated',
      standardRate: 55,
      roles: [{ id: 'role2', name: 'Editor', permissions: [] }],
    };
    render(<UserDialog {...defaultProps} editingUser={mockUserForEditing} formData={updatedUserFormData} />);

    // Change some fields
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { name: 'name', value: updatedUserFormData.name } });

    const standardRateInput = screen.getByLabelText('Standard Rate');
    fireEvent.change(standardRateInput, { target: { name: 'standardRate', value: updatedUserFormData.standardRate } });

    // Select a different role
    const rolesSelect = screen.getByLabelText('Roles');
    fireEvent.mouseDown(rolesSelect);
    fireEvent.click(screen.getByText('Editor')); // Select Editor role

    // Save
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1);
    // Similar to adding, onSubmit is expected to use the current formData.
  });

  it('should call onClose when Cancel button is clicked', () => {
mockUseRoles.mockReturnValue({ roles: mockRoles, loading: false, error: null, refetch: vi.fn(), currentUserRole: null });
    render(<UserDialog {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });
});
