import React from 'react';
import { IconButton } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

interface ExpandableIconProps {
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
  size?: 'small' | 'medium';
}

export const ExpandableIcon: React.FC<ExpandableIconProps> = ({
  isExpanded,
  hasChildren,
  onToggle,
  size = 'small',
}) => {
  if (!hasChildren) {
    return <div style={{ width: 24, height: 24 }} />;
  }

  return (
    <IconButton
      size={size}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      sx={{ width: 24, height: 24 }}
    >
      {isExpanded ? <ExpandMoreIcon fontSize={size} /> : <ChevronRightIcon fontSize={size} />}
    </IconButton>
  );
};
