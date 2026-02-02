import { useState, useEffect } from 'react';
import { programApi } from '../services/api/programApi';
import { Program } from '../types/program';

export const usePrograms = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await programApi.getAll();
      setPrograms(data);
    } catch (err) {
      setError('Failed to load programs');
      console.error('Error fetching programs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const refetch = () => {
    fetchPrograms();
  };

  return { programs, isLoading, error, refetch };
};
