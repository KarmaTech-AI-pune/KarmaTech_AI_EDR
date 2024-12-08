import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Select,
  MenuItem,
  styled
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LevelSelect from './LevelSelect';
import { WBSOption, WBSRowData, WBSChildTotals } from '../../../types/wbs';

const NumberInput = styled('input')({
  width: '100%',
  padding: '8px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  '&:focus': {
    outline: 'none',
    borderColor: '#1976d2'
  }
});

const StyledSelect = styled(Select)({
  width: '100%',
  '& .MuiSelect-select': {
    padding: '8px 14px'
  }
});

interface Employee {
  id: number;
  name: string;
  standard_rate: number;
  role_id: number;
}

interface Role {
  id: number;
  name: string;
  min_rate: number;
  description: string;
}

interface WBSRowProps {
  row: WBSRowData;
  months: string[];
  roles: Role[];
  employees: Employee[];
  editMode: boolean;
  levelOptions: WBSOption[];
  childTotals: WBSChildTotals | null;
  onDelete: (id: number) => void;
  onLevelChange: (id: number, value: string) => void;
  onRoleChange: (id: number, roleId: string) => void;
  onEmployeeChange: (id: number, employeeId: string) => void;
  onCostRateChange: (id: number, value: string) => void;
  onHoursChange: (id: number, month: string, value: string) => void;
  onODCChange: (id: number, value: string) => void;
}

const WBSRow: React.FC<WBSRowProps> = ({
  row,
  months,
  roles,
  employees,
  editMode,
  levelOptions,
  childTotals,
  onDelete,
  onLevelChange,
  onRoleChange,
  onEmployeeChange,
  onCostRateChange,
  onHoursChange,
  onODCChange,
}) => {
  const roleId = row.role ? parseInt(row.role) : null;
  const selectedRole = roleId !== null ? roles.find(r => r.id === roleId) : undefined;
  const rateTooltip = selectedRole ? `Min Rate: ${selectedRole.min_rate}` : '';
  const employeesForRole = roleId !== null ? employees.filter(emp => emp.role_id === roleId) : [];

  const getMonthlyHours = (month: string): string => {
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (row.monthlyHours[year]?.[monthName] || '').toString();
  };

  const getChildTotalHours = (month: string): string => {
    if (!childTotals) return '';
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (childTotals.monthlyHours[year]?.[monthName] || '').toString();
  };

  return (
    <TableRow 
      sx={{ 
        '& > td': {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          bgcolor: row.level === 1 ? 'rgba(0, 0, 0, 0.06)' : 
                  row.level === 2 ? 'rgba(0, 0, 0, 0.03)' : 
                  'transparent',
          pl: '8px !important',
        }
      }}
    >
      <TableCell sx={{ width: '48px', p: '4px !important' }}>
        {!editMode && (
          <IconButton 
            size="small" 
            onClick={() => onDelete(row.id)}
            sx={{
              p: 0.5,
              '&:hover': {
                color: 'error.main'
              }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </TableCell>
      <TableCell>
        <LevelSelect
          level={row.level}
          value={row.title}
          options={levelOptions}
          disabled={editMode}
          onChange={(value) => onLevelChange(row.id, value)}
        />
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <StyledSelect
            value={row.role || ''}
            onChange={(e) => onRoleChange(row.id, e.target.value as string)}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
            disabled={editMode}
          >
            <MenuItem value="">Select Role</MenuItem>
            {roles.map(role => (
              <MenuItem key={role.id} value={role.id}>
                {role.name}
              </MenuItem>
            ))}
          </StyledSelect>
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <StyledSelect
            value={row.name || ''}
            onChange={(e) => onEmployeeChange(row.id, e.target.value as string)}
            size="small"
            disabled={!row.role || editMode}
            sx={{ bgcolor: 'background.paper' }}
          >
            <MenuItem value="">Select Name</MenuItem>
            {employeesForRole.map(employee => (
              <MenuItem key={employee.id} value={employee.id}>
                {employee.name}
              </MenuItem>
            ))}
          </StyledSelect>
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.costRate || ''}
            onChange={(e) => onCostRateChange(row.id, e.target.value)}
            disabled={editMode || !row.role}
            title={rateTooltip}
            style={{
              backgroundColor: editMode ? 'rgba(0, 0, 0, 0.04)' : 'white'
            }}
          />
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
      {months.map(month => (
        <TableCell key={month}>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              value={getMonthlyHours(month)}
              onChange={(e) => onHoursChange(row.id, month, e.target.value)}
              min="0"
              max="160"
              style={{
                backgroundColor: editMode ? 'rgba(0, 0, 0, 0.04)' : 'white'
              }}
              disabled={editMode}
            />
          ) : childTotals ? (
            <NumberInput
              type="number"
              value={getChildTotalHours(month)}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : (
            <Box sx={{ height: '37px' }} />
          )}
        </TableCell>
      ))}
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.odc || ''}
            onChange={(e) => onODCChange(row.id, e.target.value)}
            min="0"
            style={{
              backgroundColor: editMode ? 'rgba(0, 0, 0, 0.04)' : 'white'
            }}
            disabled={editMode}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.odc || ''}
            readOnly
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }}
          />
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.totalHours}
            readOnly
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.totalHours || ''}
            readOnly
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }}
          />
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.totalCost}
            readOnly
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.totalCost || ''}
            readOnly
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.04)'
            }}
          />
        ) : (
          <Box sx={{ height: '37px' }} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default WBSRow;
