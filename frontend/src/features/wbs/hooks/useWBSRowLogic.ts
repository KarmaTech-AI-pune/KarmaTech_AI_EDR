import { useState, useCallback, useMemo } from 'react';
import { styled, TableCell, Select } from '@mui/material';
import { WBSRowData, WBSChildTotals } from '../types/wbs';
import { useWBSDataContext, useWBSActionsContext } from '../context/WBSContext';

// Export styled components
export const NumberInput = styled('input')({
  width: '100%',
  padding: '8px 12px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  height: '40px',
  boxSizing: 'border-box',
  '&:focus': {
    outline: 'none',
    borderColor: '#1976d2'
  },
  '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
  '&[type=number]': {
    '-moz-appearance': 'textfield',
  },
});

export const StyledSelect = styled(Select)({
  width: '100%',
  height: '40px',
  '& .MuiSelect-select': {
    padding: '8px 12px'
  }
});

export const StickyCell = styled(TableCell)(({ theme }) => ({
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

// Define unit options for ODC form. Not exported from here, will be local to WBSRow or a general utility.
const localUnitOptions = [ // Renamed to avoid export
  { value: 'nos', label: 'Nos' },
  { value: 'ls', label: 'LS' },
  { value: 'km', label: 'Km' },
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

// Assuming 'roles' from context has this structure or compatible.
interface RoleType {
  id: string;
  name: string;
  min_rate?: number; // Assuming min_rate exists for rateTooltip
}

interface EmployeeType {
  id: string;
  name: string;
}

interface UseWBSRowLogicProps {
  row: WBSRowData;
  childTotals: WBSChildTotals | null;
  sequenceNumber: string;
  stickyColumn?: boolean;
}

export const useWBSRowLogic = ({
  row,
  childTotals,
  stickyColumn,
}: UseWBSRowLogicProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const {
    months,
    roles, // roles is likely RoleType[]
    employees, // employees is likely EmployeeType[]
    editMode,
    formType,
    level1Options,
    level2OptionsMap,
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

  const rows = useMemo(() => (formType === 'manpower' ? manpowerRows : odcRows), [formType, manpowerRows, odcRows]);
  const roleId = row.resource_role; // Use resource_role for role ID
  const selectedRole = useMemo(() => (roleId !== null ? (roles as RoleType[]).find(r => r.id === roleId) : undefined), [roleId, roles]);
  const rateTooltip = selectedRole ? `Min Rate: ${selectedRole.min_rate}` : '';
  const employeesForRole = employees as EmployeeType[];

  const getLevelOptions = useCallback(() => {
    if (row.level === 1) return level1Options;
    if (row.level === 2) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow && parentRow.title) return level2OptionsMap[parentRow.title] || [];
      return [];
    }
    if (row.level === 3) {
      const parentRow = rows.find(r => r.id === row.parentId);
      if (parentRow && parentRow.title) return level3OptionsMap[parentRow.title] || [];
    }
    return [];
  }, [row.level, row.parentId, rows, level1Options, level2OptionsMap, level3OptionsMap]);

  const getPlannedHours = useCallback((month: string): string => {
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (row.plannedHours[year]?.[monthName] || '').toString();
  }, [row.plannedHours]);

  const getChildTotalHours = useCallback((month: string): string => {
    if (!childTotals) return '';
    const [monthName, yearStr] = month.split(' ');
    const year = `20${yearStr}`;
    return (childTotals.plannedHours[year]?.[monthName] || '').toString();
  }, [childTotals]);

  const WorkDescriptionCell = stickyColumn ? StickyCell : TableCell;

  const backgroundColor = useMemo(() => (
    row.level === 1 ? '#E3F2FD' : // Solid light blue
      row.level === 2 ? '#E8F5E9' : // Solid light green
        '#FFFFFF' // Solid white
  ), [row.level]);


  const handleAutocompleteInputChange = useCallback((_event: React.SyntheticEvent, value: string, reason: string) => {
    if (reason === 'input') {
      setIsDropdownOpen(!!value);
    }
  }, []);

  const handleAutocompleteChange = useCallback((_event: React.SyntheticEvent, newValue: EmployeeType | null) => {
    handleEmployeeChange(row.id, newValue ? newValue.id : '');
    setIsDropdownOpen(false);
  }, [handleEmployeeChange, row.id]);

  return {
    isDropdownOpen,
    setIsDropdownOpen,
    months,
    roles, // Return roles as is, typed in hook
    employees, // Return employees as is, typed in hook
    editMode,
    formType,
    rows,
    unitOptions: localUnitOptions, // Return localUnitOptions
    handleDeleteClick,
    handleLevelChange,
    handleUnitChange,
    handleEmployeeChange,
    handleCostRateChange,
    handleHoursChange,
    handleODCChange,
    handleResourceRoleChange,
    getLevelOptions,
    getPlannedHours,
    getChildTotalHours,
    WorkDescriptionCell,
    backgroundColor,
    roleId,
    selectedRole,
    rateTooltip,
    employeesForRole,
    handleAutocompleteInputChange,
    handleAutocompleteChange,
  };
};
