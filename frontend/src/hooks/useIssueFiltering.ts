import { useState, useMemo } from 'react';
import { Issue } from '../types/todolist';

export const useIssueFiltering = (issues: Issue[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilters, setQuickFilters] = useState({
    'Only My Issues': false,
    'Recently Updated': false,
    'Done Issues': false
  });

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      const matchesSearch = issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           issue.key.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesQuickFilters = Object.entries(quickFilters).every(([filter, active]) => {
        if (!active) return true;
        
        switch (filter) {
          case 'Only My Issues':
            return issue.assignee?.id === 'john'; // Current user
          case 'Recently Updated':
            const daysSinceUpdate = Math.floor((new Date().getTime() - new Date(issue.updatedDate).getTime()) / (1000 * 60 * 60 * 24));
            return daysSinceUpdate <= 7;
          case 'Done Issues':
            return issue.status === 'Done';
          default:
            return true;
        }
      });

      return matchesSearch && matchesQuickFilters;
    });
  }, [issues, searchTerm, quickFilters]);

  return {
    searchTerm,
    setSearchTerm,
    quickFilters,
    setQuickFilters,
    filteredIssues
  };
};
