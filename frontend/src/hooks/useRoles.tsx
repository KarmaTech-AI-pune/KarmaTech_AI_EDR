import { useState, useEffect, useCallback } from 'react';
import {RoleDefinition } from '../models';
import * as rolesApi from '../services/rolesApi';

interface UseRolesReturn {
  roles: RoleDefinition[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  currentUserRole: string | null;
}

export const useRoles = (): UseRolesReturn => {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rolesApi.getAllRoles();
      setRoles(data as unknown as RoleDefinition[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Get current user role from localStorage
  const getCurrentUserRole = useCallback(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.roles?.[0]?.name || null;
    }
    return null;
  }, []);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
    currentUserRole: getCurrentUserRole()
  };
};
