import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Alert, Container } from '@mui/material';
import { projectManagementAppContext } from '../../App';
import { WBSApi, WBSOptionsAPI } from '../../dummyapi/wbsApi';
import { MonthlyHour } from '../../dummyapi/database/dummyWBSTasks';
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
          const wbsData = await WBSApi.getProjectWBS(context.selectedProject.id);
          if (wbsData) {
            // Transform WBS data into rows format
            const transformedRows: WBSRow[] = wbsData.map(task => ({
              id: task.id,
              level: task.level as 1 | 2 | 3,
              level1: task.level1_type || '',
              level2: task.level2_type || '',
              level3: task.level3_type || '',
              role: task.resource_allocations[0]?.role_id.toString() || '',
              name: task.resource_allocations[0]?.employee_id.toString() || '',
              costRate: task.resource_allocations[0]?.cost_rate || 0,
              monthlyHours: task.resource_allocations[0]?.monthly_hours.reduce((acc: any, hour: any) => {
                const monthName = new Date(hour.year, hour.month - 1).toLocaleString('default', { month: 'long' });
                const monthKey = `${monthName} ${hour.year.toString().slice(2)}`;
                acc[monthKey] = hour.planned_hours;
                return acc;
              }, {}),
              odc: task.odc || 0,
              totalHours: task.resource_allocations[0]?.total_hours || 0,
              totalCost: (task.resource_allocations[0]?.total_cost || 0) + (task.odc || 0),
              title: task.title,
              parentId: task.parent_id || undefined
            }));
            setRows(transformedRows);
          }
        }
      } catch (err) {
        setError('Failed to load initial data');
      }
    };
    loadInitialData();
  }, [context?.selectedProject?.id]);

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
        await WBSApi.deleteWBSTask(context.selectedProject.id, deleteDialog.rowId);
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
        throw new Error('No project selected');
      }

      // Transform rows into WBS tasks
      const tasks = rows.map(row => ({
        id: row.id,
        project_id: context.selectedProject!.id,
        parent_id: row.parentId || null,
        level: row.level,
        level1_type: row.level1,
        level2_type: row.level2,
        level3_type: row.level3,
        title: row.title,
        odc: row.odc,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Save WBS tasks
      const result = await WBSApi.saveWBSTasks(context.selectedProject.id, tasks);

      // Update resource allocations and monthly hours
      await Promise.all(rows.map(async row => {
        if (row.name && row.totalHours > 0) {
          // Create or update resource allocation
          const monthlyHoursData: MonthlyHour[] = Object.entries(row.monthlyHours).map(([month, hours]) => {
            const [monthName, yearStr] = month.split(' ');
            const monthIndex = months.indexOf(month);
            return {
              id: 0, // This will be assigned by the API
              resource_allocation_id: parseInt(row.name),
              year: 2000 + parseInt(yearStr),
              month: monthIndex + 1,
              planned_hours: hours,
              actual_hours: 0,
              created_at: new Date(),
              updated_at: new Date()
            };
          });

          if (monthlyHoursData.length > 0) {
            await WBSApi.updateMonthlyHours(context.selectedProject!.id, row.id, {
              resource_allocation_id: parseInt(row.name),
              monthly_hours: monthlyHoursData
            });
          }
        }
      }));

      setError('');
    } catch (err) {
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
        maxHeight: 'calc(100vh - 200px)', // Adjust height to prevent full page overflow
        overflowY: 'auto', // Enable vertical scrolling
        overflowX: 'hidden', // Prevent horizontal scrolling
        pr: 1 // Add slight right padding for scrollbar
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
            overflowX: 'auto' // Horizontal scroll for table if needed
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
