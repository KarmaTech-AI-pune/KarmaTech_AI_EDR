import React from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface AddItemButtonProps {
  onClick: () => void;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ textTransform: 'none' }}
    >
      Add New Item
    </Button>
  );
};

export default AddItemButton;
