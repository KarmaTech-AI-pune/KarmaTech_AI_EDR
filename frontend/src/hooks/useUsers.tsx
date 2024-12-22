import { useState, useEffect } from 'react';
import { AuthUser } from '../models/userModel';
import * as usersApi from '../services/userApi';

export const useUsers = () => {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (user: Omit<AuthUser, 'id'>) => {
    try {
      setLoading(true);
      const newUser = await usersApi.createUser(user);
      setUsers(prev => [...prev, newUser]);
      setError(null);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: string, user: Partial<AuthUser>) => {
    try {
      setLoading(true);
      const updatedUser = await usersApi.updateUser(id, user);
      setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
      setError(null);
      return updatedUser;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      setLoading(true);
      await usersApi.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};
