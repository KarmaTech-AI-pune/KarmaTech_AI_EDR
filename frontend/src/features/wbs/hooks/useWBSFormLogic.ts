import { useState } from 'react';
import { WBSStructureAPI, WBSOptionsAPI } from '../services/wbsApi';
import { ResourceAPI } from '../../../services/resourceApi';
import { WBSOption, WBSRowData, TaskType } from '../types/wbs';
import { resourceRole } from '../../../models/resourceRoleModel';
import { Employee } from '../../../models/employeeModel';

interface DeleteDialog {
  open: boolean;
  rowId?: string;
  childCount: number;
}

interface UseWBSFormLogicProps {
  projectId: string | null;
  formType: 'manpower' | 'odc';
  manpowerRows: WBSRowData[];
  setManpowerRows: React.Dispatch<React.SetStateAction<WBSRowData[]>>;
  odcRows: WBSRowData[];
  setOdcRows: React.Dispatch<React.SetStateAction<WBSRowData[]>>;
  months: string[];
  setMonths: React.Dispatch<React.SetStateAction<string[]>>;
  roles: resourceRole[];
  allEmployees: Employee[];
  level1Options: WBSOption[];
  level2OptionsMap: { [key: string]: WBSOption[] };
  level3OptionsMap: { [key: string]: WBSOption[] };
  setLevel3OptionsMap: React.Dispatch<React.SetStateAction<{ [key: string]: WBSOption[] }>>;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarSeverity: React.Dispatch<React.SetStateAction<'success' | 'error'>>;
  reloadWBSData: () => void;
  getProjectStartDate: () => string; // Temporarily expose
}

export const useWBSFormLogic = ({
  projectId,
  formType,
  manpowerRows,
  setManpowerRows,
  odcRows,
  setOdcRows,
  months,
  setMonths,
  roles,
  level1Options,
  level2OptionsMap,
  level3OptionsMap,
  setLevel3OptionsMap,
  setSnackbarOpen,
  setSnackbarMessage,
  setSnackbarSeverity,
  reloadWBSData,
}: UseWBSFormLogicProps) => {
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    childCount: 0
  });

  const addNewMonth = () => {
    const lastMonth = months[months.length - 1];
    const [monthName, yearStr] = lastMonth.split(' ');

    // Get the month index (0-11) for the last month
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(monthName);

    // Create date from the last month and year
    const lastDate = new Date(2000 + parseInt(yearStr), monthIndex);
    lastDate.setMonth(lastDate.getMonth() + 1);

    const newMonth = `${lastDate.toLocaleString('default', { month: 'long' })} ${lastDate.getFullYear().toString().slice(2)}`;
    setMonths([...months, newMonth]);
  };

  const addNewRow = (level: 1 | 2 | 3, parentId?: string) => {
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;

    const newRow: WBSRowData = {
      id: Date.now().toString(),
      level,
      title: '',
      role: null,
      name: null,
      assignedUserId: null,
      costRate: 0,
      plannedHours: {},
      odc: 0,
      odcHours: 0,
      totalHours: 0,
      totalCost: 0,
      parentId: parentId || null,
      taskType: formType === 'manpower' ? TaskType.Manpower : TaskType.ODC,
      unit: formType === 'manpower' ? 'month' : '',
      resource_role: null,
      resource_role_name: null,
      wbsOptionId: null
    };

    if (formType === 'odc') {
      newRow.odcHours = 0;
      newRow.odc = 0;
    }
    setRowsFunc([...currentRows, newRow]);
  };

  const handleDeleteClick = (rowId: string) => {
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const rowToDelete = currentRows.find(r => r.id === rowId);
    if (!rowToDelete) return;

    let childCount = 0;
    if (rowToDelete.level === 1) {
      childCount = currentRows.filter(r => r.parentId === rowId && r.level === 2).length;
    } else if (rowToDelete.level === 2) {
      childCount = currentRows.filter(r => r.parentId === rowId && r.level === 3).length;
    }

    setDeleteDialog({
      open: true,
      rowId,
      childCount
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      childCount: 0
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.rowId) {
      const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
      const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
      const rowToDelete = currentRows.find(r => r.id === deleteDialog.rowId);
      
      // Check if this is a newly added row (timestamp ID = 13 digits) or an existing row from backend
      // Timestamp IDs are created with Date.now().toString() which gives exactly 13 digits
      const isNewRow = /^\d{13}$/.test(deleteDialog.rowId || '');
      
      if (isNewRow || !projectId) {
        // For newly added rows that haven't been saved yet, just remove from local state
        // Also remove child rows if any
        const rowsToKeep = currentRows.filter(r => {
          // Remove the row itself
          if (r.id === deleteDialog.rowId) return false;
          
          // Remove direct children (level 2 if deleting level 1, level 3 if deleting level 2)
          if (r.parentId === deleteDialog.rowId) return false;
          
          // Remove grandchildren (level 3 if deleting level 1)
          if (rowToDelete?.level === 1) {
            const level2Children = currentRows.filter(row => row.parentId === deleteDialog.rowId && row.level === 2);
            const level2ChildIds = level2Children.map(row => row.id);
            if (level2ChildIds.includes(r.parentId || '')) return false;
          }
          
          return true;
        });
        
        setRowsFunc(rowsToKeep);
        setSnackbarMessage('WBS task removed successfully!');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        // For existing rows saved in backend, call the API
        try {
          await WBSStructureAPI.deleteWBSTask(projectId, deleteDialog.rowId);
          reloadWBSData(); // Use the reload function from useWBSData
          setSnackbarMessage('WBS task deleted successfully!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } catch (error) {
          console.error(`Error deleting WBS task from ${formType} form:`, error);
          setSnackbarMessage('Failed to delete WBS task');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      }
    }
    handleDeleteCancel();
  };

  const handleRoleChange = (rowId: string, roleId: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;

    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          role: roleId,
          name: null,
          costRate: 0
        };
      }
      return r;
    }));
  };

  const handleUnitChange = (rowId: string, unitValue: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const row = currentRows.find(r => r.id === rowId);

    if (!row) return;

    if (formType === 'manpower') return;

    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          unit: unitValue
        };
      }
      return r;
    }));
  };

  const handleResourceRoleChange = (rowId: string, value: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    const selectedRole = roles.find(role => role.id === value);
    const roleName = selectedRole ? selectedRole.name : null;

    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          resource_role: value,
          resource_role_name: roleName
        };
      }
      return r;
    }));
  };

  const handleEmployeeChange = async (rowId: string, employeeIdOrName: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;

    if (formType === 'odc') {
      setRowsFunc(prevRows => prevRows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            name: employeeIdOrName
          };
        }
        return row;
      }));
      return;
    }

    try {
      const employee = await ResourceAPI.getEmployeeById(employeeIdOrName);
      if (employee) {
        setRowsFunc(prevRows => prevRows.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              name: employeeIdOrName,
              costRate: employee.standard_rate
            };
          }
          return row;
        }));
      }
    } catch (error) {
      console.error('Error getting employee details:', error);
      setSnackbarMessage('Failed to get employee details');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleCostRateChange = (rowId: string, value: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const row = currentRows.find(r => r.id === rowId);

    if (!row || (formType !== 'odc' && !row.role)) return;

    if (value === '') {
      setRowsFunc(prevRows => prevRows.map(r => {
        if (r.id === rowId) {
          return {
            ...r,
            costRate: 0,
            totalCost: r.odc
          };
        }
        return r;
      }));
      return;
    }

    if (formType === 'odc') {
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        return;
      }

      setRowsFunc(prevRows => prevRows.map(r => {
        if (r.id === rowId) {
          const odcCost = r.totalHours * numericValue;
          return {
            ...r,
            costRate: numericValue,
            odc: odcCost,
            totalCost: odcCost
          };
        }
        return r;
      }));
      return;
    }

    const newRate = parseFloat(value);
    if (isNaN(newRate)) return;

    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          costRate: newRate,
          totalCost: (r.totalHours * newRate) + r.odc
        };
      }
      return r;
    }));
  };

  const handleHoursChange = (rowId: string, month: string, value: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    if (month === 'odcHours') {
      return;
    }

    const hours = value === '' ? 0 : Math.min(Math.max(parseInt(value) || 0, 0));

    setRowsFunc(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`;
        const newPlannedHours = {
          ...row.plannedHours,
          [year]: {
            ...(row.plannedHours[year] || {}),
            [monthName]: hours
          }
        };
        const totalHours = Object.values(newPlannedHours)
          .flatMap(yearHours => Object.values(yearHours))
          .reduce((sum, h) => sum + h, 0);

        if (formType === 'odc') {
          return {
            ...row,
            plannedHours: newPlannedHours,
            totalHours,
            odcHours: totalHours,
            odc: totalHours * row.costRate,
            totalCost: totalHours * row.costRate
          };
        }

        return {
          ...row,
          plannedHours: newPlannedHours,
          totalHours,
          totalCost: (totalHours * row.costRate) + row.odc
        };
      }
      return row;
    }));
  };

  const handleODCChange = (rowId: string, value: string) => {
    if (formType === 'odc') {
      return;
    }

    const setRowsFunc = setManpowerRows;
    const odc = value === '' ? 0 : Math.max(parseFloat(value) || 0, 0);

    setRowsFunc(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          odc,
          totalCost: (row.totalHours * row.costRate) + odc
        };
      }
      return row;
    }));
  };

  const handleLevelChange = async (rowId: string, value: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;

    let selectedOptionId: string | null = null;
    const changedRow = currentRows.find(r => r.id === rowId);

    if (changedRow) {
      let optionsToSearch: WBSOption[] = [];
      if (changedRow.level === 1) {
        optionsToSearch = level1Options;
      } else if (changedRow.level === 2 && changedRow.parentId) {
        const parentRow = currentRows.find(r => r.id === changedRow.parentId);
        if (parentRow && parentRow.title && level2OptionsMap[parentRow.title]) {
          optionsToSearch = level2OptionsMap[parentRow.title];
        }
      } else if (changedRow.level === 3 && changedRow.parentId) {
        const parentRow = currentRows.find(r => r.id === changedRow.parentId);
        if (parentRow && parentRow.title && level3OptionsMap[parentRow.title]) {
          optionsToSearch = level3OptionsMap[parentRow.title];
        }
      }
      const foundOption = optionsToSearch.find(option => option.value === value);
      selectedOptionId = foundOption ? foundOption.id : null;
    }

    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return { ...r, title: value, wbsOptionId: selectedOptionId };
      }
      return r;
    }));

    if (changedRow && changedRow.level === 2 && value) {
      try {
        const formTypeValue = formType === 'odc' ? 1 : 0;
        
        // Find the level 2 option by value to get its ID from the map
        let level2Option: WBSOption | undefined;
        for (const key in level2OptionsMap) {
          level2Option = level2OptionsMap[key].find(opt => opt.value === value);
          if (level2Option) break;
        }
        
        if (level2Option) {
          const level3Options = await WBSOptionsAPI.getLevel3Options(level2Option.id, formTypeValue);

          setLevel3OptionsMap(prevMap => ({
            ...prevMap,
            [value.toLowerCase()]: level3Options
          }));
        }
      } catch (error) {
        console.error(`Error loading level 3 options for ${value}:`, error);
      }
    }
  };

  return {
    deleteDialog,
    setDeleteDialog,
    addNewMonth,
    addNewRow,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleRoleChange,
    handleUnitChange,
    handleResourceRoleChange,
    handleEmployeeChange,
    handleCostRateChange,
    handleHoursChange,
    handleODCChange,
    handleLevelChange,
  };
};
