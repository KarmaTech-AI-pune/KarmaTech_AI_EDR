import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Alert, Container } from '@mui/material';
import { projectManagementAppContext } from '../../App';
import { WBSApi, WBSOptionsAPI } from '../../dummyapi/wbsApi';
import { MonthlyHour, WBSTask, WBSTaskResourceAllocation } from '../../dummyapi/database/dummyWBSTasks';
import { Employee } from '../../dummyapi/database/dummyResourceRoles';
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
      const wbsData = await WBSApi.getProjectWBS(projectId);
      if (wbsData) {
        const transformedRows: WBSRow[] = wbsData.map(task => {
          const resourceAllocation = task.resource_allocations?.[0] || null;
          const monthlyHoursData = resourceAllocation?.monthly_hours?.reduce((acc: any, hour: any) => {
            const monthName = new Date(hour.year, hour.month - 1).toLocaleString('default', { month: 'long' });
            const monthKey = `${monthName} ${hour.year.toString().slice(2)}`;
            acc[monthKey] = hour.planned_hours;
            return acc;
          }, {}) || {};

          return {
            id: task.id,
            level: task.level as 1 | 2 | 3,
            level1: task.level1_type || '',
            level2: task.level2_type || '',
            level3: task.level3_type || '',
            role: resourceAllocation?.role_id?.toString() || '',
            name: resourceAllocation?.employee_id?.toString() || '',
            costRate: resourceAllocation?.cost_rate || 0,
            monthlyHours: monthlyHoursData,
            odc: task.odc || 0,
            totalHours: resourceAllocation?.total_hours || 0,
            totalCost: (resourceAllocation?.total_cost || 0) + (task.odc || 0),
            title: task.title,
            parentId: task.parent_id || undefined,
            serverTaskId: task.id // Store the server task ID
          };
        });
        setRows(transformedRows);
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
          WBSApi.getAllRoles(),
          WBSApi.getAllEmployees()
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
          await WBSApi.deleteWBSTask(context.selectedProject.id, rowToDelete.serverTaskId);
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
      const employee = await WBSApi.getEmployeeById(parseInt(employeeId));
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
      const existingWBS = await WBSApi.getProjectWBS(projectId);
      console.log('Existing WBS:', existingWBS);

      // Create maps for existing data
      const existingTaskMap = new Map(existingWBS.map(task => [task.id, task]));

      // First, save all level 1 and 2 tasks
      const parentTasks = rows.filter(row => row.level < 3).map(row => ({
        id: row.serverTaskId || undefined,
        project_id: projectId,
        parent_id: row.parentId || null,
        level: row.level,
        level1_type: row.level1 || '',
        level2_type: row.level2 || '',
        level3_type: row.level3 || '',
        title: row.title || '',
        odc: row.odc || 0,
        created_at: row.serverTaskId ? existingTaskMap.get(row.serverTaskId)?.created_at || new Date() : new Date(),
        updated_at: new Date()
      } as WBSTask));

      // Save parent tasks
      const parentSaveResult = await WBSApi.saveWBSTasks(projectId, parentTasks);
      console.log('Parent Tasks Save Result:', parentSaveResult);

      // Create task ID mapping
      const taskIdMap = new Map<number, number>();
      parentSaveResult.created.forEach((serverId, index) => {
        const clientId = parentTasks[index]?.id || 0;
        taskIdMap.set(clientId, serverId);
      });
      parentSaveResult.updated.forEach(id => {
        taskIdMap.set(id, id);
      });

      // Save level 3 tasks
      const level3Tasks = rows.filter(row => row.level === 3).map(row => ({
        id: row.serverTaskId || undefined,
        project_id: projectId,
        parent_id: row.parentId ? (taskIdMap.get(row.parentId) || row.parentId) : null,
        level: row.level,
        level1_type: row.level1 || '',
        level2_type: row.level2 || '',
        level3_type: row.level3 || '',
        title: row.title || '',
        odc: row.odc || 0,
        created_at: row.serverTaskId ? existingTaskMap.get(row.serverTaskId)?.created_at || new Date() : new Date(),
        updated_at: new Date()
      } as WBSTask));

      // Save level 3 tasks
      const level3SaveResult = await WBSApi.saveWBSTasks(projectId, level3Tasks);
      console.log('Level 3 Tasks Save Result:', level3SaveResult);

      // Update task ID mapping
      level3SaveResult.created.forEach((serverId, index) => {
        const clientId = level3Tasks[index]?.id || 0;
        taskIdMap.set(clientId, serverId);
      });
      level3SaveResult.updated.forEach(id => {
        taskIdMap.set(id, id);
      });

      // Delete old resource allocations and monthly hours for tasks that no longer exist
      const currentTaskIds = new Set([...parentSaveResult.created, ...parentSaveResult.updated, 
                                    ...level3SaveResult.created, ...level3SaveResult.updated]);
      
      // Get all existing allocations for this project's tasks
      const existingAllocations = await WBSApi.getResourceAllocations(projectId);
      
      // Delete allocations for tasks that no longer exist
      for (const allocation of existingAllocations) {
        if (!currentTaskIds.has(allocation.wbs_task_id)) {
          // Delete monthly hours first
          if (allocation.monthly_hours) {
            await WBSApi.updateMonthlyHours(projectId, allocation.wbs_task_id, {
              resource_allocation_id: allocation.id,
              monthly_hours: []
            });
          }
          // Then delete the allocation itself by updating it with empty data
          await WBSApi.updateResourceAllocation(allocation.id, {
            employee_id: 0,
            role_id: 0,
            cost_rate: 0,
            total_hours: 0,
            total_cost: 0
          });
        }
      }

      // Process resource allocations and monthly hours for current tasks
      for (const row of rows) {
        if (!row?.monthlyHours || !row.name || row.level !== 3) continue;

        try {
          const taskId = row.serverTaskId || taskIdMap.get(row.id);
          if (!taskId) {
            console.error(`No server task ID found for row ${row.id}`);
            continue;
          }

          // Create or update resource allocation
          const allocationData = {
            wbs_task_id: taskId,
            employee_id: parseInt(row.name),
            role_id: row.role ? parseInt(row.role) : 0,
            cost_rate: row.costRate,
            total_hours: row.totalHours,
            total_cost: row.totalCost
          };

          // Check if there's an existing allocation for this task
          const existingAllocation = existingAllocations.find(a => a.wbs_task_id === taskId);
          let allocation;

          if (existingAllocation) {
            allocation = await WBSApi.updateResourceAllocation(existingAllocation.id, allocationData);
          } else {
            allocation = await WBSApi.createResourceAllocation(allocationData);
          }

          // Prepare monthly hours
          const monthlyHoursData: MonthlyHour[] = [];
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                            'July', 'August', 'September', 'October', 'November', 'December'];

          for (const [month, hours] of Object.entries(row.monthlyHours)) {
            if (hours != null && hours > 0) {
              const [monthName, yearStr] = month.split(' ');
              const monthNumber = monthNames.findIndex(m => m === monthName) + 1;
              if (monthNumber > 0) {
                monthlyHoursData.push({
                  id: 0,
                  resource_allocation_id: allocation.id,
                  year: 2000 + parseInt(yearStr),
                  month: monthNumber,
                  planned_hours: hours,
                  actual_hours: 0,
                  created_at: new Date(),
                  updated_at: new Date()
                });
              }
            }
          }

          // Update monthly hours
          await WBSApi.updateMonthlyHours(projectId, taskId, {
            resource_allocation_id: allocation.id,
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
