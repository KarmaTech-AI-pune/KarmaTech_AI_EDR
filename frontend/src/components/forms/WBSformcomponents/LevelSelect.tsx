import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  styled
} from '@mui/material';

const StyledSelect = styled(Select)({
  width: '100%',
  '& .MuiSelect-select': {
    padding: '8px 14px'
  }
});

interface WBSOption {
  value: string;
  label: string;
}

interface LevelSelectProps {
  level: 1 | 2 | 3;
  value: string;
  options: WBSOption[];
  disabled: boolean;
  onChange: (value: string) => void;
}

const LevelSelect: React.FC<LevelSelectProps> = ({
  level,
  value,
  options,
  disabled,
  onChange
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      width: level === 1 ? '60%' : level === 2 ? '80%' : '75%',
      pl: `${(level - 1) * 3}rem`,
      position: 'relative',
      '&::before': level > 1 ? {
        content: '""',
        position: 'absolute',
        left: `${(level - 1) * 3 - 1}rem`,
        top: '50%',
        width: '0.75rem',
        height: '1px',
        bgcolor: 'rgba(0, 0, 0, 0.23)'
      } : {}
    }}>
      <StyledSelect
        value={value}
        onChange={(e) => onChange(e.target.value as string)}
        size="small"
        sx={{ bgcolor: 'background.paper' }}
        disabled={disabled}
      >
        <MenuItem value="">Select</MenuItem>
        {options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
    </Box>
  );
};

export default LevelSelect;
