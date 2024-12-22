import { useState, useEffect, useCallback } from 'react';
import { AuthUser } from '../models/userModel';
import * as userApi from '../services/userApi';

interface UseUsersReturn {
  users: AuthUser[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createUser: (user: Omit<AuthUser, 'id'>) => Promise<void>;
  updateUser: (id: number, user: Partial<AuthUser>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch users'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (user: Omit<AuthUser, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.createUser(user);
      await fetchUsers(); // Refresh the list after creating
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create user'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, user: Partial<AuthUser>) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.updateUser(id, user);
      await fetchUsers(); // Refresh the list after updating
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.deleteUser(id);
      await fetchUsers(); // Refresh the list after deleting
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete user'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
