import React, { useState, useEffect } from 'react';
import { Paper, Alert, Container, CircularProgress, Box } from '@mui/material';
import { useProject } from '../../context/ProjectContext';
import NotificationSnackbar from '../widgets/NotificationSnackbar';
import { WBSStructureAPI, WBSOptionsAPI } from '../../services/wbsApi';
import { ResourceAPI } from '../../services/resourceApi';
import DeleteWBSDialog from '../dialogbox/DeleteWBSDialog';
import WBSHeader from './WBSformcomponents/WBSHeader';
import WBSTable from './WBSformcomponents/WBSTable';
import WBSSummary from './WBSformcomponents/WBSSummary';
import { WBSOption, WBSRowData, TaskType } from '../../types/wbs';
import { resourceRole } from '../../models/resourceRoleModel';
import { Employee } from '../../models/employeeModel';

// Unit options are defined in WBSRow.tsx

interface WorkBreakdownStructureFormProps {
  formType?: 'manpower' | 'odc';
}

interface DeleteDialog {
  open: boolean;
  rowId?: string;
  childCount: number;
}

interface PlannedHours {
  [year: string]: {
    [month: string]: number;
  };
}

const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType = 'manpower' }) => { // Default to 'manpower' if undefined
  const { projectId } = useProject();
  // const [rows, setRows] = useState<WBSRowData[]>([]); // Keep original 'rows' for reference during refactor, remove later if unused
  const [manpowerRows, setManpowerRows] = useState<WBSRowData[]>([]);
  const [odcRows, setOdcRows] = useState<WBSRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<resourceRole[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isManpowerEditing, setIsManpowerEditing] = useState<boolean>(true); // State for Manpower form edit mode
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [isOdcEditing, setIsOdcEditing] = useState<boolean>(true); // State for ODC form edit mode
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    childCount: 0
  });
  const [level1Options, setLevel1Options] = useState<WBSOption[]>([]);
  const [level2Options, setLevel2Options] = useState<WBSOption[]>([]);
  const [level3OptionsMap, setLevel3OptionsMap] = useState<{ [key: string]: WBSOption[] }>({});

  // Helper function to find a WBS option by its ID
  const findWBSOptionById = (optionId: string, l1: WBSOption[], l2: WBSOption[], l3Map: { [key: string]: WBSOption[] }): WBSOption | undefined => {
    // Search in level 1 options
    let found = l1.find(opt => opt.id === optionId);
    if (found) return found;

    // Search in level 2 options
    found = l2.find(opt => opt.id === optionId);
    if (found) return found;

    // Search in level 3 options map
    for (const key in l3Map) {
      if (l3Map.hasOwnProperty(key)) {
        found = l3Map[key].find(opt => opt.id === optionId);
        if (found) return found;
      }
    }
    return undefined;
  };

  // State for calculated totals
  const [calculatedTotalHours, setCalculatedTotalHours] = useState<number>(0);
  const [calculatedTotalCost, setCalculatedTotalCost] = useState<number>(0);

  // We only use the setter function, not the value itself
  const [, setLastUpdateTime] = useState<number>(Date.now());

  // Separate function to calculate and set months based on provided rows
  const calculateAndSetMonths = (rowsToCalculateFrom: WBSRowData[]) => {
      const allMonths = new Set<string>();
      rowsToCalculateFrom.forEach((row) => {
        if (row.plannedHours) {
          Object.keys(row.plannedHours).forEach(year => {
            const yearStr = year.toString().slice(2); // Ensure year is string, then slice
            Object.keys(row.plannedHours[year]).forEach(monthName => {
              allMonths.add(`${monthName} ${yearStr}`);
            });
          });
        }
      });

      if (allMonths.size > 0) {
        const sortedMonths = Array.from(allMonths).sort((a, b) => {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          // Handle potential parsing errors
          const yearIntA = parseInt(yearA);
          const yearIntB = parseInt(yearB);
          if (isNaN(yearIntA) || isNaN(yearIntB)) return 0; // Default sort order if year parsing fails

          const yearDiff = yearIntA - yearIntB;
          if (yearDiff !== 0) return yearDiff;
          return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
        });
        setMonths(sortedMonths);
      } else {
         // If no months found in data, potentially set default months based on start date
         const startDate = getProjectStartDate();
         if (startDate) {
           const date = new Date(startDate);
           const initialMonths = [];
           for (let i = 0; i < 5; i++) { // Default to 5 months if none exist
             initialMonths.push(
               `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear().toString().slice(2)}`
             );
             date.setMonth(date.getMonth() + 1);
           }
           setMonths(initialMonths);
         } else {
           setMonths([]); // Set empty if no start date either
         }
      }
  };


  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Convert formType to numeric value for API
      const formTypeValue = formType === 'odc' ? 1 : 0; // 0 = Manpower, 1 = ODC

      let l1Options: WBSOption[] = [];
      let l2Options: WBSOption[] = [];
      let newLevel3OptionsMap: { [key: string]: WBSOption[] } = {};

      // Load WBS options (level 1 and 2)
      try {
        const [fetchedL1Options, fetchedL2Options] = await Promise.all([
          WBSOptionsAPI.getLevel1Options(formTypeValue),
          WBSOptionsAPI.getLevel2Options(formTypeValue)
        ]);

        l1Options = fetchedL1Options;
        l2Options = fetchedL2Options;

        setLevel1Options(l1Options);
        setLevel2Options(l2Options);
      } catch (error) {
        console.error('Error loading WBS options (level 1 & 2):', error);
        setSnackbarMessage('Failed to load work description options. Please ensure the backend service is running and database is properly configured with WBS options.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLevel1Options([]);
        setLevel2Options([]);
      }

      // Load roles and employees
      try {
        const [allRoles, employees] = await Promise.all([
          ResourceAPI.getAllRoles(),
          ResourceAPI.getAllEmployees()
        ]);
        setRoles(allRoles);
        setAllEmployees(employees);
      } catch (error) {
        console.error('Error loading roles and employees:', error);
        setSnackbarMessage('Failed to load resource roles and employees.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setRoles([]);
        setAllEmployees([]);
      }

      // Load existing WBS data if project is selected
      let initialManpowerRows: WBSRowData[] = [];
      let initialOdcRows: WBSRowData[] = [];
      if (projectId) {
        try {
          let wbsData: WBSRowData[] = await WBSStructureAPI.getProjectWBS(projectId);
         

          const allTransformedRows = wbsData.map((task) => {
            const transformedPlannedHours: PlannedHours = {};
            if (task.plannedHours && Array.isArray(task.plannedHours)) {
              task.plannedHours.forEach((monthEntry: any) => {
                if (monthEntry && typeof monthEntry === 'object' && monthEntry.year && monthEntry.month && typeof monthEntry.plannedHours === 'number') {
                  const yearStr = monthEntry.year.toString();
                  const monthName = monthEntry.month;
                  if (!transformedPlannedHours[yearStr]) {
                    transformedPlannedHours[yearStr] = {};
                  }
                  transformedPlannedHours[yearStr][monthName] = monthEntry.plannedHours;
                }
              });
            } else if (task.plannedHours && typeof task.plannedHours === 'object') {
              Object.assign(transformedPlannedHours, task.plannedHours);
            }

            const isOdcTask = task.taskType === TaskType.ODC;

            return {
              id: task.id,
              level: task.level,
              title: task.title,
              role: isOdcTask ? null : (task.assignedUserId || null),
              name: isOdcTask ? (task.resourceName ?? null) : (task.assignedUserId?.toString() || null),
              costRate: task.costRate || 0,
              plannedHours: transformedPlannedHours,
              odc: isOdcTask ? task.totalCost : (task.odc || 0),
              odcHours: isOdcTask ? task.totalHours : 0,
              totalHours: task.totalHours || 0,
              totalCost: task.totalCost || 0,
              parentId: task.parentId,
              taskType: task.taskType !== undefined ? task.taskType : (formType === 'odc' ? TaskType.ODC : TaskType.Manpower),
              unit: isOdcTask ? (task.resourceUnit ?? '') : 'month',
              resource_role: (task as any).resourceRoleId ?? null,
              resource_role_name: (task as any).resourceRoleName ?? null,
              wbsOptionId: (task as any).wbsOptionId ?? null // Capture wbsOptionId from backend
            };
          });

          // Filter rows based on TaskType
          initialManpowerRows = allTransformedRows.filter(row => row.taskType === TaskType.Manpower);
          initialOdcRows = allTransformedRows.filter(row => row.taskType === TaskType.ODC);

          setManpowerRows(initialManpowerRows);
          setOdcRows(initialOdcRows);
          calculateAndSetMonths(formType === 'manpower' ? initialManpowerRows : initialOdcRows);

          // Dynamically load level 3 options for existing level 2 tasks
          const uniqueLevel2Titles = new Set<string>();
          const rowsToProcess = formType === 'manpower' ? initialManpowerRows : initialOdcRows;
          rowsToProcess.filter(row => row.level === 2 && row.title).forEach(row => uniqueLevel2Titles.add(row.title));

          await Promise.all(
            Array.from(uniqueLevel2Titles).map(async (level2Title) => {
              try {
                const options = await WBSOptionsAPI.getLevel3Options(level2Title, formTypeValue);
                newLevel3OptionsMap[level2Title.toLowerCase()] = options;
              } catch (error) {
                console.error(`Error loading level 3 options for ${level2Title}:`, error);
              }
            })
          );
          setLevel3OptionsMap(newLevel3OptionsMap);

          // After all options are loaded, re-process allTransformedRows to set titles based on wbsOptionId
          const finalTransformedRows = allTransformedRows.map(row => {
            if (row.wbsOptionId) {
              const option = findWBSOptionById(row.wbsOptionId, l1Options, l2Options, newLevel3OptionsMap);
              if (option) {
                return { ...row, title: option.value.toLowerCase() };
              }
            }
            return row;
          });

          // Filter rows based on TaskType
          initialManpowerRows = finalTransformedRows.filter(row => row.taskType === TaskType.Manpower);
          initialOdcRows = finalTransformedRows.filter(row => row.taskType === TaskType.ODC);

          setManpowerRows(initialManpowerRows);
          setOdcRows(initialOdcRows);
          calculateAndSetMonths(formType === 'manpower' ? initialManpowerRows : initialOdcRows);

        } catch (error) {
          console.error('Error loading WBS data:', error);
          setSnackbarMessage('Failed to load WBS data');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          setManpowerRows([]);
          setOdcRows([]);
          setMonths([]);
          setLevel3OptionsMap({});
        }
      } else {
        setManpowerRows([]);
        setOdcRows([]);
        setMonths([]);
        setLevel3OptionsMap({});
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setSnackbarMessage('Failed to load initial data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [projectId, formType]);

  const getProjectStartDate = () => {
    // This function needs to be updated to get project details from an API if needed,
    // as the full project object is no longer in the context.
    // For now, we'll assume a start date is always present for simplicity.
    // A more robust solution would involve fetching project details using the projectId.
    return new Date().toISOString(); // Placeholder
  };

  const projectStartDate = getProjectStartDate();
  const isProject = !!projectId;

  if (!isProject || !projectStartDate) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Alert severity="error">
          Project start date is not set. Please set a start date for the project before creating a WBS.
        </Alert>
      </Paper>
      );
  }

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

    // No restriction on the number of level 1 rows for manpower anymore

    const newRow: WBSRowData = {
      id: Date.now().toString(),
      level,
      title: '',
      role: null,
      name: null,
      assignedUserId: null, // Initialize assignedUserId field
      costRate: 0,
      plannedHours: {},
      odc: 0,
      odcHours: 0,
      totalHours: 0,
      totalCost: 0,
      parentId: parentId || null,
      taskType: formType === 'manpower' ? TaskType.Manpower : TaskType.ODC, // Set taskType based on formType
      unit: formType === 'manpower' ? 'month' : '', // Set 'month' as default for manpower, empty for ODC
      resource_role: null, // Initialize resource_role for new rows
      resource_role_name: null, // Initialize resource_role_name for new rows
      wbsOptionId: null // Initialize wbsOptionId for new rows
    };

    // For ODC form, ensure odcHours and odc are initialized to 0
    if (formType === 'odc') {
      newRow.odcHours = 0;
      newRow.odc = 0;
    }
    setRowsFunc([...currentRows, newRow]);
  };

  const handleDeleteClick = (rowId: string) => {
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    // Find the row to be deleted to determine its level
    const rowToDelete = currentRows.find(r => r.id === rowId);
    if (!rowToDelete) return; // Row not found

    // Calculate child count based on the level of the row being deleted
    let childCount = 0;
    if (rowToDelete.level === 1) {
      childCount = currentRows.filter(r => r.parentId === rowId && r.level === 2).length;
    } else if (rowToDelete.level === 2) {
      childCount = currentRows.filter(r => r.parentId === rowId && r.level === 3).length;
    }
    // Level 3 rows have no children in this structure

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
    if (deleteDialog.rowId && projectId) {
      try {
        await WBSStructureAPI.deleteWBSTask(projectId, deleteDialog.rowId);
        await loadInitialData();
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
    handleDeleteCancel();
  };

  const handleRoleChange = (rowId: string, roleId: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;

    // For Manpower form, handle role selection logic
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

    // For manpower form, we don't allow changing the unit (it's always 'month')
    if (formType === 'manpower') return;

    // Handle unit selection for ODC form only
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
    // Find the role name for the selected role ID
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

    // For ODC form, we just store the name as text
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

    // For Manpower form, continue with employee lookup
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

    // For ODC form, we don't require a role to be assigned
    // For Manpower form, we still require a role
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

    // For ODC form, only allow numeric input
    if (formType === 'odc') {
      // Parse as number
      const numericValue = parseFloat(value);
      if (isNaN(numericValue)) {
        // If it's not a valid number, ignore the input
        return;
      }

      // Update with the numeric value
      setRowsFunc(prevRows => prevRows.map(r => {
        if (r.id === rowId) {
          // Calculate ODC cost based on total hours and new rate
          const odcCost = r.totalHours * numericValue;
          return {
            ...r,
            costRate: numericValue,
            odc: odcCost, // Update ODC cost
            totalCost: odcCost // For ODC form, totalCost is the same as odc
          };
        }
        return r;
      }));
      return;
    }

    // For Manpower form, continue with numeric validation
    const newRate = parseFloat(value);
    if (isNaN(newRate)) return; // Ignore invalid numbers

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

    // Regular monthly hours
    const hours = value === '' ? 0 : Math.min(Math.max(parseInt(value) || 0, 0));

    setRowsFunc(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`; // Assuming yearStr is 'YY'
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

        // For ODC form, update odcHours to match totalHours
        if (formType === 'odc') {
          return {
            ...row,
            plannedHours: newPlannedHours,
            totalHours,
            odcHours: totalHours,
            odc: totalHours * row.costRate, // Calculate ODC cost based on total hours and rate
            totalCost: totalHours * row.costRate // For ODC form, totalCost is the same as odc
          };
        }

        // For Manpower form, keep the original logic
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
    // Skip processing for ODC form since ODC cost is now calculated automatically
    if (formType === 'odc') {
      return;
    }

    const setRowsFunc = setManpowerRows; // Only for Manpower form now
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

    // Find the selected WBS option to get its ID
    let selectedOptionId: string | null = null;
    const changedRow = currentRows.find(r => r.id === rowId);

    if (changedRow) {
      let optionsToSearch: WBSOption[] = [];
      if (changedRow.level === 1) {
        optionsToSearch = level1Options;
      } else if (changedRow.level === 2) {
        optionsToSearch = level2Options;
      } else if (changedRow.level === 3 && changedRow.parentId) {
        const parentRow = currentRows.find(r => r.id === changedRow.parentId);
        if (parentRow && parentRow.title && level3OptionsMap[parentRow.title]) {
          optionsToSearch = level3OptionsMap[parentRow.title];
        }
      }
      const foundOption = optionsToSearch.find(option => option.value === value);
      selectedOptionId = foundOption ? foundOption.id : null;
    }

    // Update the row with the new title and wbsOptionId
    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return { ...r, title: value, wbsOptionId: selectedOptionId };
      }
      return r;
    }));

    // Check if this is a level 2 row and fetch level 3 options if needed
    if (changedRow && changedRow.level === 2 && value) {
      try {
        // Convert formType to numeric value for API
        const formTypeValue = formType === 'odc' ? 1 : 0; // 0 = Manpower, 1 = ODC

        // Fetch level 3 options for this level 2 value
        const level3Options = await WBSOptionsAPI.getLevel3Options(value, formTypeValue);

        // Update the level3OptionsMap with the new options
        setLevel3OptionsMap(prevMap => ({
          ...prevMap,
          [value]: level3Options
        }));
      } catch (error) {
        console.error(`Error loading level 3 options for ${value}:`, error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setSaveLoading(true);
      if (!projectId) {
        setSnackbarMessage('No project selected. Please select a project first.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Ensure all rows have the correct taskType set
      const updatedManpowerRows = manpowerRows.map(row => ({
        ...row,
        taskType: TaskType.Manpower
      }));

      const updatedOdcRows = odcRows.map(row => ({
        ...row,
        taskType: TaskType.ODC
      }));

      // Combine the latest data from both manpower and ODC states
      const combinedWbsData = [...updatedManpowerRows, ...updatedOdcRows];

      // Validate that all tasks in the combined data have titles
      const emptyTitleTasks = combinedWbsData.filter(row => !row.title);
      if (emptyTitleTasks.length > 0) {
        setSnackbarMessage('All tasks must have a work description selected. Please select a value for each task.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSaveLoading(false); // Ensure loading is stopped
        return;
      }

        if (
        !combinedWbsData ||
        combinedWbsData.length === 0 ||
        combinedWbsData == undefined
      ) {
        if (formType === "manpower") {
          setIsManpowerEditing(!isManpowerEditing);
        } else {
          setIsOdcEditing(!isOdcEditing);
        }

        setSnackbarMessage("Add levels to save the tasks");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);

        return;
      }

      // Save the combined, complete WBS data
      await WBSStructureAPI.setProjectWBS(projectId, combinedWbsData);

      // Update lastUpdateTime to trigger the useEffect to reload data
      setLastUpdateTime(Date.now()); // This will call loadWBSData again
      
      // Reload the WBS data to refresh the status
      await loadInitialData();
      
      // Toggle edit mode after successful save
      if (formType === 'manpower') {
        setIsManpowerEditing(!isManpowerEditing);
      } else {
        setIsOdcEditing(!isOdcEditing);
      }
      setSnackbarMessage('WBS data saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: unknown) {
      console.error('Complete Submit Error:', error);
      // Display more specific error message if available
      const errorMessage = error instanceof Error
        ? `Failed to save WBS data: ${error.message}`
        : 'Failed to save WBS data. Please check that all required fields are filled correctly.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

  const calculateOverallTotals = () => {
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const level3Rows = currentRows.filter(row => row.level === 3);
    const totalHours = level3Rows.reduce((sum, row) => sum + (row.totalHours || 0), 0);
    const totalCost = level3Rows.reduce((sum, row) => sum + row.totalCost, 0);
    console.log('calculateOverallTotals: Current Rows:', currentRows);
    console.log('calculateOverallTotals: Level 3 Rows:', level3Rows);
    console.log('calculateOverallTotals: Total Hours:', totalHours);
    console.log('calculateOverallTotals: Total Cost:', totalCost);
    return {
      totalHours: totalHours,
      totalCost: totalCost
    };
  };

  // Effect to recalculate totals whenever manpowerRows, odcRows, or formType changes
  useEffect(() => {
    console.log('useEffect: Recalculating totals...');
    const { totalHours, totalCost } = calculateOverallTotals();
    setCalculatedTotalHours(totalHours);
    setCalculatedTotalCost(totalCost);
    console.log('useEffect: Calculated Total Hours:', totalHours);
    console.log('useEffect: Calculated Total Cost:', totalCost);
  }, [manpowerRows, odcRows, formType]);

  // Loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formContent = (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        px: 0.5, // Minimal horizontal padding
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: 1,
          mb: 0.5 // Minimal margin between papers
        }
      }}
    >
      <Paper>
        <WBSHeader
          title={
            formType === 'manpower'
              ? 'Manpower Form'
              : formType === 'odc'
              ? 'ODC Form'
               : 'Work Breakdown Structure'
           }
           editMode={formType === 'manpower' ? isManpowerEditing : isOdcEditing} // Use form-specific state
           onEditModeToggle={() => formType === 'manpower' ? setIsManpowerEditing(!isManpowerEditing) : setIsOdcEditing(!isOdcEditing)}
           onAddMonth={addNewMonth}
           formType={formType === 'manpower'? TaskType.Manpower: TaskType.ODC}          
         />
      </Paper>

      <Paper>
        <WBSTable
           rows={formType === 'manpower' ? manpowerRows : odcRows} // Pass the correct rows based on formType
           months={months}
           roles={roles}
           employees={allEmployees}
           editMode={formType === 'manpower' ? isManpowerEditing : isOdcEditing} // Use form-specific state
           formType={formType}
           manpowerCount={manpowerRows.filter(row => row.level === 1).length} // Pass manpower count as prop
           levelOptions={{
             level1: level1Options,
            level2: level2Options,
            level3: level3OptionsMap
          }}
          onAddRow={addNewRow}
          onDeleteRow={handleDeleteClick}
          onLevelChange={handleLevelChange}
          onRoleChange={handleRoleChange}
          onUnitChange={handleUnitChange}
          onEmployeeChange={handleEmployeeChange}
          onCostRateChange={handleCostRateChange}
          onHoursChange={handleHoursChange}
          onODCChange={handleODCChange}
          onResourceRoleChange={handleResourceRoleChange} // Pass the new handler
        />
      </Paper>

      <Paper>
        <WBSSummary
          totalHours={calculatedTotalHours}
          totalCost={calculatedTotalCost}
          currency={''} // Currency is not available in the new context, needs to be fetched if required.
          disabled={(formType === 'manpower' ? isManpowerEditing : isOdcEditing)}
          onSave={handleSubmit}
          loading={saveLoading}
        />
      </Paper>

      <DeleteWBSDialog
        open={deleteDialog.open}
        childCount={deleteDialog.childCount}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );

  if (!isProject || !projectStartDate) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Alert severity="error">
          Project start date is not set. Please set a start date for the project before creating a WBS.
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      {formContent}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

export default WorkBreakdownStructureForm;
