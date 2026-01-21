import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import AddItemButton from '../../wbs/components/AddItemButton';
import { WBSLevel1List } from './WBSLevel1List';
import { IWBSLevel1, IWBSItem } from '../../wbs/types/wbs';

interface WBSHierarchyTableProps {
  level1Items: IWBSLevel1[];
  expandedLevel1Ids: Set<string>;
  expandedLevel2Ids: Set<string>;
  onToggleLevel1: (id: string) => void;
  onToggleLevel2: (id: string) => void;
  onAddItem: (level: number) => void;
  onEditItem: (item: IWBSItem) => void;
  onDeleteItem: (item: IWBSItem) => void;
  onAddLevel2: (parentId: string) => void;
  onAddLevel3: (parentId: string) => void;
  expandCollapseToggle?: React.ReactNode;
}

/**
 * Presentational component for displaying WBS hierarchy in a table format
 * This is a "dumb" component - receives all data and handlers via props
 */
export const WBSHierarchyTable: React.FC<WBSHierarchyTableProps> = ({
  level1Items,
  expandedLevel1Ids,
  expandedLevel2Ids,
  onToggleLevel1,
  onToggleLevel2,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAddLevel2,
  onAddLevel3,
  expandCollapseToggle,
}) => {
  return (
    <Box mb={4}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          {expandCollapseToggle}
        </Box>
        <Box display="flex" gap={1}>
          <AddItemButton onClick={() => onAddItem(1)} label="Add Level 1" />
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Parent</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <WBSLevel1List
              items={level1Items}
              expandedLevel1Ids={expandedLevel1Ids}
              expandedLevel2Ids={expandedLevel2Ids}
              onToggleLevel1={onToggleLevel1}
              onToggleLevel2={onToggleLevel2}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              onAddLevel2={onAddLevel2}
              onAddLevel3={onAddLevel3}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
