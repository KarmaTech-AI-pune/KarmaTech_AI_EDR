import React, { useState, useEffect, useContext } from 'react';
import { Paper, Alert, Container, CircularProgress, Box } from '@mui/material';
import { projectManagementAppContext } from '../../App';
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

const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType }) => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<WBSRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<resourceRole[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    childCount: 0
  });
  const [level1Options, setLevel1Options] = useState<WBSOption[]>([]);
  const [level2Options, setLevel2Options] = useState<WBSOption[]>([]);
  const [level3OptionsMap, setLevel3OptionsMap] = useState<{ [key: string]: WBSOption[] }>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

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
          // If formType is 'odc', add 5 to the index to start from 6
          const adjustedIndex = formType === 'odc' ? level1Index + 5 : level1Index;
          return adjustedIndex.toString();
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

      // Filter rows based on sequence number
      let filteredRows = allTransformedRows;
      if (formType === 'labour' || formType === 'odc') {
        filteredRows = allTransformedRows.filter(row => {
          const sequenceNumber = getSequenceNumber(row, allTransformedRows);
          const firstDigit = parseInt(sequenceNumber.split('.')[0]);
          
          if (formType === 'labour') {
            return firstDigit >= 1 && firstDigit <= 5;
          } else { // 'odc'
            return firstDigit >= 6;
          }
        });
      }

      const fetchRoles = async () => {
        const rowsWithRoles = await Promise.all(
          filteredRows.map(async (row) => {
            if (row.role) {
              try {
                const employee = await ResourceAPI.getEmployeeById(row.role);
                return {
                  ...row,
                  role: employee?.role_id || null,
                };
              } catch (error) {
                console.error("Error fetching employee details:", error);
                return row;
              }
            }
            return row;
          })
        );
        setRows(rowsWithRoles);
      };

      fetchRoles();

      // Calculate the number of months from the filtered data
      const allMonths = new Set<string>();
      filteredRows.forEach((row) => {
        // Now iterate through the nested object structure
        if (row.monthlyHours) {
          Object.keys(row.monthlyHours).forEach(year => {
            const yearStr = year.slice(2); // Get last 2 digits
            Object.keys(row.monthlyHours[year]).forEach(monthName => {
              allMonths.add(`${monthName} ${yearStr}`);
            });
          });
        }
      });

      if (allMonths.size > 0) {
        // Sort months chronologically
        const sortedMonths = Array.from(allMonths).sort((a, b) => {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const yearDiff = parseInt(yearA) - parseInt(yearB);
          if (yearDiff !== 0) return yearDiff;
          return monthNames.indexOf(monthA) - monthNames.indexOf(monthB);
        });
        setMonths(sortedMonths);
      }
    } catch (error) {
      console.error('Error loading WBS data:', error);
      setError('Failed to load WBS data');
    } finally {
      setLoading(false);
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
          setError('Failed to load work description options. Please ensure the backend service is running and database is properly configured with WBS options.');
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
          setError(prev => prev || 'Failed to load resource roles and employees.');
          setRoles([]);
          setAllEmployees([]);
        }

        // Set up initial months only if no data is loaded yet
        const startDate = getProjectStartDate();
        if (startDate && months.length === 0) {
          const date = new Date(startDate);
          const initialMonths = [];
          for (let i = 0; i < 5; i++) {
            initialMonths.push(
              `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear().toString().slice(2)}`
            );
            date.setMonth(date.getMonth() + 1);
          }
          setMonths(initialMonths);
        }

        // Load existing WBS data if project is selected
        if (context?.selectedProject?.id) {
          await loadWBSData(context.selectedProject.id.toString());
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(prev => prev || 'Failed to load initial data');
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
    // For level 1 rows, we need to check if we've reached the limit based on form type
    if (level === 1) {
      const level1Rows = rows.filter(row => row.level === 1);
      
      if (formType === 'labour') {
        // For Labour Form, we can only have up to 5 level 1 rows
        if (level1Rows.length >= 5) {
          setError('Labour Form can only have up to 5 level 1 rows.');
          return;
        }
      }
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
    setRows([...rows, newRow]);
  };

  const handleDeleteClick = (rowId: string) => {
    const childCount = rows.filter(r => 
      (r.level === 2 && rows.find(p => p.id === rowId)?.level === 1) ||
      (r.level === 3 && rows.find(p => p.id === rowId)?.level === 2)
    ).length;
    
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
      try {
        setRows(rows.filter(row => row.id !== deleteDialog.rowId));
      } catch (error) {
        console.error('Error deleting WBS task:', error);
        setError('Failed to delete WBS task');
      }
    }
    handleDeleteCancel();
  };

  const handleRoleChange = (rowId: string, roleId: string) => {
    setRows(rows.map(row => {
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
    try {
      const employee = await ResourceAPI.getEmployeeById(employeeId);
      if (employee) {
        setRows(rows.map(row => {
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
      setError('Failed to get employee details');
    }
  };

  const handleCostRateChange = (rowId: string, value: string) => {
    const row = rows.find(r => r.id === rowId);
    if (!row || !row.role) return;

    if (value === '') {
      setRows(rows.map(r => {
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
    if (isNaN(newRate)) return;

    setRows(rows.map(r => {
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
    // Special case for odcHours
    if (month === 'odcHours') {
      const hours = value === '' ? 0 : Math.max(parseInt(value) || 0, 0);
      
      setRows(rows.map(row => {
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
    const hours = value === '' ? 0 : Math.min(Math.max(parseInt(value) || 0, 0), 160);
    
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const [monthName, yearStr] = month.split(' ');
        const year = `20${yearStr}`;
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
    const odc = value === '' ? 0 : Math.max(parseFloat(value) || 0, 0);
    
    setRows(rows.map(row => {
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
    setRows(rows.map(r => {
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
        setError('No project selected. Please select a project first.');
        return;
      }

      // Validate that all tasks have titles
      const emptyTitleTasks = rows.filter(row => !row.title);
      if (emptyTitleTasks.length > 0) {
        setError('All tasks must have a work description selected. Please select a value for each task.');
        return;
      }

      const projectId = context.selectedProject.id.toString();

      // Save all WBS data using setProjectWBS
      await WBSStructureAPI.setProjectWBS(projectId, rows);
      
      // Update lastUpdateTime to trigger the useEffect to reload data
      setLastUpdateTime(Date.now());
      alert('WBS data saved successfully!');
      setError('');
    } catch (error: unknown) {
      console.error('Complete Submit Error:', error);
      // Display more specific error message if available
      if (error instanceof Error) {
        setError(`Failed to save WBS data: ${error.message}`);
      } else {
        setError('Failed to save WBS data. Please check that all required fields are filled correctly.');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallTotals = () => {
    const level3Rows = rows.filter(row => row.level === 3);
    return {
      totalHours: level3Rows.reduce((sum, row) => sum + row.totalHours, 0),
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
          editMode={editMode}
          error={error}
          onEditModeToggle={() => setEditMode(!editMode)}
          onAddMonth={addNewMonth}
        />
      </Paper>

      <Paper>
        <WBSTable
          rows={rows}
          months={months}
          roles={roles}
          employees={allEmployees}
          editMode={editMode}
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
          disabled={rows.length === 0}
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
    </FormWrapper>
  );
};

export default WorkBreakdownStructureForm;
