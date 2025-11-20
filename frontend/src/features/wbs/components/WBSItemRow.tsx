import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import ActionButton from './ActionButton';
import { IWBSItem, IWBSData } from '../types/wbs';
import { getWBSParentLabel } from '../utils/wbsUtils';

interface WBSItemRowProps {
  item: IWBSItem;
  index: number;
  onEdit: (item: IWBSItem) => void;
  onDelete: (item: IWBSItem) => void;
  allLevelsData: IWBSData;
}

const WBSItemRow: React.FC<WBSItemRowProps> = ({
  item,
  index,
  onEdit,
  onDelete,
  allLevelsData,
}) => {
  const parentLabel = getWBSParentLabel(item, allLevelsData);

  return (
    <TableRow>
      <TableCell>{index + 1}</TableCell>
      <TableCell>{item.label}</TableCell>
      <TableCell>{parentLabel || 'NULL'}</TableCell>
      <TableCell>
        <ActionButton iconType="edit" onClick={() => onEdit(item)} />
        <ActionButton iconType="delete" onClick={() => onDelete(item)} />
      </TableCell>
    </TableRow>
  );
};

export default WBSItemRow;
