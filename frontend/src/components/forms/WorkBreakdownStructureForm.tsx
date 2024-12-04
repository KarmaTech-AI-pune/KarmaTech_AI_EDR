import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Alert, Container } from '@mui/material';
import { projectManagementAppContext } from '../../App';
import { WBSStructureAPI, ResourceAPI, MonthlyHoursAPI, WBSTaskAPI, WBSOptionsAPI } from '../../dummyapi/wbsApi';
import DeleteWBSDialog from '../dialogbox/DeleteWBSDialog';
import WBSHeader from './WBSformcomponents/WBSHeader';
import WBSTable from './WBSformcomponents/WBSTable';
import WBSSummary from './WBSformcomponents/WBSSummary';
import { WBSOption, WBSRowData} from '../../types/wbs';

interface DeleteDialog {
  open: boolean;
  rowId?: number;
  childCount: number;
}

interface MonthlyHours {
  [year: string]: {
    [month: string]: number;
  };
}

// Helper function to generate new IDs
const getNewId = (array: any[]) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

const WorkBreakdownStructureForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<WBSRowData[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    childCount: 0
  });
  const [level1Options, setLevel1Options] = useState<WBSOption[]>([]);
  const [level2Options, setLevel2Options] = useState<WBSOption[]>([]);
  const [level3OptionsMap, setLevel3OptionsMap] = useState<{ [key: string]: WBSOption[] }>({});
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  const loadWBSData = async (projectId: number) => {
    try {
      const wbsData = await WBSStructureAPI.getProjectWBS(projectId);
      const transformedRows = wbsData.map((task: any) => ({
        id: task.id,
        level: task.level,
        title: task.title,
        role: task.role?.toString() || null,
        name: task.name?.toString() || null,
        costRate: task.costRate || 0,
        monthlyHours: (task.monthlyHours || {}) as MonthlyHours,
        odc: task.odc || 0,
        totalHours: task.totalHours || 0,
        totalCost: task.totalCost || 0,
        parentId: task.parentId
      }));

      setRows(transformedRows);
      
      // Calculate the number of months from the data
      const allMonths = new Set<string>();
      transformedRows.forEach(row => {
        const monthlyHours = row.monthlyHours as MonthlyHours;
        Object.entries(monthlyHours).forEach(([year, monthData]) => {
          Object.keys(monthData).forEach(month => {
            allMonths.add(`${month} ${year.slice(2)}`);
          });
        });
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
    } catch (err) {
      console.error('Error loading WBS data:', err);
      setError('Failed to load WBS data');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load WBS options
        const [l1Options, l2Options, allOptions] = await Promise.all([
          WBSOptionsAPI.getLevel1Options(),
          WBSOptionsAPI.getLevel2Options(),
          WBSOptionsAPI.getAllOptions()
        ]);

        setLevel1Options(l1Options);
        setLevel2Options(l2Options);
        setLevel3OptionsMap(allOptions.level3);

        // Load roles and employees
        const [allRoles, employees] = await Promise.all([
          ResourceAPI.getAllRoles(),
          ResourceAPI.getAllEmployees()
        ]);
        setRoles(allRoles);
        setAllEmployees(employees);

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
          await loadWBSData(context.selectedProject.id);
        }
      } catch (err) {
        setError('Failed to load initial data');
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

  const addNewRow = (level: 1 | 2 | 3, parentId?: number) => {
    const newRow: WBSRowData = {
      id: Date.now(),
      level,
      title: '',
      role: null,
      name: null,
      costRate: 0,
      monthlyHours: {},
      odc: 0,
      totalHours: 0,
      totalCost: 0,
      parentId: parentId || null
    };
    setRows([...rows, newRow]);
  };

  const handleDeleteClick = (rowId: number) => {
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
      } catch (err) {
        setError('Failed to delete WBS task');
      }
    }
    handleDeleteCancel();
  };

  const handleRoleChange = (rowId: number, roleId: string) => {
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

  const handleEmployeeChange = async (rowId: number, employeeId: string) => {
    try {
      const employee = await ResourceAPI.getEmployeeById(parseInt(employeeId));
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
    } catch (err) {
      setError('Failed to get employee details');
    }
  };

  const handleCostRateChange = (rowId: number, value: string) => {
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

  const handleHoursChange = (rowId: number, month: string, value: string) => {
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

  const handleODCChange = (rowId: number, value: string) => {
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

  const handleLevelChange = (rowId: number, value: string) => {
    setRows(rows.map(r => {
      if (r.id === rowId) {
        return { ...r, title: value };
      }
      return r;
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!context?.selectedProject?.id) {
        setError('No project selected. Please select a project first.');
        return;
      }

      const projectId = context.selectedProject.id;

      // Save all WBS data using setProjectWBS
      await WBSStructureAPI.setProjectWBS(projectId, rows);
      
      // Update lastUpdateTime to trigger the useEffect to reload data
      setLastUpdateTime(Date.now());
      alert('WBS data saved successfully!');
      setError('');
    } catch (err) {
      console.error('Complete Submit Error:', err);
      setError('Failed to save WBS data');
    } 
  };

  const calculateOverallTotals = () => {
    const level3Rows = rows.filter(row => row.level === 3);
    return {
      totalHours: level3Rows.reduce((sum, row) => sum + row.totalHours, 0),
      totalCost: level3Rows.reduce((sum, row) => sum + row.totalCost, 0)
    };
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        py: 2,
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: 1,
          mb: 2
        }
      }}
    >
      <Box sx={{ 
        width: '100%', 
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1
      }}>
        <Paper sx={{ mb: 2 }}>
          <WBSHeader
            editMode={editMode}
            error={error}
            onEditModeToggle={() => setEditMode(!editMode)}
            onAddMonth={addNewMonth}
          />
        </Paper>

        <Paper sx={{ 
          mb: 2,
          '& > div': {
            overflowX: 'auto'
          }
        }}>
          <WBSTable
            rows={rows}
            months={months}
            roles={roles}
            employees={allEmployees}
            editMode={editMode}
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

        <Paper sx={{ p: 2 }}>
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
      </Box>
    </Container>
  );
};

export default WorkBreakdownStructureForm;
