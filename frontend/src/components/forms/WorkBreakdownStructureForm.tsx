import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Alert, Container } from '@mui/material';
import { projectManagementAppContext } from '../../App';
import { WBSStructureAPI, ResourceAPI, MonthlyHoursAPI, WBSTaskAPI, WBSOptionsAPI } from '../../dummyapi/wbsApi';
import DeleteWBSDialog from '../dialogbox/DeleteWBSDialog';
import WBSHeader from './WBSformcomponents/WBSHeader';
import WBSTable from './WBSformcomponents/WBSTable';
import WBSSummary from './WBSformcomponents/WBSSummary';

interface WBSRow {
  id: number;
  level: 1 | 2 | 3;
  level1: string;
  level2: string;
  level3: string;
  role: string;
  name: string;
  costRate: number;
  monthlyHours: { [key: string]: number };
  odc: number;
  totalHours: number;
  totalCost: number;
  title: string;
  parentId?: number;
  serverTaskId?: number;
}

interface DeleteDialog {
  open: boolean;
  rowId?: number;
  childCount: number;
}

interface WBSOption {
  value: string;
  label: string;
}

// Helper function to generate new IDs
const getNewId = (array: any[]) => {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
};

const WorkBreakdownStructureForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<WBSRow[]>([]);
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
      console.log("fetched rows,",wbsData)
      
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

        // Set up initial months
        const startDate = getProjectStartDate();
        if (startDate) {
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
    const lastDate = new Date(2000 + parseInt(yearStr), months.length - 1);
    lastDate.setMonth(lastDate.getMonth() + 1);
    const newMonth = `${lastDate.toLocaleString('default', { month: 'long' })} ${lastDate.getFullYear().toString().slice(2)}`;
    setMonths([...months, newMonth]);
  };

  const addNewRow = (level: 1 | 2 | 3, parentId?: number) => {
    const newRow: WBSRow = {
      id: Date.now(),
      level,
      level1: '',
      level2: '',
      level3: '',
      role: '',
      name: '',
      costRate: 0,
      monthlyHours: {},
      odc: 0,
      totalHours: 0,
      totalCost: 0,
      title: '',
      parentId
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
        const rowToDelete = rows.find(r => r.id === deleteDialog.rowId);
        if (rowToDelete?.serverTaskId) {
          await WBSTaskAPI.deleteWBSTask(context.selectedProject.id, rowToDelete.serverTaskId);
        }
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
          name: '',
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
        const newMonthlyHours = { ...row.monthlyHours, [month]: hours };
        const totalHours = Object.values(newMonthlyHours).reduce((sum, h) => sum + h, 0);
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
    const row = rows.find(r => r.id === rowId);
    if (!row) return;

    setRows(rows.map(r => {
      if (r.id === rowId) {
        const updates: Partial<WBSRow> = {};
        if (row.level === 1) {
          updates.level1 = value;
          updates.level2 = '';
          updates.level3 = '';
        } else if (row.level === 2) {
          updates.level2 = value;
          updates.level3 = '';
        } else if (row.level === 3) {
          updates.level3 = value;
        }
        return { ...r, ...updates };
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

      // Get existing WBS data
      const existingWBS = await WBSStructureAPI.getProjectWBS(projectId);
      const existingResAloc = await ResourceAPI.getResourceAllocations(projectId);
      const existingMonthlyHours = await MonthlyHoursAPI.getMonthlyHoursByProjectId(projectId);

      console.log('Existing WBS:', existingWBS);
      console.log('Existing Res Alloc:',existingResAloc)
      console.log('Existing Monthly Hours',existingMonthlyHours)
      console.log('rows',rows)
      /*
      // Create maps for existing data
      const existingTaskMap = new Map(existingWBS.map(task => [task.id, task]));

      // First, save all level 1 and 2 tasks
      const parentTasks = rows.filter(row => row.level < 3).map(row => ({
        id: row.serverTaskId,
        project_id: projectId,
        parent_id: row.parentId || null,
        level: row.level,
        title: row.title || '',
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Save parent tasks
      const parentSaveResult = await WBSStructureAPI.saveWBSTasks(projectId, parentTasks);
      console.log('Parent Tasks Save Result:', parentSaveResult);

      // Create task ID mapping
      const taskIdMap = new Map<number, number>();
      
      // Map existing task IDs
      rows.forEach(row => {
        if (row.serverTaskId) {
          taskIdMap.set(row.id, row.serverTaskId);
        }
      });
      
      // Map newly created parent task IDs
      parentSaveResult.created.forEach((serverId, index) => {
        const clientId = parentTasks[index]?.id || 0;
        if (clientId) {
          taskIdMap.set(clientId, serverId);
        }
      });

      // Save level 3 tasks
      const level3Tasks = rows.filter(row => row.level === 3).map(row => ({
        id: row.serverTaskId,
        project_id: projectId,
        parent_id: row.parentId ? (taskIdMap.get(row.parentId) || row.parentId) : null,
        level: row.level,
        title: row.title || '',
        created_at: new Date(),
        updated_at: new Date(),
        resource_allocation: row.role ? 1 : undefined
      }));

      // Save level 3 tasks
      const level3SaveResult = await WBSStructureAPI.saveWBSTasks(projectId, level3Tasks);
      console.log('Level 3 Tasks Save Result:', level3SaveResult);

      // Process resource allocations for level 3 tasks
      for (const row of rows) {
        if (!row.role || row.level !== 3) continue;

        try {
          const taskId = taskIdMap.get(row.id) || row.serverTaskId;
          if (!taskId) {
            console.error(`No server task ID found for row ${row.id}`);
            continue;
          }

          // Create or update resource allocation
          const allocationData = {
            wbs_task_id: taskId,
            role_id: parseInt(row.role),
            employee_id: parseInt(row.name),
            cost_rate: row.costRate,
            odc: row.odc,
            total_hours: row.totalHours,
            total_cost: row.totalCost,
            created_at: new Date(),
            updated_at: new Date()
          };

          const allocation = await ResourceAPI.createResourceAllocation(allocationData);

          // Process monthly hours
          const monthlyHoursData = Object.entries(row.monthlyHours).map(([month, hours]) => {
            const [monthName, yearStr] = month.split(' ');
            const monthIndex = new Date(Date.parse(`${monthName} 1, 2000`)).getMonth() + 1;
            return {
              task_id: taskId,
              year: parseInt(yearStr) + 2000,
              month: monthIndex,
              planned_hours: hours,
              created_at: new Date(),
              updated_at: new Date()
            };
          });

          await MonthlyHoursAPI.updateMonthlyHours(projectId, taskId, {
            monthly_hours: monthlyHoursData
          });
        } catch (error) {
          console.error(`Error processing row ${row.id}:`, error);
        }
      }
      
      // Reload the WBS data
      await loadWBSData(projectId);
      setLastUpdateTime(Date.now());
      alert('WBS data saved successfully!');
      setError(''); */
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
