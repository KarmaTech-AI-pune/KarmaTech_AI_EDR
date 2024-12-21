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
  
  value,
  options,
  disabled,
  onChange
}) => {
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      position: 'relative'
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
