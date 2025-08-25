import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UsersManagement from './UsersManagement';
import * as usersApi from '../../services/userApi';
import { useRoles } from '../../hooks/useRoles';
import { AuthUser } from '../../models/userModel';
import { RoleDefinition, PermissionType } from '../../models/index';

// Mock API services
vi.mock('../../services/userApi');
vi.mock('../../hooks/useRoles');

// Mock the UserDialog component
vi.mock('../dialogbox/adminpage/UserDialog', () => ({
  default: ({ open, onClose, onSubmit, editingUser, formData, handleInputChange, handleRoleChange, handleCheckboxChange }: any) => {
    if (!open) return null;
    return (
      <div data-testid="user-dialog">
        <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
        <input
          data-testid="username-input"
          name="userName"
          value={formData.userName}
          onChange={handleInputChange}
        />
        <input
          data-testid="name-input"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <input
          data-testid="email-input"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        {!editingUser && (
          <input
            data-testid="password-input"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        )}
        <input
          data-testid="standard-rate-input"
          name="standardRate"
          type="number"
          value={formData.standardRate}
          onChange={handleInputChange}
        />
        <input
          data-testid="is-consultant-checkbox"
          name="isConsultant"
          type="checkbox"
          checked={formData.isConsultant}
          onChange={handleCheckboxChange}
        />
        <select
          data-testid="roles-select"
          multiple
          value={formData.roles.map((role: RoleDefinition) => role.name)}
          onChange={(e) => handleRoleChange({ target: { value: Array.from(e.target.selectedOptions, option => option.value) } })}
        >
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
        <button onClick={onSubmit}>Submit</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));

const mockUsersApi = usersApi as jest.Mocked<typeof usersApi>;
const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>;

const mockRoles: RoleDefinition[] = [
  { id: '1', name: 'Admin', permissions: [PermissionType.SYSTEM_ADMIN] },
  { id: '2', name: 'User', permissions: [PermissionType.VIEW_PROJECT] },
];

const mockUsers: AuthUser[] = [
  {
    id: 'user1',
    userName: 'john.doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password1', // Added password
    roles: [mockRoles[0]],
    standardRate: 100,
    isConsultant: false,
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user2',
    userName: 'jane.smith',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'password2', // Added password
    roles: [mockRoles[1]],
    standardRate: 80,
    isConsultant: true,
    createdAt: '2023-01-02T00:00:00Z',
  },
];

describe('UsersManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsersApi.getAllUsers.mockResolvedValue(mockUsers);
    mockUseRoles.mockReturnValue({
      roles: mockRoles,
      loading: false,
      error: null,
      refetch: vi.fn(), // Added missing property
      currentUserRole: null, // Added missing property
    });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => { }); // Mock window.alert
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Renders correctly and displays user data
  test('renders UsersManagement and displays user data', async () => {
    render(<UsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('Users Management')).toBeInTheDocument();
      expect(screen.getByText('john.doe')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('No')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();

      expect(screen.getByText('jane.smith')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });

    expect(mockUsersApi.getAllUsers).toHaveBeenCalledTimes(1);
  });

  // Test 2: Handles "Add User" button click and opens dialog
  test('opens add user dialog when "Add User" button is clicked', async () => {
    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    await waitFor(() => {
      expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
      expect(screen.getByText('Add New User')).toBeInTheDocument();
      expect(screen.getByTestId('username-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });
  });

  // Test 3: Handles new user creation
  test('creates a new user successfully', async () => {
    mockUsersApi.createUser.mockResolvedValue(undefined); // Mock successful creation

    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'new.user' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new.user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'newpassword' } });
    fireEvent.change(screen.getByTestId('standard-rate-input'), { target: { value: '120' } });
    fireEvent.click(screen.getByTestId('is-consultant-checkbox'));

    fireEvent.change(screen.getByTestId('roles-select'), { target: { value: ['User'] } });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockUsersApi.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userName: 'new.user',
          name: 'New User',
          email: 'new.user@example.com',
          password: 'newpassword',
          standardRate: 120,
          isConsultant: true,
          roles: [{ id: '2', name: 'User', permissions: [PermissionType.VIEW_PROJECT] }],
        })
      );
    });
    expect(mockUsersApi.getAllUsers).toHaveBeenCalledTimes(2); // Initial load + after creation
    expect(screen.queryByTestId('user-dialog')).not.toBeInTheDocument(); // Dialog closed
  });

  // Test 4: Handles user update
  test('updates an existing user successfully', async () => {
    const updatedUser: AuthUser = { ...mockUsers[0], name: 'John Doe Updated', isConsultant: true };
    mockUsersApi.getUserById.mockResolvedValue(mockUsers[0]); // For handleEdit
    mockUsersApi.updateUser.mockResolvedValue(undefined); // Mock successful update

    render(<UsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('Edit')[0]); // Click edit for John Doe

    await waitFor(() => {
      expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    });

    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'John Doe Updated' } });
    fireEvent.click(screen.getByTestId('is-consultant-checkbox')); // Toggle isConsultant

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockUsersApi.updateUser).toHaveBeenCalledWith(
        'user1',
        expect.objectContaining({ name: 'John Doe Updated', isConsultant: true })
      );
    });
    expect(mockUsersApi.getAllUsers).toHaveBeenCalledTimes(2); // Initial load + after update
    expect(screen.queryByTestId('user-dialog')).not.toBeInTheDocument(); // Dialog closed
  });

  // Test 5: Handles user deletion
  test('deletes a user successfully', async () => {
    mockUsersApi.deleteUser.mockResolvedValue(undefined); // Mock successful deletion

    render(<UsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('john.doe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByLabelText('Delete')[0]); // Click delete for John Doe

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
      expect(mockUsersApi.deleteUser).toHaveBeenCalledWith('user1');
    });
    expect(mockUsersApi.getAllUsers).toHaveBeenCalledTimes(2); // Initial load + after deletion
  });

  // Test 6: Displays error message on user fetch failure
  test('displays error message if users fail to load', async () => {
    mockUsersApi.getAllUsers.mockRejectedValue(new Error('Failed to fetch users'));
    render(<UsersManagement />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading users:', expect.any(Error));
    });
  });

  // Test 7: Displays alert on user creation failure
  test('displays alert message if user creation fails', async () => {
    mockUsersApi.createUser.mockRejectedValue(new Error('Creation failed'));
    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'new.user' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'New User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'new.user@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'newpassword' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Creation failed');
    });
  });

  // Test 8: Displays alert on user update failure
  test('displays alert message if user update fails', async () => {
    mockUsersApi.getUserById.mockResolvedValue(mockUsers[0]);
    mockUsersApi.updateUser.mockRejectedValue(new Error('Update failed'));
    render(<UsersManagement />);

    fireEvent.click(screen.getAllByLabelText('Edit')[0]);
    await waitFor(() => {
      expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Update failed');
    });
  });

  // Test 9: Displays alert on user deletion failure
  test('displays alert message if user deletion fails', async () => {
    mockUsersApi.deleteUser.mockRejectedValue(new Error('Deletion failed'));
    render(<UsersManagement />);

    fireEvent.click(screen.getAllByLabelText('Delete')[0]);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to delete user');
    });
  });

  // Test 10: Handles cancel button in dialog
  test('closes the dialog when cancel button is clicked', async () => {
    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
    await waitFor(() => {
      expect(screen.getByTestId('user-dialog')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByTestId('user-dialog')).not.toBeInTheDocument();
  });

  // Test 11: Requires all fields for new user creation
  test('requires all fields for new user creation', async () => {
    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
    fireEvent.click(screen.getByRole('button', { name: /Submit/i })); // Submit empty form

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please fill in all required fields');
    });
    expect(mockUsersApi.createUser).not.toHaveBeenCalled();
  });

  // Test 12: Correctly displays "Is Consultant" status
  test('correctly displays "Is Consultant" status', async () => {
    render(<UsersManagement />);

    await waitFor(() => {
      expect(screen.getByText('john.doe').closest('tr')).toHaveTextContent('No');
      expect(screen.getByText('jane.smith').closest('tr')).toHaveTextContent('Yes');
    });
  });

  // Test 13: Role selection updates form data
  test('role selection updates form data', async () => {
    mockUsersApi.createUser.mockResolvedValue(undefined);
    render(<UsersManagement />);

    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));

    fireEvent.change(screen.getByTestId('username-input'), { target: { value: 'test' } });
    fireEvent.change(screen.getByTestId('name-input'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password' } });

    fireEvent.change(screen.getByTestId('roles-select'), { target: { value: ['Admin', 'User'] } });

    fireEvent.click(screen.getByRole('button', { name: /Submit/i }));

    await waitFor(() => {
      expect(mockUsersApi.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          roles: [
            { id: '1', name: 'Admin', permissions: [PermissionType.SYSTEM_ADMIN] },
            { id: '2', name: 'User', permissions: [PermissionType.VIEW_PROJECT] },
          ],
        })
      );
    });
  });
});
