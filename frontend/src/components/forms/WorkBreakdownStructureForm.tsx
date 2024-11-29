import React, { useState, useEffect, useContext } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { projectManagementAppContext } from '../../App';
import {
  WBSTasksAPI,
  ResourceRolesAPI,
  EmployeesAPI,
  ResourceAllocationsAPI,
  ODCCostsAPI
} from '../../dummyapi/database/dummyDatabaseApi';
import { Project } from '../../types';

const NumberInput = styled('input')({
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  '&:focus': {
    outline: 'none',
    border: '2px solid #1976d2',
  },
  '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
    '-webkit-appearance': 'none',
    margin: 0,
  },
});

interface WBSRow {
  id: number;
  number: string;
  level: 1 | 2 | 3;
  parentId: number | null;
  level1: string;
  level2: string;
  level3: string;
  title: string;
  role: string;
  name: string;
  costRate: number;
  monthlyHours: { [key: string]: number };
  odc: number;
  totalHours: number;
  totalCost: number;
}

interface DeleteDialogState {
  open: boolean;
  rowId: number | null;
  childCount: number;
}

// Define all possible task options for each level
const level1Options = [
  { value: "1", label: "Inception Report" },
  { value: "2", label: "Feasibility Report" },
  { value: "3", label: "Draft Detailed Project Report" },
  { value: "4", label: "Detailed Project Report" },
  { value: "5", label: "Tendering Documents" },
  { value: "6", label: "Construction Supervision" }
];

const level2Options = [
  { value: "surveys", label: "Surveys" },
  { value: "design", label: "Design" },
  { value: "cost_estimation", label: "Cost Estimation" }
];

const level3Options = [
  // Survey options
  { value: "topographical", label: "Topographical Survey", group: "surveys" },
  { value: "soil", label: "Soil Investigation", group: "surveys" },
  { value: "social", label: "Social Impact Assessment", group: "surveys" },
  { value: "environmental", label: "Environmental Assessment", group: "surveys" },
  { value: "flow", label: "Flow Measurement", group: "surveys" },
  { value: "water", label: "Water Quality Measurement", group: "surveys" },
  // Design options
  { value: "process", label: "Process Design", group: "design" },
  { value: "mechanical", label: "Mechanical Design", group: "design" },
  { value: "structural", label: "Structural Design", group: "design" },
  { value: "electrical", label: "Electrical Design", group: "design" },
  { value: "ica", label: "ICA Design", group: "design" }
];

const getMonthName = (monthIndex: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex];
};

const generateMonthLabel = (date: Date): string => {
  const month = getMonthName(date.getMonth());
  const year = date.getFullYear().toString().slice(-2);
  return `${month}-${year}`;
};

const getNextMonth = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
};

const generateInitialMonths = (startDate: Date, count: number = 5): string[] => {
  const months: string[] = [];
  let currentDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    months.push(generateMonthLabel(currentDate));
    currentDate = getNextMonth(currentDate);
  }
  
  return months;
};

const WorkBreakdownStructureForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<WBSRow[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    open: false,
    rowId: null,
    childCount: 0
  });
  
  const selectedProject = context?.selectedProject as Project | null;
  const isProject = selectedProject && 'projectNo' in selectedProject;
  const projectStartDate = isProject && selectedProject.startDate ? new Date(selectedProject.startDate) : null;
  
  const [months, setMonths] = useState<string[]>(() => {
    if (!projectStartDate) {
      setError('Project start date is not set');
      return [];
    }
    return generateInitialMonths(projectStartDate);
  });
  
  const [lastMonthDate, setLastMonthDate] = useState<Date>(() => {
    if (!projectStartDate) return new Date();
    const lastDate = new Date(projectStartDate);
    lastDate.setMonth(projectStartDate.getMonth() + 4);
    return lastDate;
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const allRoles = ResourceRolesAPI.getAllRoles();
        setRoles(allRoles);
      } catch (err) {
        setError('Failed to load roles');
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!projectStartDate) {
      setError('Project start date is not set');
      return;
    }
    
    setMonths(generateInitialMonths(projectStartDate));
    
    const lastDate = new Date(projectStartDate);
    lastDate.setMonth(projectStartDate.getMonth() + 4);
    setLastMonthDate(lastDate);
  }, [projectStartDate]);

  const renumberRows = (currentRows: WBSRow[]): WBSRow[] => {
    const newRows = [...currentRows];
    
    // First, renumber level 1 rows
    const level1Rows = newRows.filter(row => row.level === 1);
    level1Rows.forEach((row, index) => {
      const newNumber = `${index + 1}`;
      row.number = newNumber;
      
      // Renumber level 2 children
      const level2Children = newRows.filter(r => r.level === 2 && r.parentId === row.id);
      level2Children.forEach((child, childIndex) => {
        const newChildNumber = `${newNumber}.${childIndex + 1}`;
        child.number = newChildNumber;
        
        // Renumber level 3 children
        const level3Children = newRows.filter(r => r.level === 3 && r.parentId === child.id);
        level3Children.forEach((grandChild, grandChildIndex) => {
          grandChild.number = `${newChildNumber}.${grandChildIndex + 1}`;
        });
      });
    });
    
    return newRows;
  };

  const sortRows = (rows: WBSRow[]): WBSRow[] => {
    const result: WBSRow[] = [];
    const addedIds = new Set<number>();

    const addRowWithChildren = (row: WBSRow) => {
      if (addedIds.has(row.id)) return;
      
      result.push(row);
      addedIds.add(row.id);

      // Find and add immediate children
      rows
        .filter(r => r.parentId === row.id)
        .sort((a, b) => a.number.localeCompare(b.number))
        .forEach(child => addRowWithChildren(child));
    };

    // Add level 1 rows and their children
    rows
      .filter(r => r.level === 1)
      .sort((a, b) => a.number.localeCompare(b.number))
      .forEach(row => addRowWithChildren(row));

    return result;
  };

  const getNextNumber = (level: 1 | 2 | 3, parentId: number | null = null): string => {
    if (level === 1) {
      const level1Rows = rows.filter(r => r.level === 1);
      return `${level1Rows.length + 1}`;
    }

    if (level === 2 && parentId) {
      const parentRow = rows.find(r => r.id === parentId);
      if (!parentRow) return '1';
      const level2Siblings = rows.filter(r => r.level === 2 && r.parentId === parentId);
      return `${parentRow.number}.${level2Siblings.length + 1}`;
    }

    if (level === 3 && parentId) {
      const parentRow = rows.find(r => r.id === parentId);
      if (!parentRow) return '1';
      const level3Siblings = rows.filter(r => r.level === 3 && r.parentId === parentId);
      return `${parentRow.number}.${level3Siblings.length + 1}`;
    }

    return '1';
  };

  const findLastChildIndex = (parentId: number, currentRows: WBSRow[]): number => {
    let lastIndex = currentRows.findIndex(r => r.id === parentId);
    
    // Find all descendants recursively
    const isDescendant = (row: WBSRow): boolean => {
      if (row.parentId === parentId) return true;
      if (row.parentId === null) return false;
      const parent = currentRows.find(r => r.id === row.parentId);
      return parent ? isDescendant(parent) : false;
    };

    // Find the last descendant's index
    for (let i = lastIndex + 1; i < currentRows.length; i++) {
      if (isDescendant(currentRows[i])) {
        lastIndex = i;
      } else {
        break;
      }
    }

    return lastIndex;
  };

  const addNewRow = (level: 1 | 2 | 3, parentId: number | null = null) => {
    const newRow: WBSRow = {
      id: Math.max(0, ...rows.map(r => r.id)) + 1,
      number: getNextNumber(level, parentId),
      level,
      parentId,
      level1: '',
      level2: '',
      level3: '',
      title: '',
      role: '',
      name: '',
      costRate: 0,
      monthlyHours: months.reduce((acc, month) => ({ ...acc, [month]: 0 }), {}),
      odc: 0,
      totalHours: 0,
      totalCost: 0
    };

    setRows(prevRows => {
      const newRows = [...prevRows];
      if (parentId === null) {
        return sortRows([...newRows, newRow]);
      } else {
        const lastChildIndex = findLastChildIndex(parentId, newRows);
        newRows.splice(lastChildIndex + 1, 0, newRow);
        return sortRows(newRows);
      }
    });
  };

  const addNewMonth = () => {
    const nextDate = getNextMonth(lastMonthDate);
    const nextMonthLabel = generateMonthLabel(nextDate);
    
    setLastMonthDate(nextDate);
    setMonths(prevMonths => [...prevMonths, nextMonthLabel]);
    
    setRows(prevRows => prevRows.map(row => ({
      ...row,
      monthlyHours: {
        ...row.monthlyHours,
        [nextMonthLabel]: 0
      }
    })));
  };

  const countChildren = (parentId: number): number => {
    let count = 0;
    const findChildren = (id: number) => {
      rows.forEach(row => {
        if (row.parentId === id) {
          count++;
          findChildren(row.id);
        }
      });
    };
    findChildren(parentId);
    return count;
  };

  const handleDeleteClick = (id: number) => {
    const row = rows.find(r => r.id === id);
    if (row && (row.level === 1 || row.level === 2)) {
      const childCount = countChildren(id);
      setDeleteDialog({
        open: true,
        rowId: id,
        childCount
      });
    } else {
      performDelete(id);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.rowId !== null) {
      performDelete(deleteDialog.rowId);
    }
    setDeleteDialog({ open: false, rowId: null, childCount: 0 });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, rowId: null, childCount: 0 });
  };

  const performDelete = (id: number) => {
    const rowsToDelete = new Set<number>();
    const findChildren = (parentId: number) => {
      rows.forEach(row => {
        if (row.parentId === parentId) {
          rowsToDelete.add(row.id);
          findChildren(row.id);
        }
      });
    };

    rowsToDelete.add(id);
    findChildren(id);

    setRows(prevRows => {
      const remainingRows = prevRows.filter(row => !rowsToDelete.has(row.id));
      const renumberedRows = renumberRows(remainingRows);
      return sortRows(renumberedRows);
    });
  };

  const handleRoleChange = (rowId: number, roleId: string) => {
    const allEmployees = EmployeesAPI.getAllEmployees();
    const roleEmployees = allEmployees.filter(emp => emp.roleId === parseInt(roleId));
    setEmployees(roleEmployees);

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
    const employee = employees.find(emp => emp.id === parseInt(employeeId));
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

  const handleSubmit = async () => {
    try {
      await Promise.all(rows.map(async row => {
        if (row.name && row.totalHours > 0) {
          Object.entries(row.monthlyHours).forEach(async ([month, hours]) => {
            if (hours > 0) {
              await ResourceAllocationsAPI.createAllocation({
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
          await ODCCostsAPI.createCost({
            wbsTaskId: row.id,
            description: `ODC for ${row.title}`,
            amount: row.odc,
            date: new Date(),
            category: 'Other',
            comments: ''
          });
        }
      }));

      setRows([]);
      setError('');
    } catch (err) {
      setError('Failed to save WBS data');
    }
  };

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
    <Box sx={{ 
      width: '100%', 
      overflow: 'hidden',
      '& .MuiPaper-root': {
        boxShadow: 'none',
        border: '1px solid rgba(224, 224, 224, 1)',
        borderRadius: 1
      }
    }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Work Breakdown Structure</Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addNewMonth}
              sx={{ mr: 1 }}
            >
              Add Month
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => addNewRow(1)}
            >
              Add Level 1
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      <Paper>
        <TableContainer sx={{ 
          maxHeight: 'calc(100vh - 300px)',
          overflowX: 'auto',
          overflowY: 'auto',
          '& .MuiTableCell-root': {
            px: 1,
            py: 0.75,
            fontSize: '0.875rem'
          }
        }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1200 }}>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    minWidth: 150, 
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 3,
                    bgcolor: 'background.paper',
                    borderRight: '1px solid rgba(224, 224, 224, 1)'
                  }}
                >
                  Actions
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>Number</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Level 1</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Level 2</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Level 3</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Role</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Cost Rate</TableCell>
                {months.map(month => (
                  <TableCell key={month} sx={{ minWidth: 100 }}>{month}</TableCell>
                ))}
                <TableCell sx={{ minWidth: 100 }}>ODCs</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Total Hours</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Total Cost</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow 
                  key={row.id}
                  sx={{ 
                    '& > td': {
                      borderBottom: '1px solid rgba(224, 224, 224, 1)',
                      bgcolor: row.level === 1 ? 'rgba(0, 0, 0, 0.06)' : 
                              row.level === 2 ? 'rgba(0, 0, 0, 0.03)' : 
                              'transparent',
                      pl: '8px !important',
                    },
                    '& > td:first-of-type': {
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: row.level === 1 ? 'rgba(0, 0, 0, 0.06)' : 
                              row.level === 2 ? 'rgba(0, 0, 0, 0.03)' : 
                              'background.paper',
                      borderRight: '1px solid rgba(224, 224, 224, 1)'
                    }
                  }}
                >
                  <TableCell>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1,
                      alignItems: 'center',
                      ml: row.level > 1 ? `${(row.level - 1) * 2}rem` : 0,
                      position: 'relative',
                      '&::before': row.level > 1 ? {
                        content: '""',
                        position: 'absolute',
                        left: '-1rem',
                        top: '50%',
                        width: '1rem',
                        height: '2px',
                        bgcolor: 'rgba(0, 0, 0, 0.1)'
                      } : {}
                    }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteClick(row.id)}
                        sx={{
                          bgcolor: 'background.paper',
                          boxShadow: 1,
                          '&:hover': {
                            bgcolor: 'error.light',
                            color: 'white'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {row.level < 3 && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => addNewRow(row.level + 1 as 2 | 3, row.id)}
                          sx={{
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            lineHeight: 1,
                            bgcolor: 'background.paper',
                            boxShadow: 1
                          }}
                        >
                          Add Level {row.level + 1}
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: row.level === 1 ? 600 : 
                                  row.level === 2 ? 500 : 
                                  400
                      }}
                    >
                      {row.number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.level1}
                      onChange={(e) => setRows(rows.map(r => 
                        r.id === row.id ? { ...r, level1: e.target.value } : r
                      ))}
                      size="small"
                      fullWidth
                      disabled={row.level !== 1}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {level1Options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.level2}
                      onChange={(e) => setRows(rows.map(r => 
                        r.id === row.id ? { ...r, level2: e.target.value } : r
                      ))}
                      size="small"
                      fullWidth
                      disabled={row.level !== 2}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {level2Options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.level3}
                      onChange={(e) => setRows(rows.map(r => 
                        r.id === row.id ? { ...r, level3: e.target.value } : r
                      ))}
                      size="small"
                      fullWidth
                      disabled={row.level !== 3}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Select</MenuItem>
                      {level3Options.map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.role}
                      onChange={(e) => handleRoleChange(row.id, e.target.value)}
                      size="small"
                      fullWidth
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Select Role</MenuItem>
                      {roles.map(role => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={row.name}
                      onChange={(e) => handleEmployeeChange(row.id, e.target.value)}
                      size="small"
                      fullWidth
                      disabled={!row.role}
                      sx={{ bgcolor: 'background.paper' }}
                    >
                      <MenuItem value="">Select Name</MenuItem>
                      {employees.map(employee => (
                        <MenuItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      type="number"
                      value={row.costRate}
                      readOnly
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }}
                    />
                  </TableCell>
                  {months.map(month => (
                    <TableCell key={month}>
                      <NumberInput
                        type="number"
                        value={row.monthlyHours[month] || ''}
                        onChange={(e) => handleHoursChange(row.id, month, e.target.value)}
                        min="0"
                        max="160"
                        style={{
                          backgroundColor: 'white'
                        }}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <NumberInput
                      type="number"
                      value={row.odc || ''}
                      onChange={(e) => handleODCChange(row.id, e.target.value)}
                      min="0"
                      style={{
                        backgroundColor: 'white'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      type="number"
                      value={row.totalHours}
                      readOnly
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <NumberInput
                      type="number"
                      value={row.totalCost}
                      readOnly
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={rows.length === 0}
          >
            Save WBS Data
          </Button>
        </Box>
      </Paper>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            This action will delete this row and {deleteDialog.childCount} child {deleteDialog.childCount === 1 ? 'row' : 'rows'}. Are you sure you want to proceed?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkBreakdownStructureForm;
