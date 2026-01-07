import React from 'react';
import { TextField, IconButton } from '@mui/material';
import { Search } from '@mui/icons-material';

interface ProgramSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * DUMB COMPONENT - Pure presentation, no logic
 * Controlled search input component
 */
export const ProgramSearchBar: React.FC<ProgramSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search programs',
  disabled = false
}) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      InputProps={{
        endAdornment: (
          <IconButton size="small" disabled>
            <Search />
          </IconButton>
        ),
        sx: {
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }
      }}
      sx={{
        width: 300
      }}
    />
  );
};
