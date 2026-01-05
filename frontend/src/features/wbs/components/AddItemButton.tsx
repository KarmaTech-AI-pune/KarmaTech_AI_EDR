import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddItemButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ 
  onClick, 
  label = 'Add New Item',
  variant = 'contained',
  size = 'medium'
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ textTransform: 'none' }}
    >
      {label}
    </Button>
  );
};

export default AddItemButton;
