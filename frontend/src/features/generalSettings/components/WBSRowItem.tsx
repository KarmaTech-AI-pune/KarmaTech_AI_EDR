import React from 'react';
import { TableRow, TableCell, Box, Typography } from '@mui/material';
import { ExpandableIcon } from '../common/ExpandableIcon';
import { ItemActionButtons } from '../common/ItemActionButtons';

export interface WBSItemRowProps {
  id: string;
  label: string;
  levelLabel: string;
  parentLabel?: string | null;
  isExpanded: boolean;
  hasChildren: boolean;
  backgroundColor?: string;
  paddingLeft?: number;
  fontWeight?: number | string;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddChild?: () => void;
  showAddChild?: boolean;
  addChildLabel?: string;
}

export const WBSItemRow: React.FC<WBSItemRowProps> = ({
  label,
  levelLabel,
  parentLabel,
  isExpanded,
  hasChildren,
  backgroundColor = '#fff',
  paddingLeft = 2,
  fontWeight = 400,
  onToggle,
  onEdit,
  onDelete,
  onAddChild,
  showAddChild = false,
  addChildLabel,
}) => {
  return (
    <TableRow sx={{ backgroundColor }}>
      <TableCell sx={{ paddingLeft, width: '15%' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <ExpandableIcon
            isExpanded={isExpanded}
            hasChildren={hasChildren}
            onToggle={onToggle}
          />
          <Typography variant="body2" fontWeight={fontWeight}>
            {levelLabel}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ width: '40%' }}>
        <Box sx={{ paddingLeft: hasChildren ? 0 : 2 }}>
          <Typography variant="body2" fontWeight={fontWeight}>
            {label}
          </Typography>
        </Box>
      </TableCell>
      <TableCell sx={{ width: '25%' }}>
        <Typography variant="body2" color="text.secondary">
          {parentLabel || '—'}
        </Typography>
      </TableCell>
      <TableCell sx={{ width: '20%' }}>
        <ItemActionButtons
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          showAddChild={showAddChild}
          addChildLabel={addChildLabel}
        />
      </TableCell>
    </TableRow>
  );
};
