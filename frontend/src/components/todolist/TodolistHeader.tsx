import React from 'react';
import { Typography, TextField, InputAdornment, Chip, Box } from '@mui/material';
import { Search } from '@mui/icons-material';

interface TodolistHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  quickFilters: { [key: string]: boolean };
  setQuickFilters: React.Dispatch<React.SetStateAction<{ 'Only My Issues': boolean; 'Recently Updated': boolean; 'Done Issues': boolean; }>>;
  setShowCreateModal: (show: boolean) => void;
}

export const TodolistHeader: React.FC<TodolistHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  quickFilters,
  setQuickFilters,
}) => {
  return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"  >
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Quick filters:</Typography>
              {Object.entries(quickFilters).map(([filter, active]) => (
                <Chip
                  key={filter}
                  label={filter}
                  onClick={() => setQuickFilters(prevFilters => ({...prevFilters, [filter]: !active}))}
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  size="small"
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Box>
          </Box>
       
  );
};
