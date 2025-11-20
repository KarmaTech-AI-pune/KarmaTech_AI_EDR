import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WBSRow from './WBSRow';
import { WBSRowData } from '../types/wbs';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';

const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: '#FFFFFF',
  padding: '12px',
  borderBottom: `2px solid ${theme.palette.divider}`,
  height: '48px'
}));

const StickyHeaderCell = styled(HeaderCell)(({ theme }) => ({
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

const SummaryHeaderCell = styled(HeaderCell)(({ theme }) => ({
  backgroundColor: '#F5F5F5',
  color: theme.palette.text.primary,
  borderLeft: `1px solid ${theme.palette.divider}`
}));

const AddButtonRow = styled(TableRow)({
  height: '32px !important',
  '& > td': {
    padding: '0 !important',
    borderBottom: '1px solid rgba(224, 224, 224, 1) !important'
  }
});

const WBSTable: React.FC = () => {
  const {
    manpowerRows,
    odcRows,
    months,
    formType,
    editMode,
  } = useWBSDataContext();
  
  const { addNewRow } = useWBSActionsContext();
  
  const rows = formType === 'manpower' ? manpowerRows : odcRows;
  const manpowerCount = manpowerRows.filter(row => row.level === 1).length;

  const calculateChildTotals = (parentRow: WBSRowData) => {
    let childRows: WBSRowData[] = [];
    if (parentRow.level === 1) {
      const level2Children = rows.filter(r => r.level === 2 && r.parentId === parentRow.id);
      level2Children.forEach(l2 => {
        childRows = childRows.concat(rows.filter(r => r.level === 3 && r.parentId === l2.id));
      });
    } else if (parentRow.level === 2) {
      childRows = rows.filter(r => r.level === 3 && r.parentId === parentRow.id);
    }

    const totals = {
      plannedHours: {} as { [key: string]: { [key: string]: number } },
      totalHours: 0,
      odc: 0,
      odcHours: 0,
      totalCost: 0
    };

    childRows.forEach(child => {
      months.forEach(month => {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`;
        const monthlyHours = child.plannedHours[year]?.[monthName] || 0;

        if (!totals.plannedHours[year]) {
          totals.plannedHours[year] = {};
        }
        totals.plannedHours[year][monthName] = (totals.plannedHours[year][monthName] || 0) + monthlyHours;
      });

      totals.totalHours += child.totalHours;
      totals.odc += child.odc;
      totals.odcHours += child.odcHours || 0;
      totals.totalCost += child.totalCost;
    });

    return totals;
  };

  const getLevelColor = (level: number) => {
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
  };

  const renderAddButton = (level: 1 | 2 | 3, parentId?: string): JSX.Element => {
    // Calculate colspan based on formType
    let colspan = 4 + months.length; // Base columns: Work Description, Rate, Unit, months

    // Add columns for Resource Role and Resource Name if not ODC form
    // For ODC form, add 1 for Name column
    if (formType !== 'odc') {
      colspan += 2; // Add 2 for Resource Role and Resource Name
    } else {
      colspan += 1; // Add 1 for Name column in ODC form (Unit is already counted in base)
    }

    if (!editMode) {
      colspan += 1; // Add 1 for the delete button column
    }

    if (formType === 'odc') {
      colspan += 2; // Add 2 for ODC Hours and ODC Cost
    } else if (formType === 'manpower') {
      colspan += 2; // Add 2 for Total Hours and Total Cost
    } else {
      colspan += 3; // Add 3 for ODCs, Total Hours, and Total Cost
    }

    return (
      <AddButtonRow
        key={`add-button-level-${level}${parentId ? `-parent-${parentId}` : ''}`}
      >
        <TableCell
          colSpan={colspan}
          sx={{ bgcolor: getLevelColor(level) }}
        >
          <Button
            fullWidth
            size="small"
            sx={{
              height: '32px',
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: '#F5F5F5'
              }
            }}
            onClick={() => addNewRow(level, parentId)}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Add Level {level}
          </Button>
        </TableCell>
      </AddButtonRow>
    );
  };

  const getSequenceNumber = (row: WBSRowData): string => {
    if (row.level === 1) {
      // Calculate the index of this row among level 1 rows
      const level1Index = rows.filter(r => r.level === 1).findIndex(r => r.id === row.id) + 1;

      // If formType is 'odc', add the manpower count to continue numbering
      // Use the manpowerCount prop directly instead of reading from DOM
      const adjustedIndex = formType === 'odc' ? level1Index + manpowerCount : level1Index;
      return adjustedIndex.toString();
    } else if (row.level === 2) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow) {
        // Get the parent's sequence number which already has the form type adjustment
        const parentSequence = getSequenceNumber(parentRow);
        const level2Index = rows.filter(r => r.level === 2 && r.parentId === parentRow.id)
          .findIndex(r => r.id === row.id) + 1;
        return `${parentSequence}.${level2Index}`;
      }
    } else if (row.level === 3) {
      const level2Parent = rows.find(r => r.id === row.parentId);
      if (level2Parent) {
        // Get the parent's sequence number which already has the form type adjustment
        const parentSequence = getSequenceNumber(level2Parent);
        const level3Index = rows.filter(r => r.level === 3 && r.parentId === level2Parent.id)
          .findIndex(r => r.id === row.id) + 1;
        return `${parentSequence}.${level3Index}`;
      }
    }
    return '';
  };

  const renderRowsAndButtons = () => {
    const level1Rows = rows.filter(row => row.level === 1);
    const result: JSX.Element[] = [];

    level1Rows.forEach(level1Row => {
      result.push(
        <WBSRow
          key={level1Row.id}
          row={level1Row}
          childTotals={calculateChildTotals(level1Row)}
          sequenceNumber={getSequenceNumber(level1Row)}
          stickyColumn={true}
        />
      );

      const level2Rows = rows.filter(row => row.level === 2 && row.parentId === level1Row.id);
      level2Rows.forEach(level2Row => {
        result.push(
          <WBSRow
            key={level2Row.id}
            row={level2Row}
            childTotals={calculateChildTotals(level2Row)}
            sequenceNumber={getSequenceNumber(level2Row)}
            stickyColumn={true}
          />
        );

        const level3Rows = rows.filter(row => row.level === 3 && row.parentId === level2Row.id);
        level3Rows.forEach(level3Row => {
          result.push(
            <WBSRow
              key={level3Row.id}
              row={level3Row}
              childTotals={null}
              sequenceNumber={getSequenceNumber(level3Row)}
              stickyColumn={true}
            />
          );
        });

        if (!editMode) {
          result.push(renderAddButton(3, level2Row.id));
        }
      });

      if (!editMode) {
        result.push(renderAddButton(2, level1Row.id));
      }
    });

    if (!editMode) {
      result.push(renderAddButton(1));
    }

    return result;
  };

  return (
    <TableContainer sx={{
      overflowX: 'auto',
      '& .MuiTableCell-root': {
        px: 1.5,
        py: 1,
        fontSize: '0.875rem'
      }
    }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            {!editMode && (
              <HeaderCell sx={{ width: '48px', backgroundColor: '#FFFFFF' }}>

              </HeaderCell>
            )}
            <StickyHeaderCell sx={{ minWidth: '300px', backgroundColor: '#FFFFFF' }}>Work Description</StickyHeaderCell>
            {formType === 'odc' ? (
              <HeaderCell sx={{ minWidth: '150px' }}>Name</HeaderCell>
            ) : (
              <>
                <HeaderCell sx={{ minWidth: '150px' }}>Resource Role</HeaderCell>
                <HeaderCell sx={{ minWidth: '170px' }}>Resource Name</HeaderCell>
              </>
            )}
            <HeaderCell sx={{ minWidth: 100 }}>Rate</HeaderCell>
            {/* Add Unit column for both ODC and Manpower forms */}
            <HeaderCell sx={{ minWidth: '150px' }}>Unit</HeaderCell>
            {months.map(month => (
              <HeaderCell key={month} sx={{ minWidth: 100 }}>{month}</HeaderCell>
            ))}
            {formType === 'odc' ? (
              <>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODC Hours</SummaryHeaderCell>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODC Cost</SummaryHeaderCell>
              </>
            ) : (
              <>
                {formType !== 'manpower' && (
                  <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODCs</SummaryHeaderCell>
                )}
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Hours</SummaryHeaderCell>
                <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Cost</SummaryHeaderCell>
              </>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {renderRowsAndButtons()}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WBSTable;
