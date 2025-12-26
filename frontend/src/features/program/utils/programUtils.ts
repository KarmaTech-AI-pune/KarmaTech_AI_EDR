import { Program } from '../types/types';

/**
 * Date formatting utility
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Convert ISO date to yyyy-mm-dd format for date inputs
 */
export const toDateInputFormat = (dateString: string): string => {
  return dateString.split('T')[0];
};

/**
 * Calculate program status based on dates
 */
export const getProgramStatus = (startDate: string, endDate: string): 'not-started' | 'active' | 'completed' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) {
    return 'not-started';
  } else if (now >= start && now <= end) {
    return 'active';
  } else {
    return 'completed';
  }
};

/**
 * Get status label and color for UI
 */
export const getStatusConfig = (status: 'not-started' | 'active' | 'completed') => {
  const configs = {
    'not-started': { label: 'Not Started', color: 'default' as const },
    'active': { label: 'Active', color: 'primary' as const },
    'completed': { label: 'Completed', color: 'success' as const }
  };
  return configs[status];
};

/**
 * Filter programs by search term
 */
export const filterPrograms = (programs: Program[], searchTerm: string): Program[] => {
  if (!searchTerm.trim()) return programs;
  
  const lowerSearch = searchTerm.toLowerCase();
  return programs.filter(program =>
    program.name.toLowerCase().includes(lowerSearch) ||
    program.description?.toLowerCase().includes(lowerSearch)
  );
};

/**
 * Sort programs by various criteria
 */
export const sortPrograms = (
  programs: Program[],
  sortBy: 'name' | 'startDate' | 'endDate' | 'status'
): Program[] => {
  const sorted = [...programs];
  
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'startDate':
      return sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    case 'endDate':
      return sorted.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
    case 'status':
      return sorted.sort((a, b) => {
        const statusA = getProgramStatus(a.startDate, a.endDate);
        const statusB = getProgramStatus(b.startDate, b.endDate);
        return statusA.localeCompare(statusB);
      });
    default:
      return sorted;
  }
};
