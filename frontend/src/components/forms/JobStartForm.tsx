import React, { useState, useEffect, useContext } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, TextField } from '@mui/material';
import { ResourceAPI, WBSStructureAPI } from '../../dummyapi/wbsApi';
import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType } from '../../types';
import { WBSTaskResourceAllocation } from '../../dummyapi/database/dummyWBSTasks';
import { WBSRowData } from '../../types/wbs';

interface TaskAllocation {
  taskId: number;
  title: string;
  rate: number;
  hours: number;
  cost: number;
}

interface EmployeeAllocation {
  id: number;
  name: string;
  is_consultant: boolean;
  allocations: TaskAllocation[];
  totalHours: number;
  totalCost: number;
  remarks: string;
}

interface ExpenseEntry {
  number: string;
  remarks: string;
}

interface OutsideAgencyEntry {
  rate: string;
  units: string;
  number: string;
  remarks: string;
}

interface ProjectSpecificEntry {
  name: string;
  number: string;
  remarks: string;
}

type ExpensesType = {
  '2a': ExpenseEntry;
  '2b': ExpenseEntry;
  '3': ExpenseEntry;
  '4': ExpenseEntry;
  '5': ExpenseEntry;
  '6b': ExpenseEntry;
  '7': ExpenseEntry;
}

type OutsideAgencyType = {
  'a': OutsideAgencyEntry;
  'b': OutsideAgencyEntry;
  'c': OutsideAgencyEntry;
}

type ProjectSpecificType = {
  '6c': ProjectSpecificEntry;
  '6d': ProjectSpecificEntry;
  '6e': ProjectSpecificEntry;
}

const formatTitle = (title: string): string => {
  return title
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const JobStartForm: React.FC = () => {
  const context = useContext<projectManagementAppContextType | null>(projectManagementAppContext);
  const [employeeAllocations, setEmployeeAllocations] = useState<EmployeeAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for expenses section
  const [expenses, setExpenses] = useState<ExpensesType>({
    '2a': { number: '10000', remarks: '' },
    '2b': { number: '10000', remarks: '' },
    '3': { number: '', remarks: '' },
    '4': { number: '10000', remarks: '' },
    '5': { number: '10000', remarks: '' },
    '6b': { number: '', remarks: '' },
    '7': { number: '100000', remarks: '' },
  });

  const [outsideAgency, setOutsideAgency] = useState<OutsideAgencyType>({
    'a': { rate: '', units: '', number: '', remarks: '' },
    'b': { rate: '', units: '', number: '', remarks: '' },
    'c': { rate: '', units: '', number: '', remarks: '' },
  });

  const [projectSpecific, setProjectSpecific] = useState<ProjectSpecificType>({
    '6c': { name: '', number: '', remarks: '' },
    '6d': { name: '', number: '', remarks: '' },
    '6e': { name: '', number: '', remarks: '' },
  });

  useEffect(() => {
    const fetchAllocations = async () => {
      if (!context?.selectedProject?.id) {
        setError('No project selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [allocations, wbsTasks] = await Promise.all([
          ResourceAPI.getResourceAllocations(context.selectedProject.id),
          WBSStructureAPI.getProjectWBS(context.selectedProject.id)
        ]);

        const employeeMap = new Map<number, EmployeeAllocation>();

        allocations.forEach((allocation: WBSTaskResourceAllocation) => {
          if (!allocation.employee) return;

          const employeeId = allocation.employee.id;
          if (!employeeMap.has(employeeId)) {
            employeeMap.set(employeeId, {
              id: employeeId,
              name: allocation.employee.name,
              is_consultant: allocation.employee.is_consultant,
              allocations: [],
              totalHours: 0,
              totalCost: 0,
              remarks: ''
            });
          }

          const emp = employeeMap.get(employeeId)!;
          const task = wbsTasks.find((t: WBSRowData) => t.id === allocation.wbs_task_id);
          const taskCost = allocation.cost_rate * (allocation.total_hours || 0);

          emp.allocations.push({
            taskId: allocation.wbs_task_id,
            title: task?.title || `Task ${allocation.wbs_task_id}`,
            rate: allocation.cost_rate,
            hours: allocation.total_hours || 0,
            cost: taskCost
          });
          emp.totalHours += allocation.total_hours || 0;
          emp.totalCost += taskCost;
        });

        setEmployeeAllocations(Array.from(employeeMap.values()));
      } catch (error) {
        console.error('Error fetching allocations:', error);
        setError('Failed to load allocation data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllocations();
  }, [context?.selectedProject?.id]);

  const calculateTotalCost = (employees: EmployeeAllocation[], isConsultant: boolean) => {
    return employees
      .filter(emp => emp.is_consultant === isConsultant)
      .reduce((total, emp) => total + emp.totalCost, 0);
  };

  const handleRemarksChange = (employeeId: number, value: string) => {
    setEmployeeAllocations(prevAllocations => 
      prevAllocations.map(emp => 
        emp.id === employeeId ? { ...emp, remarks: value } : emp
      )
    );
  };

  const handleExpenseChange = (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => {
    setExpenses(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleOutsideAgencyChange = (id: keyof OutsideAgencyType, field: keyof OutsideAgencyEntry, value: string) => {
    setOutsideAgency(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleProjectSpecificChange = (id: keyof ProjectSpecificType, field: keyof ProjectSpecificEntry, value: string) => {
    setProjectSpecific(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const calculateExpensesTotal = () => {
    let total = 0;
    // Add up all expense entries
    Object.values(expenses).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    // Add up outside agency entries
    Object.values(outsideAgency).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    // Add up project specific entries
    Object.values(projectSpecific).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    return total;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: '#fff3f3' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        PMD1. Job Start Form
      </Typography>

      {/* Time Section */}
      <TableContainer component={Paper} sx={{ mt: 2, mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Cost Head</TableCell>
              <TableCell align="right">Rate (Rs)</TableCell>
              <TableCell align="right">Units (Hours)</TableCell>
              <TableCell align="right">Budgeted Cost (Rs.)</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold'}}>1.0</TableCell>
              <TableCell sx={{ fontWeight: 'bold', p: 1 }}>TIME</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>1a</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Employee Personnel</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="right">{calculateTotalCost(employeeAllocations, false)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            {employeeAllocations
              .filter(emp => !emp.is_consultant)
              .map((emp) => (
                <React.Fragment key={emp.id}>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell align="right">
                      {emp.allocations.length === 1 ? emp.allocations[0].rate : ''}
                    </TableCell>
                    <TableCell align="right">
                      {emp.allocations.length === 1 ? emp.allocations[0].hours : emp.totalHours}
                    </TableCell>
                    <TableCell align="right">{emp.totalCost}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={emp.remarks}
                        onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                  {emp.allocations.length > 1 && emp.allocations.map((alloc) => (
                    <TableRow key={`${emp.id}-${alloc.taskId}`}>
                      <TableCell></TableCell>
                      <TableCell sx={{ pl: 4 }}>{formatTitle(alloc.title)}</TableCell>
                      <TableCell align="right">{alloc.rate}</TableCell>
                      <TableCell align="right">{alloc.hours}</TableCell>
                      <TableCell align="right">{alloc.cost}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>1b</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contract Employee</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell align="right">{calculateTotalCost(employeeAllocations, true)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            {employeeAllocations
              .filter(emp => emp.is_consultant)
              .map((emp) => (
                <React.Fragment key={emp.id}>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell align="right">
                      {emp.allocations.length === 1 ? emp.allocations[0].rate : ''}
                    </TableCell>
                    <TableCell align="right">
                      {emp.allocations.length === 1 ? emp.allocations[0].hours : emp.totalHours}
                    </TableCell>
                    <TableCell align="right">{emp.totalCost}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={emp.remarks}
                        onChange={(e) => handleRemarksChange(emp.id, e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                  {emp.allocations.length > 1 && emp.allocations.map((alloc) => (
                    <TableRow key={`${emp.id}-${alloc.taskId}`}>
                      <TableCell></TableCell>
                      <TableCell sx={{ pl: 4 }}>{formatTitle(alloc.title)}</TableCell>
                      <TableCell align="right">{alloc.rate}</TableCell>
                      <TableCell align="right">{alloc.hours}</TableCell>
                      <TableCell align="right">{alloc.cost}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Estimated Expenses Section */}
      <TableContainer component={Paper} sx={{ mt: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Rate (Rs)</TableCell>
              <TableCell align="right">Units</TableCell>
              <TableCell align="right">Amount (Rs.)</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} sx={{ fontWeight: 'bold' }}>2.0 ESTIMATED EXPENSES</TableCell>
            </TableRow>

            {/* Regular Expenses */}
            {(Object.entries(expenses) as [keyof ExpensesType, ExpenseEntry][]).map(([id, entry]) => (
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>
                  {id === '2a' && 'Travel'}
                  {id === '2b' && 'Subsistence'}
                  {id === '3' && 'Local conveyance'}
                  {id === '4' && 'Communications'}
                  {id === '5' && 'Stationery and printing'}
                  {id === '6b' && 'Survey works'}
                  {id === '7' && 'Expense Contingencies'}
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={entry.number}
                    onChange={(e) => handleExpenseChange(id, 'number', e.target.value)}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell align="right">{entry.number}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.remarks}
                    onChange={(e) => handleExpenseChange(id, 'remarks', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Outside Agency Section */}
            <TableRow>
              <TableCell>6a</TableCell>
              <TableCell colSpan={5}>Outside Agency</TableCell>
            </TableRow>
            {(Object.entries(outsideAgency) as [keyof OutsideAgencyType, OutsideAgencyEntry][]).map(([id, entry]) => (
              <TableRow key={id}>
                <TableCell></TableCell>
                <TableCell>{id.toUpperCase()}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={entry.rate}
                    onChange={(e) => handleOutsideAgencyChange(id, 'rate', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={entry.units}
                    onChange={(e) => handleOutsideAgencyChange(id, 'units', e.target.value)}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={entry.number}
                    onChange={(e) => handleOutsideAgencyChange(id, 'number', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.remarks}
                    onChange={(e) => handleOutsideAgencyChange(id, 'remarks', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Project Specific Items */}
            {(Object.entries(projectSpecific) as [keyof ProjectSpecificType, ProjectSpecificEntry][]).map(([id, entry]) => (
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.name}
                    onChange={(e) => handleProjectSpecificChange(id, 'name', e.target.value)}
                    placeholder="Project specific item name"
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={entry.number}
                    onChange={(e) => handleProjectSpecificChange(id, 'number', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.remarks}
                    onChange={(e) => handleProjectSpecificChange(id, 'remarks', e.target.value)}
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Total Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>TOTAL EXPENSES (ODC)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{calculateExpensesTotal()}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default JobStartForm;
