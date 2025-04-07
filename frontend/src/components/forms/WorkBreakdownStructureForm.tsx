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
import { WBSOption, WBSRowData } from '../../types/wbs';
import { resourceRole } from '../../models/resourceRoleModel';
import { Employee } from '../../models/employeeModel';
import { FormWrapper } from './FormWrapper';

interface WorkBreakdownStructureFormProps {
  formType?: 'labour' | 'odc';
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

const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType = 'labour' }) => { // Default to 'labour' if undefined
  const context = useContext(projectManagementAppContext);
  // const [rows, setRows] = useState<WBSRowData[]>([]); // Keep original 'rows' for reference during refactor, remove later if unused
  const [labourRows, setLabourRows] = useState<WBSRowData[]>([]);
  const [odcRows, setOdcRows] = useState<WBSRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<resourceRole[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isLabourEditing, setIsLabourEditing] = useState<boolean>(true); // State for Labour form edit mode
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
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [allWbsData, setAllWbsData] = useState<WBSRowData[]>([]); // State for all fetched data

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
        };
      });

      // Helper function to get sequence number for a row
      const getSequenceNumber = (row: WBSRowData, allRows: WBSRowData[]): string => {
        if (row.level === 1) {
          const level1Index = allRows.filter(r => r.level === 1).findIndex(r => r.id === row.id) + 1;
          // Sequence number is now calculated purely based on position, independent of formType
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

        // Filter into separate states
        const currentLabourRows = dataWithRoles.filter(row => {
          const sequenceNumber = getSequenceNumber(row, dataWithRoles);
          if (!sequenceNumber) return false;
          const firstDigit = parseInt(sequenceNumber.split('.')[0]);
          return firstDigit >= 1 && firstDigit <= 5;
        });
        const currentOdcRows = dataWithRoles.filter(row => {
          const sequenceNumber = getSequenceNumber(row, dataWithRoles);
          if (!sequenceNumber) return false;
          const firstDigit = parseInt(sequenceNumber.split('.')[0]);
          return firstDigit >= 6;
        });

        setLabourRows(currentLabourRows);
        setOdcRows(currentOdcRows);

        // Calculate months based on the currently visible form type's data
        calculateAndSetMonths(formType === 'labour' ? currentLabourRows : currentOdcRows);
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
          const [l1Options, l2Options, allOptions] = await Promise.all([
            WBSOptionsAPI.getLevel1Options(),
            WBSOptionsAPI.getLevel2Options(),
            WBSOptionsAPI.getAllOptions()
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
          setLabourRows([]);
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
  }, [context?.selectedProject?.id, lastUpdateTime]);

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
    const currentRows = formType === 'labour' ? labourRows : odcRows;
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;

    // For level 1 rows, check limits based on form type
    if (level === 1) {
      const level1Rows = currentRows.filter(row => row.level === 1);
      if (formType === 'labour' && level1Rows.length >= 5) {
        setSnackbarMessage('Labour Form can only have up to 5 level 1 rows.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
      // Add similar check for ODC if needed, e.g., if ODC starts at 6 and has a limit
      // if (formType === 'odc' && level1Rows.length >= X) { ... }
    }

    const newRow: WBSRowData = {
      id: Date.now().toString(),
      level,
      title: '',
      role: null,
      name: null,
      costRate: 0,
      monthlyHours: {},
      odc: 0,
      odcHours: 0,
      totalHours: 0,
      totalCost: 0,
      parentId: parentId || null
    };
    setRowsFunc([...currentRows, newRow]);
  };

  const handleDeleteClick = (rowId: string) => {
    const currentRows = formType === 'labour' ? labourRows : odcRows;
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
      const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
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

  const handleRoleChange = (rowId: string, roleId: string) => {
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
    setRowsFunc(prevRows => prevRows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          role: roleId,
          name: null,
          costRate: 0
        };
      }
      return row;
    }));
  };

  const handleEmployeeChange = async (rowId: string, employeeId: string) => {
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
    try {
      const employee = await ResourceAPI.getEmployeeById(employeeId);
      if (employee) {
        setRowsFunc(prevRows => prevRows.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              name: employeeId,
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
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
    const currentRows = formType === 'labour' ? labourRows : odcRows;
    const row = currentRows.find(r => r.id === rowId);
    if (!row || !row.role) return; // Ensure row exists and has a role assigned

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
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
    // Special case for odcHours - Assuming odcHours might be specific to ODC form?
    // If odcHours can appear in both, this logic is fine. If only ODC, add check: if (formType === 'odc' && month === 'odcHours')
    if (month === 'odcHours') {
      const hours = value === '' ? 0 : Math.max(parseInt(value) || 0, 0);

      setRowsFunc(prevRows => prevRows.map(row => {
        if (row.id === rowId) {
          return {
            ...row,
            odcHours: hours
          };
        }
        return row;
      }));
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
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
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

  const handleLevelChange = (rowId: string, value: string) => {
    const setRowsFunc = formType === 'labour' ? setLabourRows : setOdcRows;
    setRowsFunc(prevRows => prevRows.map(r => {
      if (r.id === rowId) {
        return { ...r, title: value };
      }
      return r;
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (!context?.selectedProject?.id) {
        setSnackbarMessage('No project selected. Please select a project first.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false); // Ensure loading is stopped
        return;
      }

      // Combine the latest data from both labour and ODC states
      const combinedWbsData = [...labourRows, ...odcRows];

      // Validate that all tasks in the combined data have titles
      const emptyTitleTasks = combinedWbsData.filter(row => !row.title);
      if (emptyTitleTasks.length > 0) {
        setSnackbarMessage('All tasks must have a work description selected. Please select a value for each task.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setLoading(false); // Ensure loading is stopped
        return;
      }

      const projectId = context.selectedProject.id.toString();

      // Save the combined, complete WBS data
      await WBSStructureAPI.setProjectWBS(projectId, combinedWbsData);

      // Update lastUpdateTime to trigger the useEffect to reload data
      setLastUpdateTime(Date.now()); // This will call loadWBSData again
      setSnackbarMessage('WBS data saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsLabourEditing(false);
      setIsOdcEditing(false);
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
      setLoading(false);
    }
  };

  const calculateOverallTotals = () => {
    // Calculate totals based on the currently visible form
    const currentRows = formType === 'labour' ? labourRows : odcRows;
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
            formType === 'labour'
              ? 'Labour Form'
              : formType === 'odc'
              ? 'ODC Form'
               : 'Work Breakdown Structure'
           }
           editMode={formType === 'labour' ? isLabourEditing : isOdcEditing} // Use form-specific state
           onEditModeToggle={() => formType === 'labour' ? setIsLabourEditing(!isLabourEditing) : setIsOdcEditing(!isOdcEditing)} // Toggle form-specific state
           onAddMonth={addNewMonth}
         />
      </Paper>

      <Paper>
        <WBSTable
           rows={formType === 'labour' ? labourRows : odcRows} // Pass the correct rows based on formType
           months={months}
           roles={roles}
           employees={allEmployees}
           editMode={formType === 'labour' ? isLabourEditing : isOdcEditing} // Use form-specific state
           formType={formType}
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
          // Disable save if the *currently visible* form has no rows
          disabled={(formType === 'labour' ? labourRows : odcRows).length === 0}
          onSave={handleSubmit}
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
