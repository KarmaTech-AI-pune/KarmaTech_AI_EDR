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
  padding: '16px 8px',
  borderBottom: `2px solid ${theme.palette.divider}`
}));

const TotalHeaderCell = styled(HeaderCell)({
  backgroundColor: 'rgba(25, 118, 210, 0.08)',
  color: '#1976d2'
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

  const renderAddButton = (level: 1 | 2 | 3, parentId?: number, indentLevel: number = 0): JSX.Element => {
    return (
      <TableRow
        key={`add-button-level-${level}${parentId ? `-parent-${parentId}` : ''}`}
        sx={{
          height: '28px',
          '& > td': {
            bgcolor: 'transparent',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            py: 0
          }
        }}
      >
        <TableCell 
          colSpan={9 + months.length}
          sx={{
            p: 0,
          }}
        >
          <Button
            fullWidth
            size="small"
            sx={{
              ml: `${indentLevel * 3}rem`,
              height: '28px',
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
      </TableRow>
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

  const renderRowsAndButtons = () => {
    const level1Rows = rows.filter(row => row.level === 1);
    const result: JSX.Element[] = [];

    level1Rows.forEach(level1Row => {
      // Always render the row
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
        // Always render level 2 rows
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
          // Always render level 3 rows
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

        // Only render add button for level 3 if not in edit mode
        if (!editMode) {
          result.push(renderAddButton(3, level2Row.id, 2));
        }
      });

      // Only render add button for level 2 if not in edit mode
      if (!editMode) {
        result.push(renderAddButton(2, level1Row.id, 1));
      }
    });

    // Only render add button for level 1 if not in edit mode
    if (!editMode) {
      result.push(renderAddButton(1));
    }

    return result;
  };

  return (
    <TableContainer sx={{ 
      maxHeight: 'calc(100vh - 300px)',
      overflowX: 'auto',
      overflowY: 'auto',
      '& .MuiTableCell-root': {
        px: 1,
        py: 0.75,
        fontSize: '0.875rem'
      }
    }}>
      <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
        <TableHead>
          <TableRow>
            <HeaderCell sx={{ width: '48px', p: '4px !important' }}>
              Actions
            </HeaderCell>
            <HeaderCell sx={{ minWidth: '400px' }}>Task Level</HeaderCell>
            <HeaderCell sx={{ minWidth: '200px' }}>Role</HeaderCell>
            <HeaderCell sx={{ minWidth: '200px' }}>Name</HeaderCell>
            <HeaderCell sx={{ minWidth: 100 }}>Cost Rate</HeaderCell>
            {months.map(month => (
              <HeaderCell key={month} sx={{ minWidth: 100 }}>{month}</HeaderCell>
            ))}
            <HeaderCell sx={{ minWidth: 100 }}>ODCs</HeaderCell>
            <TotalHeaderCell sx={{ minWidth: 100 }}>Total Monthly Hours</TotalHeaderCell>
            <HeaderCell sx={{ minWidth: 100 }}>Total Cost</HeaderCell>
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
