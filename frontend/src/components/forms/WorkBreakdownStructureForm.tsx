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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  styled
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { projectManagementAppContext } from '../../App';
import {
  ResourceRolesAPI,
  EmployeesAPI,
} from '../../dummyapi/database/dummyDatabaseApi';

// Styled components
const NumberInput = styled('input')({
  width: '100%',
  padding: '8px',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: '4px',
  '&:focus': {
    outline: 'none',
    borderColor: '#1976d2'
  }
});
/*
const TotalHoursInput = styled(NumberInput)({
  backgroundColor: 'rgba(25, 118, 210, 0.08) !important',
  fontWeight: 'bold',
  color: '#1976d2'
});*/

const StyledSelect = styled(Select)({
  width: '100%',
  '& .MuiSelect-select': {
    padding: '8px 14px'
  }
});

const HeaderCell = styled(TableCell)(({ theme }) => ({
  textAlign: 'center',
  fontWeight: 'bold',
  backgroundColor: theme.palette.background.paper,
  padding: '16px 8px',
  borderBottom: `2px solid ${theme.palette.divider}`
}));

const TotalHeaderCell = styled(HeaderCell)({
  backgroundColor: 'rgba(25, 118, 210, 0.08)',
  color: '#1976d2'
});

const StyledHeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  position: 'relative',
  padding: theme.spacing(2),
  '& .MuiTypography-root': {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontWeight: 'bold'
  },
  '& .MuiButton-root': {
    marginLeft: 'auto'
  }
}));

// Level options and other constants remain unchanged...
const level1Options = [
  { value: 'inception_report', label: 'Inception Report' },
  { value: 'feasibility_report', label: 'Feasibility Report' },
  { value: 'draft_detailed_project_report', label: 'Draft Detailed Project Report' },
  { value: 'detailed_project_report', label: 'Detailed Project Report' },
  { value: 'tendering_documents', label: 'Tendering Documents' },
  { value: 'construction_supervision', label: 'Construction Supervision' }
];

const level2Options = [
  { value: 'surveys', label: 'Surveys' },
  { value: 'design', label: 'Design' },
  { value: 'cost_estimation', label: 'Cost Estimation' }
];

const level3OptionsByParent = {
  surveys: [
    { value: 'topographical_survey', label: 'Topographical Survey' },
    { value: 'soil_investigation', label: 'Soil Investigation' },
    { value: 'social_impact_assessment', label: 'Social Impact Assessment' },
    { value: 'environmental_assessment', label: 'Environmental Assessment' },
    { value: 'flow_measurement', label: 'Flow Measurement' },
    { value: 'water_quality_measurement', label: 'Water Quality Measurement' }
  ],
  design: [
    { value: 'process_design', label: 'Process Design' },
    { value: 'mechanical_design', label: 'Mechanical Design' },
    { value: 'structural_design', label: 'Structural Design' },
    { value: 'electrical_design', label: 'Electrical Design' },
    { value: 'ica_design', label: 'ICA Design' }
  ]
};

// Interfaces remain unchanged...
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

const WorkBreakdownStructureForm: React.FC = () => {
  const context = useContext(projectManagementAppContext);
  const [rows, setRows] = useState<WBSRow[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]); // Store all employees
  const [error, setError] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(true);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    childCount: 0
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const allRoles = await ResourceRolesAPI.getAllRoles();
        setRoles(allRoles);
        
        // Load all employees once
        const employees = EmployeesAPI.getAllEmployees();
        setAllEmployees(employees);

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
        setError('Failed to load roles');
      }
    };
    loadInitialData();
  }, []);

  const calculateChildTotals = (parentRow: WBSRow) => {
    let childRows: WBSRow[] = [];
    if (parentRow.level === 1) {
      // Get all level 2 rows that are children of this level 1 row
      const level2Children = rows.filter(r => r.level === 2 && r.parentId === parentRow.id);
      // Get all level 3 rows that are children of those level 2 rows
      level2Children.forEach(l2 => {
        childRows = childRows.concat(rows.filter(r => r.level === 3 && r.parentId === l2.id));
      });
    } else if (parentRow.level === 2) {
      // Get all level 3 rows that are children of this level 2 row
      childRows = rows.filter(r => r.level === 3 && r.parentId === parentRow.id);
    }

    const totals = {
      monthlyHours: {} as { [key: string]: number },
      totalHours: 0,
      odc: 0,
      totalCost: 0
    };

    childRows.forEach(child => {
      // Sum up monthly hours
      months.forEach(month => {
        totals.monthlyHours[month] = (totals.monthlyHours[month] || 0) + (child.monthlyHours[month] || 0);
      });
      
      // Sum up other totals
      totals.totalHours += child.totalHours;
      totals.odc += child.odc;
      totals.totalCost += child.totalCost;
    });

    return totals;
  };

  // Add new function to calculate overall totals
  const calculateOverallTotals = () => {
    const level3Rows = rows.filter(row => row.level === 3);
    return {
      totalHours: level3Rows.reduce((sum, row) => sum + row.totalHours, 0),
      totalCost: level3Rows.reduce((sum, row) => sum + row.totalCost, 0)
    };
  };

  // Helper functions remain unchanged...
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

  // Event handlers remain unchanged...
  const addNewMonth = () => {
    const lastMonth = months[months.length - 1];
    const [monthName, yearStr] = lastMonth.split(' ');
    console.log(monthName)
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

    // Allow empty string and any numeric value
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

    // Convert to number and validate it's a number
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

  const handleLevelChange = (rowId: number, value: string, level: 1 | 2 | 3) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const updates: Partial<WBSRow> = {};
        if (level === 1) {
          updates.level1 = value;
          updates.level2 = '';
          updates.level3 = '';
        } else if (level === 2) {
          updates.level2 = value;
          updates.level3 = '';
        } else if (level === 3) {
          updates.level3 = value;
        }
        return { ...row, ...updates };
      }
      return row;
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

  const getEmployeesForRole = (roleId: string) => {
    return allEmployees.filter(emp => emp.roleId === parseInt(roleId));
  };

  const renderAddButton = (level: 1 | 2 | 3, parentId?: number, indentLevel: number = 0): JSX.Element => {
    if (editMode) {
      return <></>;
    }
    return (
      <TableRow
        sx={{
          height: '28px',
          '& > td': {
            bgcolor: 'transparent',
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            py: 0
          }
        }}
      >
        <TableCell 
          colSpan={9 + months.length}
          sx={{
            p: 0,
          }}
        >
          <Button
            fullWidth
            size="small"
            sx={{
              ml: `${indentLevel * 3}rem`,
              height: '28px',
              textTransform: 'none',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)'
              }
            }}
            onClick={() => addNewRow(level, parentId)}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            Add Level {level}
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  const renderRow = (row: WBSRow) => {
    const getLevelOptions = () => {
      if (row.level === 1) return level1Options;
      if (row.level === 2) return level2Options;
      
      if (row.level === 3) {
        const parentRow = rows.find(r => r.id === row.parentId);
        if (parentRow && parentRow.level2) {
          const level2Value = parentRow.level2;
          if (level2Value === 'surveys') return level3OptionsByParent.surveys;
          if (level2Value === 'design') return level3OptionsByParent.design;
        }
        return [];
      }
      return [];
    };

    const getLevelValue = () => {
      if (row.level === 1) return row.level1;
      if (row.level === 2) return row.level2;
      return row.level3;
    };

    const selectedRole = roles.find(r => r.id === parseInt(row.role));
    const rateTooltip = selectedRole ? `Min: ${selectedRole.minRate}, Max: ${selectedRole.maxRate}` : '';
    const employeesForRole = row.role ? getEmployeesForRole(row.role) : [];

    // Calculate totals for parent rows
    const childTotals = row.level < 3 ? calculateChildTotals(row) : null;

    return (
      <TableRow 
        key={row.id}
        sx={{ 
          '& > td': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            bgcolor: row.level === 1 ? 'rgba(0, 0, 0, 0.06)' : 
                    row.level === 2 ? 'rgba(0, 0, 0, 0.03)' : 
                    'transparent',
            pl: '8px !important',
          }
        }}
      >
        <TableCell sx={{ width: '48px', p: '4px !important' }}>
          {!editMode && (
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(row.id)}
              sx={{
                p: 0.5,
                '&:hover': {
                  color: 'error.main'
                }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </TableCell>
        <TableCell>
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            width: row.level === 1 ? '60%' : row.level === 2 ? '80%' : '75%',
            pl: `${(row.level - 1) * 3}rem`,
            position: 'relative',
            '&::before': row.level > 1 ? {
              content: '""',
              position: 'absolute',
              left: `${(row.level - 1) * 3 - 1}rem`,
              top: '50%',
              width: '0.75rem',
              height: '1px',
              bgcolor: 'rgba(0, 0, 0, 0.23)'
            } : {}
          }}>
            <StyledSelect
              value={getLevelValue()}
              onChange={(e) => handleLevelChange(row.id, e.target.value as string, row.level)}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
              disabled={editMode}
            >
              <MenuItem value="">Select</MenuItem>
              {getLevelOptions().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </StyledSelect>
          </Box>
        </TableCell>
        <TableCell>
          {row.level === 3 ? (
            <StyledSelect
              value={row.role}
              onChange={(e) => handleRoleChange(row.id, e.target.value as string)}
              size="small"
              sx={{ bgcolor: 'background.paper' }}
              disabled={editMode}
            >
              <MenuItem value="">Select Role</MenuItem>
              {roles.map(role => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </StyledSelect>
          ) : (
            <Box sx={{ height: '37px' }} /> // Placeholder for spacing
          )}
        </TableCell>
        <TableCell>
          {row.level === 3 ? (
            <StyledSelect
              value={row.name}
              onChange={(e) => handleEmployeeChange(row.id, e.target.value as string)}
              size="small"
              disabled={!row.role || editMode}
              sx={{ bgcolor: 'background.paper' }}
            >
              <MenuItem value="">Select Name</MenuItem>
              {employeesForRole.map(employee => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </StyledSelect>
          ) : (
            <Box sx={{ height: '37px' }} /> // Placeholder for spacing
          )}
        </TableCell>
        <TableCell>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              value={row.costRate || ''}
              onChange={(e) => handleCostRateChange(row.id, e.target.value)}
              disabled={editMode || !row.role}
              title={rateTooltip}
              style={{
                backgroundColor: editMode ? 'rgba(0, 0, 0, 0.04)' : 'white'
              }}
            />
          ) : (
            <Box sx={{ height: '37px' }} /> // Placeholder for spacing
          )}
        </TableCell>
        {months.map(month => (
          <TableCell key={month}>
            {row.level === 3 ? (
              <NumberInput
                type="number"
                value={row.monthlyHours[month] || ''}
                onChange={(e) => handleHoursChange(row.id, month, e.target.value)}
                min="0"
                max="160"
                style={{
                  backgroundColor: 'white'
                }}
                disabled={editMode}
              />
            ) : childTotals ? (
              <NumberInput
                type="number"
                value={childTotals.monthlyHours[month] || ''}
                readOnly
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }}
              />
            ) : (
              <Box sx={{ height: '37px' }} />
            )}
          </TableCell>
        ))}
        <TableCell>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              value={row.odc || ''}
              onChange={(e) => handleODCChange(row.id, e.target.value)}
              min="0"
              style={{
                backgroundColor: 'white'
              }}
              disabled={editMode}
            />
          ) : childTotals ? (
            <NumberInput
              type="number"
              value={childTotals.odc || ''}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : (
            <Box sx={{ height: '37px' }} />
          )}
        </TableCell>
        <TableCell>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              value={row.totalHours}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : childTotals ? (
            <NumberInput
              type="number"
              value={childTotals.totalHours || ''}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : (
            <Box sx={{ height: '37px' }} />
          )}
        </TableCell>
        <TableCell>
          {row.level === 3 ? (
            <NumberInput
              type="number"
              value={row.totalCost}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : childTotals ? (
            <NumberInput
              type="number"
              value={childTotals.totalCost || ''}
              readOnly
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.04)'
              }}
            />
          ) : (
            <Box sx={{ height: '37px' }} />
          )}
        </TableCell>
      </TableRow>
    );
  };

  const renderRowsAndButtons = () => {
    const level1Rows = rows.filter(row => row.level === 1);
    const result: JSX.Element[] = [];

    level1Rows.forEach(level1Row => {
      result.push(renderRow(level1Row));

      const level2Rows = rows.filter(row => row.level === 2 && row.parentId === level1Row.id);
      level2Rows.forEach(level2Row => {
        result.push(renderRow(level2Row));

        const level3Rows = rows.filter(row => row.level === 3 && row.parentId === level2Row.id);
        level3Rows.forEach(level3Row => {
          result.push(renderRow(level3Row));
        });

        if(!editMode)result.push(renderAddButton(3, level2Row.id, 2));
      });

      if(!editMode)result.push(renderAddButton(2, level1Row.id, 1));
    });

    if(!editMode)result.push(renderAddButton(1));

    return result;
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
        <StyledHeaderBox>
          <Typography variant="h6">
            Work Breakdown Structure
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? 'Edit Mode' : 'Exit Edit Mode'}
            </Button>
            {!editMode && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addNewMonth}
              >
                Add Month
              </Button>
            )}
          </Box>
        </StyledHeaderBox>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mx: 2, mb: 2 }}>
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
                <HeaderCell sx={{ width: '48px', p: '4px !important' }}>
                  Actions
                </HeaderCell>
                <HeaderCell sx={{ minWidth: '400px' }}>Task Level</HeaderCell>
                <HeaderCell sx={{ minWidth: '200px' }}>Role</HeaderCell>
                <HeaderCell sx={{ minWidth: '200px' }}>Name</HeaderCell>
                <HeaderCell sx={{ minWidth: 100 }}>Cost Rate</HeaderCell>
                {months.map(month => (
                  <HeaderCell key={month} sx={{ minWidth: 100 }}>{month}</HeaderCell>
                ))}
                <HeaderCell sx={{ minWidth: 100 }}>ODCs</HeaderCell>
                <TotalHeaderCell sx={{ minWidth: 100 }}>Total Monthly Hours</TotalHeaderCell>
                <HeaderCell sx={{ minWidth: 100 }}>Total Cost</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderRowsAndButtons()}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 2, mt: 2 }}>
        <Box sx={{ mb: 2 }}>
          <TableContainer>
            <Table size="small" sx={{ maxWidth: 400, ml: 'auto' }}>
              <TableHead>
                <TableRow>
                  <HeaderCell>Total Hours</HeaderCell>
                  <HeaderCell>Total Cost</HeaderCell>
                </TableRow>
</TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {calculateOverallTotals().totalHours}
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {context?.selectedProject?.currency} {calculateOverallTotals().totalCost.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
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
