import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface ItemActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
  showAddChild?: boolean;
  addChildLabel?: string;
  disabled?: boolean;
}

export const ItemActionButtons: React.FC<ItemActionButtonsProps> = ({
  onEdit,
  onDelete,
  onAddChild,
  showAddChild = false,
  addChildLabel = 'Add Child',
  disabled = false,
}) => {
  return (
    <Box display="flex" gap={1}>
      {showAddChild && onAddChild && (
        <Tooltip title={addChildLabel} arrow>
          <IconButton size="small" onClick={onAddChild} color="success" disabled={disabled}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <IconButton size="small" onClick={onEdit} color="primary" disabled={disabled}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onDelete} color="error" disabled={disabled}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};
