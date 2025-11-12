import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  Select,
  MenuItem,
  styled,
  Typography,
  Autocomplete,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LevelSelect from './LevelSelect';
import { WBSRowData, WBSChildTotals } from '../../../types/wbs';
import { useWBSDataContext, useWBSActionsContext } from '../../../context/wbs/WBSContext';

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

// Define unit options for ODC form
const unitOptions = [
  { value: 'nos', label: 'Nos' },
  { value: 'ls', label: 'LS' },
  { value: 'km', label: 'Km' },
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

interface WBSRowProps {
  row: WBSRowData;
  childTotals: WBSChildTotals | null;
  sequenceNumber: string;
  stickyColumn?: boolean;
}

const WBSRow: React.FC<WBSRowProps> = ({
  row,
  childTotals,
  sequenceNumber,
  stickyColumn,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Get data and actions from context
  const {
    months,
    roles,
    employees,
    editMode,
    formType,
    level1Options,
    level2Options,
    level3OptionsMap,
    manpowerRows,
    odcRows,
  } = useWBSDataContext();
  
  const {
    handleDeleteClick,
    handleLevelChange,
    handleUnitChange,
    handleEmployeeChange,
    handleCostRateChange,
    handleHoursChange,
    handleODCChange,
    handleResourceRoleChange,
  } = useWBSActionsContext();
  
  const rows = formType === 'manpower' ? manpowerRows : odcRows;
  const roleId = row.role ? row.role : null;
  const selectedRole = roleId !== null ? roles.find(r => r.id === roleId) : undefined;
  const rateTooltip = selectedRole ? `Min Rate: ${selectedRole.min_rate}` : '';
  const employeesForRole = employees;

  const getLevelOptions = () => {
    if (row.level === 1) return level1Options;
    if (row.level === 2) return level2Options;
    if (row.level === 3) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow && parentRow.title) return level3OptionsMap[parentRow.title] || [];
    }
    return [];
  };

  const getPlannedHours = (month: string): string => {
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (row.plannedHours[year]?.[monthName] || '').toString();
  };

  const getChildTotalHours = (month: string): string => {
    if (!childTotals) return '';
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (childTotals.plannedHours[year]?.[monthName] || '').toString();
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
            onClick={() => handleDeleteClick(row.id)}
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
            options={getLevelOptions()}
            disabled={editMode}
            onChange={(value) => handleLevelChange(row.id, value)}
          />
        </Box>
      </WorkDescriptionCell>
      {formType === 'odc' ? (
        <TableCell>
          {row.level === 3 ? (
            <TextField
              fullWidth
              size="small"
              value={row.name || ''}
              onChange={(e) => handleEmployeeChange(row.id, e.target.value)}
              disabled={editMode}
              sx={{
                bgcolor: 'background.paper',
                '& .MuiInputBase-root': { height: '40px' }
              }}
            />
          ) : (
            <Box sx={{ height: '40px' }} />
          )}
        </TableCell>
      ) : (
        <>
          <TableCell>
            {row.level === 3 && formType === 'manpower' ? (
              <StyledSelect
                value={row.resource_role || ''}
                onChange={(e) => handleResourceRoleChange(row.id, e.target.value as string)}
                size="small"
                sx={{ bgcolor: 'background.paper' }}
                disabled={editMode}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) return 'Select Resource Role';
                  // First try to use the stored role name, then lookup by ID
                  if (row.resource_role_name) {
                    return row.resource_role_name;
                  }
                  const role = roles.find(r => r.id === selected);
                  return role ? role.name : 'Select Resource Role';
                }}
              >
                <MenuItem value="">Select Resource Role</MenuItem>
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
            {row.level === 3 && formType === 'manpower' ? (
              <Autocomplete
                options={employeesForRole}
                getOptionLabel={(option) => option.name}
                value={employeesForRole.find(emp => emp.id === row.name) || null}
                open={isDropdownOpen}
                popupIcon={null}
                onInputChange={(_event, value, reason) => {
                  if (reason === 'input') {
                    setIsDropdownOpen(!!value);
                  }
                }}
                onChange={(_event, newValue) => {
                  handleEmployeeChange(row.id, newValue ? newValue.id : '');
                  setIsDropdownOpen(false);
                }}
                onClose={() => setIsDropdownOpen(false)}
                disabled={editMode}
                size="small"
                slotProps={{
                  listbox: {
                    sx: {
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }
                  }
                }}
                sx={{
                  bgcolor: 'background.paper',
                  width: '100%',
                  '& .MuiAutocomplete-inputRoot': {
                    paddingRight: '0 !important'
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Name"
                    sx={{
                      '& .MuiInputBase-root': {
                        height: '40px',
                        padding: '0 0 0 6px',
                        width: '100%'
                      },
                      '& .MuiAutocomplete-input': {
                        padding: '7.5px 0 7.5px 6px !important',
                        textOverflow: 'initial',
                        whiteSpace: 'normal',
                        width: '100%',
                        fontSize: '0.875rem'
                      }
                    }}
                  />
                )}
              />
            ) : (
              <Box sx={{ height: '40px' }} />
            )}
          </TableCell>
        </>
      )}
      <TableCell>
        {row.level === 3 ? (
          formType === 'odc' ? (
            <NumberInput
              type="text"
              value={row.costRate || ''}
              onChange={(e) => handleCostRateChange(row.id, e.target.value)}
              min="0"
              disabled={editMode}
              style={{
                backgroundColor: editMode ? '#f5f5f5' : 'white'
              }}
            />
          ) : (
            <NumberInput
              type="text"
              value={row.costRate || ''}
              onChange={(e) => handleCostRateChange(row.id, e.target.value)}
              disabled={editMode || !row.role}
              title={rateTooltip}
              style={{
                backgroundColor: editMode ? '#f5f5f5' : 'white'
              }}
            />
          )
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
      <TableCell>
        {row.level === 3 ? (
          <StyledSelect
            value={formType === 'manpower' ? 'month' : (row.unit || '')}
            onChange={(e) => handleUnitChange(row.id, e.target.value as string)}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
            disabled={editMode || formType === 'manpower'}
          >
            <MenuItem value="">Select Unit</MenuItem>
            {unitOptions.map(unit => (
              <MenuItem key={unit.value} value={unit.value}>
                {unit.label}
              </MenuItem>
            ))}
          </StyledSelect>
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
      {months.map(month => (
        <TableCell key={month}>
          {row.level === 3 ? (
            <NumberInput
              type="text"
              value={getPlannedHours(month)}
              onChange={(e) => handleHoursChange(row.id, month, e.target.value)}
              min="0"
              style={{
                backgroundColor: editMode ? '#f5f5f5' : 'white'
              }}
              disabled={editMode}
            />
          ) : childTotals ? (
            <NumberInput
              type="text"
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
      {formType === 'odc' ? (
        <>
          <TableCell>
            {row.level === 3 ? (
              <NumberInput
                type="text"
                value={row.odcHours || ''}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
                value={childTotals.odcHours || ''}
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
                type="text"
                value={row.odc || ''}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
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
        </>
      ) : (
        <>
          {formType !== 'manpower' && (
            <TableCell>
              {row.level === 3 ? (
                <NumberInput
                  type="text"
                  value={row.odc || ''}
                  onChange={(e) => handleODCChange(row.id, e.target.value)}
                  min="0"
                  style={{
                    backgroundColor: editMode ? '#f5f5f5' : 'white'
                  }}
                  disabled={editMode}
                />
              ) : childTotals ? (
                <NumberInput
                  type="text"
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
          )}
          <TableCell>
            {row.level === 3 ? (
              <NumberInput
                type="text"
                value={row.totalHours}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
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
                type="text"
                value={row.totalCost}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
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
        </>
      )}
    </TableRow>
  );
};

export default WBSRow;
