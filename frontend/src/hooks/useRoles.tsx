import { useState, useEffect, useCallback } from 'react';
import {RoleDefinition } from '../models';
import * as rolesApi from '../services/rolesApi';

interface UseRolesReturn {
  roles: RoleDefinition[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
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
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch roles'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    refetch: fetchRoles,
  };
};
