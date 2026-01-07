import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Box,
  MenuItem,
  Typography,
  Autocomplete,
  TextField,
  SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LevelSelect from './LevelSelect';
import { WBSRowData, WBSChildTotals } from '../types/wbs';
import { formatIndianCurrency } from '../utils/wbsUtils';
import {
  useWBSRowLogic,
  NumberInput,
  StyledSelect,
} from '../hooks/useWBSRowLogic';

// Define unit options locally for ODC form
const unitOptions = [
  { value: 'nos', label: 'Nos' },
  { value: 'ls', label: 'LS' },
  { value: 'km', label: 'Km' },
  { value: 'day', label: 'Day' },
  { value: 'hours', label: 'Hours' },
  { value: 'year', label: 'Year' }
];

// Assuming 'roles' and 'employees' from context have these structures
interface RoleType {
  id: string;
  name: string;
  min_rate?: number;
}

interface EmployeeType {
  id: string;
  name: string;
}

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
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    months,
    roles,
    editMode,
    formType,
    getLevelOptions,
    getPlannedHours,
    getChildTotalHours,
    WorkDescriptionCell,
    backgroundColor,
    rateTooltip,
    employeesForRole,
    handleDeleteClick,
    handleLevelChange,
    handleUnitChange,
    handleEmployeeChange,
    handleCostRateChange,
    handleHoursChange,
    handleODCChange,
    handleResourceRoleChange,
    handleAutocompleteInputChange,
    handleAutocompleteChange,
  } = useWBSRowLogic({ row, childTotals, sequenceNumber, stickyColumn });

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleEmployeeChange(row.id, e.target.value)}
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
                onChange={(e: SelectChangeEvent<unknown>) => handleResourceRoleChange(row.id, e.target.value as string)}
                size="small"
                sx={{ bgcolor: 'background.paper' }}
                disabled={editMode}
                displayEmpty
                renderValue={(selected: unknown) => {
                  const selectedStr = selected as string;
                  if (!selectedStr) return 'Select Resource Role';
                  if (row.resource_role_name) {
                    return row.resource_role_name;
                  }
                  const role = (roles as RoleType[]).find((r: RoleType) => r.id === selectedStr);
                  return role ? role.name : 'Select Resource Role';
                }}
              >
                <MenuItem value="">Select Resource Role</MenuItem>
                {(roles as RoleType[]).map((role: RoleType) => (
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
                options={employeesForRole as EmployeeType[]}
                getOptionLabel={(option: EmployeeType) => option.name}
                value={(employeesForRole as EmployeeType[]).find((emp: EmployeeType) => emp.id === row.name) || null}
                open={isDropdownOpen}
                popupIcon={null}
                onInputChange={handleAutocompleteInputChange}
                onChange={handleAutocompleteChange}
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
              type="number"
              step="any"
              value={row.costRate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCostRateChange(row.id, e.target.value)}
              min="0"
              onKeyDown={handleNumericKeyDown}
              disabled={editMode}
              style={{
                backgroundColor: editMode ? '#f5f5f5' : 'white'
              }}
            />
          ) : (
            <NumberInput
              type="number"
              step="any"
              value={row.costRate || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCostRateChange(row.id, e.target.value)}
              disabled={editMode || !row.role}
              onKeyDown={handleNumericKeyDown}
              min="0"
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
            value={formType === 'manpower' ? 'hours' : (row.unit || '')}
            onChange={(e: SelectChangeEvent<unknown>) => handleUnitChange(row.id, e.target.value as string)}
            size="small"
            sx={{ bgcolor: 'background.paper' }}
            disabled={editMode || formType === 'manpower'}
          >
            <MenuItem value="">Select Unit</MenuItem>
            {unitOptions.map((unit: { value: string, label: string }) => (
              <MenuItem key={unit.value} value={unit.value}>
                {unit.label}
              </MenuItem>
            ))}
          </StyledSelect>
        ) : (
          <Box sx={{ height: '40px' }} />
        )}
      </TableCell>
      {months.map((month: string) => (
        <TableCell key={month}>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              step="any"
              value={getPlannedHours(month)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHoursChange(row.id, month, e.target.value)}
              min="0"
              onKeyDown={handleNumericKeyDown}
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
                value={formatIndianCurrency(row.odc || 0)}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
                value={formatIndianCurrency(childTotals.odc || 0)}
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
                  type="number"
                  step="any"
                  value={row.odc || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleODCChange(row.id, e.target.value)}
                  min="0"
                  onKeyDown={handleNumericKeyDown}
                  style={{
                    backgroundColor: editMode ? '#f5f5f5' : 'white'
                  }}
                  disabled={editMode}
                />
              ) : childTotals ? (
                <NumberInput
                  type="text"
                  value={formatIndianCurrency(childTotals.odc || 0)}
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
                value={formatIndianCurrency(row.totalCost)}
                readOnly
                style={{
                  backgroundColor: '#f5f5f5'
                }}
              />
            ) : childTotals ? (
              <NumberInput
                type="text"
                value={formatIndianCurrency(childTotals.totalCost || 0)}
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
