import React, { useCallback, useMemo } from 'react';
import { Button, TableCell, TableRow, styled } from '@mui/material';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';
import { WBSRowData, TaskType, WBSChildTotals } from '../types/wbs';
// WBSRow is not directly imported here anymore as the hook will return data, not JSX elements that use WBSRow
// import WBSRow from '../components/WBSRow'; // Removed direct import

import { calculateChildTotals } from '../hooks/wbsCalculations';

// Styled components should be defined outside the hook or component to avoid re-creation
// These will be exported and used by WBSTable.tsx
export const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: '#FFFFFF',
  padding: '12px',
  borderBottom: `2px solid ${theme.palette.divider}`,
  height: '48px'
}));

export const StickyHeaderCell = styled(HeaderCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  zIndex: 3,
  backgroundColor: '#FFFFFF',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: theme.palette.divider,
  }
}));

export const SummaryHeaderCell = styled(HeaderCell)(({ theme }) => ({
  backgroundColor: '#F5F5F5',
  color: theme.palette.text.primary,
  borderLeft: `1px solid ${theme.palette.divider}`
}));

export const AddButtonRow = styled(TableRow)({
  height: '32px !important',
  '& > td': {
    padding: '0 !important',
    borderBottom: '1px solid rgba(224, 224, 224, 1) !important'
  }
});

// New type for structured row data to be returned by the hook
interface RenderedRowItem {
  type: 'data' | 'button';
  id?: string; // For WBSRow's key
  row?: WBSRowData;
  childTotals?: WBSChildTotals | null;
  sequenceNumber?: string;
  stickyColumn?: boolean;
  level?: 1 | 2 | 3; // For button
  parentId?: string; // For button
  colspan?: number; // For button
  bgColor?: string; // For button
}


export const useWBSTableLogic = () => {
  const {
    manpowerRows,
    odcRows,
    months,
    formType,
    editMode,
  } = useWBSDataContext();
  
  const { addNewRow } = useWBSActionsContext();
  
  const rows: WBSRowData[] = useMemo(() => (formType === 'manpower' ? manpowerRows : odcRows), [formType, manpowerRows, odcRows]);
  const manpowerCount = useMemo(() => manpowerRows.filter((rowItem: WBSRowData) => rowItem.level === 1).length, [manpowerRows]);

  const getLevelColor = useCallback((level: number): string => {
    switch (level) {
      case 1:
        return '#E3F2FD'; // Solid light blue
      case 2:
        return '#E8F5E9'; // Solid light green
      case 3:
        return '#FFFFFF'; // Solid white
      default:
        return '#FFFFFF';
    }
  }, []);

  // renderAddButton now returns data, not JSX
  const prepareAddButtonData = useCallback((level: 1 | 2 | 3, parentId?: string): RenderedRowItem => {
    let colspan = 4 + months.length;

    if (formType !== 'odc') {
      colspan += 2;
    } else {
      colspan += 1;
    }

    if (!editMode) {
      colspan += 1;
    }

    if (formType === 'odc') {
      colspan += 2;
    } else if (formType === 'manpower') {
      colspan += 2;
    } else {
      colspan += 3;
    }

    return {
      type: 'button',
      level,
      parentId,
      colspan,
      bgColor: getLevelColor(level)
    };
  }, [months, formType, editMode, getLevelColor]);

  const getSequenceNumber = useCallback((rowItem: WBSRowData): string => {
    if (rowItem.level === 1) {
      const level1Index = rows.filter((r: WBSRowData) => r.level === 1).findIndex((r: WBSRowData) => r.id === rowItem.id) + 1;
      const adjustedIndex = formType === 'odc' ? level1Index + manpowerCount : level1Index;
      return adjustedIndex.toString();
    } else if (rowItem.level === 2) {
      const parentRow = rows.find((r: WBSRowData) => r.id === rowItem.parentId);
      if (parentRow) {
        const parentSequence = getSequenceNumber(parentRow);
        const level2Index = rows.filter((r: WBSRowData) => r.level === 2 && r.parentId === parentRow.id)
          .findIndex((r: WBSRowData) => r.id === rowItem.id) + 1;
        return `${parentSequence}.${level2Index}`;
      }
    } else if (rowItem.level === 3) {
      const level2Parent = rows.find((r: WBSRowData) => r.id === rowItem.parentId);
      if (level2Parent) {
        const parentSequence = getSequenceNumber(level2Parent);
        const level3Index = rows.filter((r: WBSRowData) => r.level === 3 && r.parentId === level2Parent.id)
          .findIndex((r: WBSRowData) => r.id === rowItem.id) + 1;
        return `${parentSequence}.${level3Index}`;
      }
    }
    return '';
  }, [rows, formType, manpowerCount]);


  const getRenderedTableData = useCallback((): RenderedRowItem[] => {
    const level1Rows = rows.filter((rowItem: WBSRowData) => rowItem.level === 1);
    const result: RenderedRowItem[] = [];

    level1Rows.forEach((level1Row: WBSRowData) => {
      result.push({
        type: 'data',
        id: level1Row.id,
        row: level1Row,
        childTotals: calculateChildTotals(level1Row, rows, months),
        sequenceNumber: getSequenceNumber(level1Row),
        stickyColumn: true
      });

      const level2Rows = rows.filter((rowItem: WBSRowData) => rowItem.level === 2 && rowItem.parentId === level1Row.id);
      level2Rows.forEach((level2Row: WBSRowData) => {
        result.push({
          type: 'data',
          id: level2Row.id,
          row: level2Row,
          childTotals: calculateChildTotals(level2Row, rows, months),
          sequenceNumber: getSequenceNumber(level2Row),
          stickyColumn: true
        });

        const level3Rows = rows.filter((rowItem: WBSRowData) => rowItem.level === 3 && rowItem.parentId === level2Row.id);
        level3Rows.forEach((level3Row: WBSRowData) => {
          result.push({
            type: 'data',
            id: level3Row.id,
            row: level3Row,
            childTotals: null, // Level 3 rows have no children
            sequenceNumber: getSequenceNumber(level3Row),
            stickyColumn: true
          });
        });

        if (!editMode) {
          result.push(prepareAddButtonData(3, level2Row.id));
        }
      });

      if (!editMode) {
        result.push(prepareAddButtonData(2, level1Row.id));
      }
    });

    if (!editMode) {
      result.push(prepareAddButtonData(1));
    }

    return result;
  }, [rows, editMode, getSequenceNumber, prepareAddButtonData, months, calculateChildTotals]);

  return {
    months,
    formType,
    editMode,
    tableData: getRenderedTableData(), // Changed renderRowsAndButtons to return data
    addNewRow, // Expose addNewRow for buttons
  };
};
