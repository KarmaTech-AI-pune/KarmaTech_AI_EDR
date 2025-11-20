import React from 'react';
import { IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ActionButtonProps {
  iconType: 'edit' | 'delete';
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ iconType, onClick }) => {
  return (
    <IconButton onClick={onClick} size="small" color="primary">
      {iconType === 'edit' ? <EditIcon fontSize="small" /> : <DeleteIcon fontSize="small" color="error" />}
    </IconButton>
  );
};

export default ActionButton;
