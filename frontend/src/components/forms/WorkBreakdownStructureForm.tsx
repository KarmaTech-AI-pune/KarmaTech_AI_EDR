import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Alert } from '@mui/material';
import { projectManagementAppContext } from '../../App';
import {
  ResourceRolesAPI,
  EmployeesAPI,
} from '../../dummyapi/database/dummyDatabaseApi';
import { WBSOptionsAPI } from '../../dummyapi/wbsApi';
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
        const allRoles = await ResourceRolesAPI.getAllRoles();
        setRoles(allRoles);
        
        const employees = EmployeesAPI.getAllEmployees();
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
      } catch (err) {
        setError('Failed to load initial data');
      }
    };
    loadInitialData();
  }, []);

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

  const handleDeleteConfirm = () => {
    if (deleteDialog.rowId) {
      setRows(rows.filter(row => row.id !== deleteDialog.rowId));
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

  const handleEmployeeChange = (rowId: number, employeeId: string) => {
    const employee = allEmployees.find(emp => emp.id === parseInt(employeeId));
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          name: employeeId,
          costRate: employee ? employee.standardRate : 0
        };
      }
      return row;
    }));
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
      console.log('Rows Data:', rows);
      console.log('Months:', months);
      console.log('Project Context:', context?.selectedProject);

      await Promise.all(rows.map(async row => {
        if (row.name && row.totalHours > 0) {
          Object.entries(row.monthlyHours).forEach(async ([month, hours]) => {
            if (hours > 0) {
              console.log(`Resource Allocation for Row ${row.id}:`, {
                wbsTaskId: row.id,
                employeeId: parseInt(row.name),
                year: parseInt('20' + month.slice(-2)),
                month: months.indexOf(month) + 1,
                plannedHours: hours,
                actualHours: 0,
                rate: row.costRate
              });
            }
          });
        }

        if (row.odc > 0) {
          console.log(`ODC Cost for Row ${row.id}:`, {
            wbsTaskId: row.id,
            description: `ODC for ${row.title}`,
            amount: row.odc,
            date: new Date(),
            category: 'Other',
            comments: ''
          });
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
    <Box sx={{ 
      width: '100%', 
      overflow: 'hidden',
      '& .MuiPaper-root': {
        boxShadow: 'none',
        border: '1px solid rgba(224, 224, 224, 1)',
        borderRadius: 1
      }
    }}>
      <Paper sx={{ mb: 2 }}>
        <WBSHeader
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

      <Paper sx={{ p: 2, mt: 2 }}>
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
  );
};

export default WorkBreakdownStructureForm;
