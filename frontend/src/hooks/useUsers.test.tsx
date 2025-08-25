import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsers } from './useUsers';
import * as usersApi from '../services/userApi';
import { AuthUser } from '../models/userModel';

// Mock the usersApi
vi.mock('../services/userApi', () => ({
  getAllUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

describe('useUsers', () => {
  const mockUsers: AuthUser[] = [
    { id: '1', userName: 'user1', email: 'user1@example.com', name: 'User One', password: 'password1', roles: [], standardRate: 0, isConsultant: false, createdAt: '' },
    { id: '2', userName: 'user2', email: 'user2@example.com', name: 'User Two', password: 'password2', roles: [], standardRate: 0, isConsultant: false, createdAt: '' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful mock responses
    (usersApi.getAllUsers as vi.Mock).mockResolvedValue(mockUsers);
    (usersApi.createUser as vi.Mock).mockImplementation((user: Omit<AuthUser, 'id'>) =>
      Promise.resolve({ ...user, id: '3' })
    );
    (usersApi.updateUser as vi.Mock).mockImplementation((id: string, user: Partial<AuthUser>) =>
      Promise.resolve({ ...mockUsers.find(u => u.id === id), ...user })
    );
    (usersApi.deleteUser as vi.Mock).mockResolvedValue(undefined);
  });

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useUsers());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.users).toEqual([]);
  });

  it('should fetch users successfully on mount', async () => {
    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.users).toEqual(mockUsers);
    });

    expect(usersApi.getAllUsers).toHaveBeenCalledTimes(1);
  });

  it('should handle error during fetchUsers', async () => {
    const errorMessage = 'Failed to fetch users';
    (usersApi.getAllUsers as vi.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.users).toEqual([]);
    });
  });

  it('should create a user successfully', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false)); // Wait for initial fetch

    const newUserPayload = { userName: 'user3', email: 'user3@example.com', name: 'User Three', password: 'password3', roles: [], standardRate: 0, isConsultant: false, createdAt: '' };
    const expectedCreatedUser = { ...newUserPayload, id: '3' };

    await act(async () => {
      await result.current.createUser(newUserPayload);
    });

    await waitFor(() => {
      expect(usersApi.createUser).toHaveBeenCalledWith(newUserPayload);
      expect(result.current.users).toHaveLength(3);
      expect(result.current.users[2]).toEqual(expectedCreatedUser);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle error during createUser', async () => {
    const errorMessage = 'Failed to create user';
    (usersApi.createUser as vi.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const newUserPayload = { userName: 'user3', email: 'user3@example.com', name: 'User Three', password: 'password3', roles: [], standardRate: 0, isConsultant: false, createdAt: '' };

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.createUser(newUserPayload);
      } catch (e) {
        caughtError = e;
      }
    });

    await waitFor(() => {
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe(errorMessage);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.users).toEqual(mockUsers);
    });
  });

  it('should update a user successfully', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedUserData = { name: 'Updated User One' };
    const expectedUpdatedUser = { ...mockUsers[0], name: 'Updated User One' };

    await act(async () => {
      await result.current.updateUser('1', updatedUserData);
    });

    await waitFor(() => {
      expect(usersApi.updateUser).toHaveBeenCalledWith('1', updatedUserData);
      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[0]).toEqual(expectedUpdatedUser);
      expect(result.current.users[1]).toEqual(mockUsers[1]);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle error during updateUser', async () => {
    const errorMessage = 'Failed to update user';
    (usersApi.updateUser as vi.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const updatedUserData = { name: 'Updated User One' };

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.updateUser('1', updatedUserData);
      } catch (e) {
        caughtError = e;
      }
    });

    await waitFor(() => {
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe(errorMessage);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.users).toEqual(mockUsers);
    });
  });

  it('should delete a user successfully', async () => {
    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteUser('1');
    });

    await waitFor(() => {
      expect(usersApi.deleteUser).toHaveBeenCalledWith('1');
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users).toEqual([mockUsers[1]]);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle error during deleteUser', async () => {
    const errorMessage = 'Failed to delete user';
    (usersApi.deleteUser as vi.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers());
    await waitFor(() => expect(result.current.loading).toBe(false));

    let caughtError: any;
    await act(async () => {
      try {
        await result.current.deleteUser('1');
      } catch (e) {
        caughtError = e;
      }
    });

    await waitFor(() => {
      expect(caughtError).toBeInstanceOf(Error);
      expect(caughtError?.message).toBe(errorMessage);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.users).toEqual(mockUsers);
    });
  });
});
