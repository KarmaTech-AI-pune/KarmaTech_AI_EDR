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
import { resourceRole as ResourceRole, Employee } from  "../../../models";
import { WBSRowData, WBSOption } from '../../../types/wbs';

const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  padding: '12px',
  borderBottom: `2px solid ${theme.palette.divider}`,
  height: '48px'
}));

const SummaryHeaderCell = styled(HeaderCell)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.primary,
  borderLeft: `1px solid ${theme.palette.divider}`
}));

const AddButtonRow = styled(TableRow)({
  height: '32px !important',
  '& > td': {
    padding: '0 !important',
    borderBottom: '1px solid rgba(224, 224, 224, 0.5) !important'
  }
});

interface WBSTableProps {
  rows: WBSRowData[];
  months: string[];
  roles: ResourceRole[];
  employees: Employee[];
  editMode: boolean;
  levelOptions: {
    level1: WBSOption[];
    level2: WBSOption[];
    level3: { [key: string]: WBSOption[] };
  };
  onAddRow: (level: 1 | 2 | 3, parentId?: number) => void;
  onDeleteRow: (id: number) => void;
  onLevelChange: (id: number, value: string) => void;
  onRoleChange: (id: number, roleId: string) => void;
  onEmployeeChange: (id: number, employeeId: string) => void;
  onCostRateChange: (id: number, value: string) => void;
  onHoursChange: (id: number, month: string, value: string) => void;
  onODCChange: (id: number, value: string) => void;
}

const WBSTable: React.FC<WBSTableProps> = ({
  rows,
  months,
  roles,
  employees,
  editMode,
  levelOptions,
  onAddRow,
  onDeleteRow,
  onLevelChange,
  onRoleChange,
  onEmployeeChange,
  onCostRateChange,
  onHoursChange,
  onODCChange,
}) => {
  
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
      monthlyHours: {} as { [key: string]: { [key: string]: number } },
      totalHours: 0,
      odc: 0,
      totalCost: 0
    };

    childRows.forEach(child => {
      months.forEach(month => {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`;
        const monthlyHours = child.monthlyHours[year]?.[monthName] || 0;
        
        if (!totals.monthlyHours[year]) {
          totals.monthlyHours[year] = {};
        }
        totals.monthlyHours[year][monthName] = (totals.monthlyHours[year][monthName] || 0) + monthlyHours;
      });
      
      totals.totalHours += child.totalHours;
      totals.odc += child.odc;
      totals.totalCost += child.totalCost;
    });

    return totals;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return 'rgba(25, 118, 210, 0.08)'; // Light blue
      case 2:
        return 'rgba(76, 175, 80, 0.08)'; // Light green
      case 3:
        return 'rgba(0, 0, 0, 0)'; // Light purple for level 3 (instead of transparent)
      default:
        return 'transparent';
    }
  };

  const renderAddButton = (level: 1 | 2 | 3, parentId?: number): JSX.Element => {
    return (
      <AddButtonRow
        key={`add-button-level-${level}${parentId ? `-parent-${parentId}` : ''}`}
      >
        <TableCell 
          colSpan={editMode ? 8 + months.length : 9 + months.length}
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
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={() => onAddRow(level, parentId)}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Add Level {level}
          </Button>
        </TableCell>
      </AddButtonRow>
    );
  };

  const getLevelOptions = (row: WBSRowData): WBSOption[] => {
    if (row.level === 1) return levelOptions.level1;
    if (row.level === 2) return levelOptions.level2;
    if (row.level === 3) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow) {
        return levelOptions.level3[parentRow.title] || [];
      }
    }
    return [];
  };

  const getSequenceNumber = (row: WBSRowData): string => {
    if (row.level === 1) {
      const level1Index = rows.filter(r => r.level === 1).findIndex(r => r.id === row.id) + 1;
      return level1Index.toString();
    } else if (row.level === 2) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow) {
        const parentIndex = rows.filter(r => r.level === 1).findIndex(r => r.id === parentRow.id) + 1;
        const level2Index = rows.filter(r => r.level === 2 && r.parentId === parentRow.id)
          .findIndex(r => r.id === row.id) + 1;
        return `${parentIndex}.${level2Index}`;
      }
    } else if (row.level === 3) {
      const level2Parent = rows.find(r => r.id === row.parentId);
      if (level2Parent) {
        const level1Parent = rows.find(r => r.id === level2Parent.parentId);
        if (level1Parent) {
          const level1Index = rows.filter(r => r.level === 1).findIndex(r => r.id === level1Parent.id) + 1;
          const level2Index = rows.filter(r => r.level === 2 && r.parentId === level1Parent.id)
            .findIndex(r => r.id === level2Parent.id) + 1;
          const level3Index = rows.filter(r => r.level === 3 && r.parentId === level2Parent.id)
            .findIndex(r => r.id === row.id) + 1;
          return `${level1Index}.${level2Index}.${level3Index}`;
        }
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
          months={months}
          roles={roles}
          employees={employees}
          editMode={editMode}
          levelOptions={getLevelOptions(level1Row)}
          childTotals={calculateChildTotals(level1Row)}
          sequenceNumber={getSequenceNumber(level1Row)}
          onDelete={onDeleteRow}
          onLevelChange={onLevelChange}
          onRoleChange={onRoleChange}
          onEmployeeChange={onEmployeeChange}
          onCostRateChange={onCostRateChange}
          onHoursChange={onHoursChange}
          onODCChange={onODCChange}
        />
      );

      const level2Rows = rows.filter(row => row.level === 2 && row.parentId === level1Row.id);
      level2Rows.forEach(level2Row => {
        result.push(
          <WBSRow
            key={level2Row.id}
            row={level2Row}
            months={months}
            roles={roles}
            employees={employees}
            editMode={editMode}
            levelOptions={getLevelOptions(level2Row)}
            childTotals={calculateChildTotals(level2Row)}
            sequenceNumber={getSequenceNumber(level2Row)}
            onDelete={onDeleteRow}
            onLevelChange={onLevelChange}
            onRoleChange={onRoleChange}
            onEmployeeChange={onEmployeeChange}
            onCostRateChange={onCostRateChange}
            onHoursChange={onHoursChange}
            onODCChange={onODCChange}
          />
        );

        const level3Rows = rows.filter(row => row.level === 3 && row.parentId === level2Row.id);
        level3Rows.forEach(level3Row => {
          result.push(
            <WBSRow
              key={level3Row.id}
              row={level3Row}
              months={months}
              roles={roles}
              employees={employees}
              editMode={editMode}
              levelOptions={getLevelOptions(level3Row)}
              childTotals={null}
              sequenceNumber={getSequenceNumber(level3Row)}
              onDelete={onDeleteRow}
              onLevelChange={onLevelChange}
              onRoleChange={onRoleChange}
              onEmployeeChange={onEmployeeChange}
              onCostRateChange={onCostRateChange}
              onHoursChange={onHoursChange}
              onODCChange={onODCChange}
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
              <HeaderCell sx={{ width: '48px' }}>
                
              </HeaderCell>
            )}
            <HeaderCell sx={{ minWidth: '300px' }}>Work Description</HeaderCell>
            <HeaderCell sx={{ minWidth: '150px' }}>Resource Role</HeaderCell>
            <HeaderCell sx={{ minWidth: '150px' }}>Resource Name</HeaderCell>
            <HeaderCell sx={{ minWidth: 100 }}>Rate</HeaderCell>
            {months.map(month => (
              <HeaderCell key={month} sx={{ minWidth: 100 }}>{month}</HeaderCell>
            ))}
            <SummaryHeaderCell sx={{ minWidth: '100px' }}>ODCs</SummaryHeaderCell>
            <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Hours</SummaryHeaderCell>
            <SummaryHeaderCell sx={{ minWidth: '100px' }}>Total Cost</SummaryHeaderCell>
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
