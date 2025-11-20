import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddItemButton from './AddItemButton';
import WBSItemRow from './WBSItemRow';
import { IWBSItem, IWBSData } from '../types/wbs';

interface WBSLevelTableProps {
  title: string;
  items: IWBSItem[];
  level: number;
  onAddItem: (level: number) => void;
  onEditItem: (item: IWBSItem) => void;
  onDeleteItem: (item: IWBSItem) => void;
  allLevelsData: IWBSData; // For parent label lookup in WBSItemRow
}

const WBSLevelTable: React.FC<WBSLevelTableProps> = ({
  title,
  items,
  level,
  onAddItem,
  onEditItem,
  onDeleteItem,
  allLevelsData,
}) => {
  return (
    <Box mb={4}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6">{title}</Typography>
        <AddItemButton onClick={() => onAddItem(level)} />
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>S.No.</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Parent Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No items available for {title}.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <WBSItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  allLevelsData={allLevelsData}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default WBSLevelTable;
