import React, { useState, useEffect, useContext } from 'react';
import { Paper, Alert, Container, CircularProgress, Box } from '@mui/material';
import { projectManagementAppContext } from '../../App';
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
import { FormWrapper } from './FormWrapper';

// Define unit options for both forms
const unitOptions = [
  { value: 'nos', label: 'Nos' },
  { value: 'ls', label: 'LS' },
  { value: 'km', label: 'Km' },
  { value: 'day', label: 'Day' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

interface WorkBreakdownStructureFormProps {
  formType?: 'manpower' | 'odc';
}

interface DeleteDialog {
  open: boolean;
  rowId?: string;
  childCount: number;
}

interface MonthlyHours {
  [year: string]: {
    [month: string]: number;
  };
}

const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType = 'manpower' }) => { // Default to 'manpower' if undefined
  const context = useContext(projectManagementAppContext);
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
  // We only use the setter function, not the value itself
  const [, setLastUpdateTime] = useState<number>(Date.now());
  // We only use the setter function, not the value itself
  const [, setAllWbsData] = useState<WBSRowData[]>([]); // State for all fetched data

  const loadWBSData = async (projectId: string) => {
    try {
      setLoading(true);
      let wbsData = await WBSStructureAPI.getProjectWBS(projectId);

      // Transform all WBS data first
      const allTransformedRows = wbsData.map((task) => {
        // Transform monthlyHours from potential array to nested object
        const transformedMonthlyHours: MonthlyHours = {};
        if (task.monthlyHours && Array.isArray(task.monthlyHours)) {
          task.monthlyHours.forEach((monthEntry: any) => {
            if (monthEntry && typeof monthEntry === 'object' && monthEntry.year && monthEntry.month && typeof monthEntry.plannedHours === 'number') {
              const yearStr = monthEntry.year.toString();
              const monthName = monthEntry.month;
              if (!transformedMonthlyHours[yearStr]) {
                transformedMonthlyHours[yearStr] = {};
              }
              transformedMonthlyHours[yearStr][monthName] = monthEntry.plannedHours;
            }
          });
        } else if (task.monthlyHours && typeof task.monthlyHours === 'object') {
          // Assume it's already in the correct format or handle other potential formats
          Object.assign(transformedMonthlyHours, task.monthlyHours);
        }

        return {
          id: task.id,
          level: task.level,
          title: task.title,
          role: task.assignedUserId || null,
          name: task.assignedUserId?.toString() || null,
          costRate: task.costRate || 0,
          monthlyHours: transformedMonthlyHours,
          odc: task.odc || 0,
          totalHours: task.totalHours || 0,
          totalCost: task.totalCost || 0,
          parentId: task.parentId,
          taskType: task.taskType !== undefined ? task.taskType : (formType === 'odc' ? TaskType.ODC : TaskType.Manpower),
        };
      });

      // Helper function to get sequence number for a row
      const getSequenceNumber = (row: WBSRowData, allRows: WBSRowData[]): string => {
        if (row.level === 1) {
          const level1Index = allRows.filter(r => r.level === 1).findIndex(r => r.id === row.id) + 1;
          // Sequence number is calculated based on position
          // Note: This is only used for initial data loading. The actual display numbering is handled in WBSTable.tsx
          return level1Index.toString();
        } else if (row.level === 2) {
          const parentRow = allRows.find(r => r.id === row.parentId);
          if (parentRow) {
            const parentSequence = getSequenceNumber(parentRow, allRows);
            const level2Index = allRows.filter(r => r.level === 2 && r.parentId === parentRow.id)
              .findIndex(r => r.id === row.id) + 1;
            return `${parentSequence}.${level2Index}`;
          }
        } else if (row.level === 3) {
          const level2Parent = allRows.find(r => r.id === row.parentId);
          if (level2Parent) {
            const parentSequence = getSequenceNumber(level2Parent, allRows);
            const level3Index = allRows.filter(r => r.level === 3 && r.parentId === level2Parent.id)
              .findIndex(r => r.id === row.id) + 1;
            return `${parentSequence}.${level3Index}`;
          }
        }
        return '';
      };

      // Fetch roles and update the complete transformed data
      const fetchRolesAndUpdateAllData = async (dataToProcess: WBSRowData[]) => {
        const dataWithRoles = await Promise.all(
          dataToProcess.map(async (row) => {
            if (row.role) { // Assuming role initially holds the employee ID
              try {
                const employee = await ResourceAPI.getEmployeeById(row.role); // Fetch employee by ID
                return {
                  ...row,
                  role: employee?.role_id || null, // Set role to role_id
                  // name: row.role, // Keep original employee ID in name for now if needed, or clear it
                  // costRate: employee?.standard_rate || row.costRate // Optionally update cost rate
                };
              } catch (error) {
                console.error(`Error fetching employee details for ID ${row.role}:`, error);
                return row; // Return original row if fetch fails
              }
            }
            return row; // Return row if no role ID
          })
        );
        setAllWbsData(dataWithRoles); // Store the complete data

        // Filter rows based on TaskType
        // If taskType is not set (for backward compatibility), we'll infer it from the title
        const currentManpowerRows = dataWithRoles.filter(row => {
          // If taskType is explicitly set, use it
          if (row.taskType !== undefined) {
            return row.taskType === TaskType.Manpower;
          }

          // For backward compatibility: check if this row is part of a hierarchy
          if (row.level === 2 || row.level === 3) {
            // For child rows, check the parent's taskType
            const parent = dataWithRoles.find(r => r.id === row.parentId);
            if (!parent) return false;

            if (parent.taskType !== undefined) {
              return parent.taskType === TaskType.Manpower;
            }

            // If parent doesn't have taskType, check grandparent for level 3
            if (row.level === 3) {
              const grandparent = dataWithRoles.find(r => r.id === parent.parentId);
              if (grandparent?.taskType !== undefined) {
                return grandparent.taskType === TaskType.Manpower;
              }
            }
          }

          // Default to Manpower for backward compatibility if we can't determine
          return true;
        });

        const currentOdcRows = dataWithRoles.filter(row => {
          // If taskType is explicitly set, use it
          if (row.taskType !== undefined) {
            return row.taskType === TaskType.ODC;
          }

          // For backward compatibility: check if this row is part of a hierarchy
          if (row.level === 2 || row.level === 3) {
            // For child rows, check the parent's taskType
            const parent = dataWithRoles.find(r => r.id === row.parentId);
            if (!parent) return false;

            if (parent.taskType !== undefined) {
              return parent.taskType === TaskType.ODC;
            }

            // If parent doesn't have taskType, check grandparent for level 3
            if (row.level === 3) {
              const grandparent = dataWithRoles.find(r => r.id === parent.parentId);
              if (grandparent?.taskType !== undefined) {
                return grandparent.taskType === TaskType.ODC;
              }
            }
          }

          // Default to not showing in ODC form if we can't determine
          return false;
        });

        setManpowerRows(currentManpowerRows);
        setOdcRows(currentOdcRows);

        // Calculate months based on the currently visible form type's data
        calculateAndSetMonths(formType === 'manpower' ? currentManpowerRows : currentOdcRows);
      };

      await fetchRolesAndUpdateAllData(allTransformedRows); // Process all transformed rows

    } catch (error) {
      console.error('Error loading WBS data:', error);
      setSnackbarMessage('Failed to load WBS data');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Separate function to calculate and set months based on provided rows
  const calculateAndSetMonths = (rowsToCalculateFrom: WBSRowData[]) => {
      const allMonths = new Set<string>();
      rowsToCalculateFrom.forEach((row) => {
        if (row.monthlyHours) {
          Object.keys(row.monthlyHours).forEach(year => {
            const yearStr = year.toString().slice(2); // Ensure year is string, then slice
            Object.keys(row.monthlyHours[year]).forEach(monthName => {
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


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // Load WBS options with better error handling
        try {
          // Convert formType to numeric value for API
          const formTypeValue = formType === 'odc' ? 1 : 0; // 0 = Manpower, 1 = ODC

          const [l1Options, l2Options, allOptions] = await Promise.all([
            WBSOptionsAPI.getLevel1Options(formTypeValue),
            WBSOptionsAPI.getLevel2Options(formTypeValue),
            WBSOptionsAPI.getAllOptions(formTypeValue)
          ]);

          setLevel1Options(l1Options);
          setLevel2Options(l2Options);
          setLevel3OptionsMap(allOptions.level3 || {});
        } catch (error) {
          console.error('Error loading WBS options:', error);
          setSnackbarMessage('Failed to load work description options. Please ensure the backend service is running and database is properly configured with WBS options.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
          // Set empty arrays to prevent null reference errors
          setLevel1Options([]);
          setLevel2Options([]);
          setLevel3OptionsMap({});
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
        // loadWBSData will now handle setting initial months if needed based on filtered data
        if (context?.selectedProject?.id) {
          await loadWBSData(context.selectedProject.id.toString());
        } else {
          // If no project selected, reset states
          setManpowerRows([]);
          setOdcRows([]);
          setAllWbsData([]);
          setMonths([]); // Reset months if no project
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
    loadInitialData();
  }, [context?.selectedProject?.id, formType]);

  const getProjectStartDate = () => {
    if (!context?.selectedProject) return null;
    if ('startDate' in context.selectedProject) {
      return context.selectedProject.startDate;
    }
    if ('likelyStartDate' in context.selectedProject) {
      return context.selectedProject.likelyStartDate;
    }
    return null;
  };

  const projectStartDate = getProjectStartDate();
  const isProject = context?.selectedProject && 'startDate' in context.selectedProject;

  if (!isProject || !projectStartDate) {
    return (
      <FormWrapper>
        <Paper sx={{ p: 3, m: 2 }}>
          <Alert severity="error">
            Project start date is not set. Please set a start date for the project before creating a WBS.
          </Alert>
        </Paper>
      </FormWrapper>
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
      monthlyHours: {},
      odc: 0,
      odcHours: 0,
      totalHours: 0,
      totalCost: 0,
      parentId: parentId || null,
      taskType: formType === 'manpower' ? TaskType.Manpower : TaskType.ODC, // Set taskType based on formType
      unit: '' // Initialize unit field
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
    if (deleteDialog.rowId && context?.selectedProject?.id) {
      const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
      try {
        // Filter the correct state based on formType
        setRowsFunc(prevRows => prevRows.filter(row => row.id !== deleteDialog.rowId));
      } catch (error) {
        console.error(`Error deleting WBS task from ${formType} form:`, error);
        setSnackbarMessage('Failed to delete WBS task');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    }
    handleDeleteCancel();
  };

  const handleRoleChange = (rowId: string, roleIdOrUnit: string) => {
    const setRowsFunc = formType === 'manpower' ? setManpowerRows : setOdcRows;
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const row = currentRows.find(r => r.id === rowId);

    // Check if this is a unit selection (both forms can now have units)
    // For ODC form, the role field is used for unit
    // For Manpower form, we need to check if the row already has a role assigned
    const isUnitSelection = formType === 'odc' || (row && row.role && unitOptions.some(unit => unit.value === roleIdOrUnit));

    if (isUnitSelection) {
      // Handle unit selection for both forms
      setRowsFunc(prevRows => prevRows.map(r => {
        if (r.id === rowId) {
          return {
            ...r,
            role: formType === 'odc' ? roleIdOrUnit : r.role, // For ODC, update role field with unit; for Manpower, keep existing role
            unit: formType === 'manpower' ? roleIdOrUnit : undefined // For Manpower, store unit in a separate property
          };
        }
        return r;
      }));
      return;
    }

    // For Manpower form, handle role selection logic
    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          role: roleIdOrUnit,
          name: null,
          costRate: 0
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
              name: employee.name, // Store employee name for display
              assignedUserId: employeeIdOrName, // Store the actual employee ID for backend
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
    // Skip processing for odcHours since it's now calculated automatically
    if (month === 'odcHours') {
      return;
    }

    // Regular monthly hours
    const hours = value === '' ? 0 : Math.min(Math.max(parseInt(value) || 0, 0), 160); // Keep validation

    setRowsFunc(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`; // Assuming yearStr is 'YY'
        const newMonthlyHours = {
          ...row.monthlyHours,
          [year]: {
            ...(row.monthlyHours[year] || {}),
            [monthName]: hours
          }
        };
        const totalHours = Object.values(newMonthlyHours)
          .flatMap(yearHours => Object.values(yearHours))
          .reduce((sum, h) => sum + h, 0);

        // For ODC form, update odcHours to match totalHours
        if (formType === 'odc') {
          return {
            ...row,
            monthlyHours: newMonthlyHours,
            totalHours,
            odcHours: totalHours,
            odc: totalHours * row.costRate, // Calculate ODC cost based on total hours and rate
            totalCost: totalHours * row.costRate // For ODC form, totalCost is the same as odc
          };
        }

        // For Manpower form, keep the original logic
        return {
          ...row,
          monthlyHours: newMonthlyHours,
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

    // Update the row with the new value
    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return { ...r, title: value };
      }
      return r;
    }));

    // Check if this is a level 2 row and fetch level 3 options if needed
    const changedRow = currentRows.find(r => r.id === rowId);
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
      if (!context?.selectedProject?.id) {
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

      const projectId = context.selectedProject.id.toString();

      // Save the combined, complete WBS data
      await WBSStructureAPI.setProjectWBS(projectId, combinedWbsData);

      // Update lastUpdateTime to trigger the useEffect to reload data
      setLastUpdateTime(Date.now()); // This will call loadWBSData again
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
    // Calculate totals based on the currently visible form
    const currentRows = formType === 'manpower' ? manpowerRows : odcRows;
    const level3Rows = currentRows.filter(row => row.level === 3);
    return {
      totalHours: level3Rows.reduce((sum, row) => sum + (row.totalHours || 0), 0), // Add fallback for potentially undefined totalHours
      totalCost: level3Rows.reduce((sum, row) => sum + row.totalCost, 0)
    };
  };
  // Loading indicator
  if (loading) {
    return (
      <FormWrapper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </FormWrapper>
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
          onEmployeeChange={handleEmployeeChange}
          onCostRateChange={handleCostRateChange}
          onHoursChange={handleHoursChange}
          onODCChange={handleODCChange}
        />
      </Paper>

      <Paper>
        <WBSSummary
          totalHours={calculateOverallTotals().totalHours}
          totalCost={calculateOverallTotals().totalCost}
          currency={context?.selectedProject?.currency || ''}
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
      <FormWrapper>
        <Paper sx={{ p: 3, m: 2 }}>
          <Alert severity="error">
            Project start date is not set. Please set a start date for the project before creating a WBS.
          </Alert>
        </Paper>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      {formContent}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </FormWrapper>
  );
};

export default WorkBreakdownStructureForm;