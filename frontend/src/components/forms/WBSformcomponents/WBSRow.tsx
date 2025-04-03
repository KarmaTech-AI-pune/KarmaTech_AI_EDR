import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Select,
  MenuItem,
  styled,
  Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LevelSelect from './LevelSelect';
import { WBSOption, WBSRowData, WBSChildTotals } from '../../../types/wbs';

const NumberInput = styled('input')({
  width: '100%',
  padding: '8px 12px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  height: '40px',
  boxSizing: 'border-box',
  '&:focus': {
    outline: 'none',
    borderColor: '#1976d2'
  }
});

const StyledSelect = styled(Select)({
  width: '100%',
  height: '40px',
  '& .MuiSelect-select': {
    padding: '8px 12px'
  }
});

const StickyCell = styled(TableCell)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  zIndex: 2,
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

interface Employee {
  id: string;
  name: string;
  standard_rate: number;
  role_id: string;
}

import { resourceRole as Role } from "../../../models";

interface WBSRowProps {
  row: WBSRowData;
  months: string[];
  roles: Role[];
  employees: Employee[];
  editMode: boolean;
  levelOptions: WBSOption[];
  childTotals: WBSChildTotals | null;
  sequenceNumber: string;
  stickyColumn?: boolean;
  onDelete: (id: string) => void;
  onLevelChange: (id: string, value: string) => void;
  onRoleChange: (id: string, roleId: string) => void;
  onEmployeeChange: (id: string, employeeId: string) => void;
  onCostRateChange: (id: string, value: string) => void;
  onHoursChange: (id: string, month: string, value: string) => void;
  onODCChange: (id: string, value: string) => void;
}

const WBSRow: React.FC<WBSRowProps> = ({
  row,
  months,
  roles,
  employees,
  editMode,
  levelOptions,
  childTotals,
  sequenceNumber,
  stickyColumn,
  onDelete,
  onLevelChange,
  onRoleChange,
  onEmployeeChange,
  onCostRateChange,
  onHoursChange,
  onODCChange,
}) => {
  const roleId = row.role ? row.role : null;
  const selectedRole = roleId !== null ? roles.find(r => r.id === roleId) : undefined;
  const rateTooltip = selectedRole ? `Min Rate: ${selectedRole.min_rate}` : '';
  const employeesForRole = employees;

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

  const WorkDescriptionCell = stickyColumn ? StickyCell : TableCell;

  const backgroundColor = row.level === 1 ? '#E3F2FD' : // Solid light blue
                         row.level === 2 ? '#E8F5E9' : // Solid light green
                         '#FFFFFF'; // Solid white

  return (
    <TableRow 
      sx={{ 
        height: '56px',
        '& > td': {
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          bgcolor: backgroundColor,
          p: '12px'
        }
      }}
    >
      {!editMode && (
        <TableCell sx={{ width: '48px', bgcolor: backgroundColor }}>
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
        </TableCell>
      )}
      <WorkDescriptionCell sx={{ bgcolor: backgroundColor }}>
        <Box sx={{ 
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography
            variant="body2"
            sx={{
              minWidth: '50px',
              color: 'text.primary',
              fontWeight: 'bold',
            }}
          >
            {sequenceNumber}
          </Typography>
          <LevelSelect
            level={row.level}
            value={row.title}
            options={levelOptions}
            disabled={editMode}
            onChange={(value) => onLevelChange(row.id, value)}
          />
        </Box>
      </WorkDescriptionCell>
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
          <Box sx={{ height: '40px' }} />
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
          <Box sx={{ height: '40px' }} />
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
              backgroundColor: editMode ? '#f5f5f5' : 'white'
            }}
          />
        ) : (
          <Box sx={{ height: '40px' }} />
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
                backgroundColor: editMode ? '#f5f5f5' : 'white'
              }}
              disabled={editMode}
            />
          ) : childTotals ? (
            <NumberInput
              type="number"
              value={getChildTotalHours(month)}
              readOnly
              style={{
                backgroundColor: '#f5f5f5'
              }}
            />
          ) : (
            <Box sx={{ height: '40px' }} />
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
              backgroundColor: editMode ? '#f5f5f5' : 'white'
            }}
            disabled={editMode}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.odc || ''}
            readOnly
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.totalHours}
            readOnly
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.totalHours || ''}
            readOnly
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <NumberInput
            type="number"
            value={row.totalCost}
            readOnly
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : childTotals ? (
          <NumberInput
            type="number"
            value={childTotals.totalCost || ''}
            readOnly
            style={{
              backgroundColor: '#f5f5f5'
            }}
          />
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
    </TableRow>
  );
};

export default WBSRow;
