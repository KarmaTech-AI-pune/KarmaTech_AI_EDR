import { useEffect, useState, useCallback } from 'react';
import { Program } from '../types/types';
import { programService } from '../services/programService';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await programService.getAllPrograms();
      setPrograms(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch programs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProgram = async (payload: Omit<Program, 'id' | 'lastModifiedBy'>) => {
    const created = await programService.createProgram(payload);
    setPrograms(prev => [...prev, created]);
  };

  const updateProgram = async (id: number, payload: Program) => {
    const updated = await programService.updateProgram(id, payload);
    setPrograms(prev => prev.map(p => (p.id === id ? updated : p)));
  };

  const deleteProgram = async (id: number) => {
    await programService.deleteProgram(id);
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
    refetch: fetchPrograms
  };
};
