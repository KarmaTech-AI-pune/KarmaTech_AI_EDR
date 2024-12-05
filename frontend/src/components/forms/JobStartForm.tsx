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
  description: string;
  rate: string;
  units: string;
  remarks: string;
}

interface ProjectSpecificEntry {
  name: string;
  number: string;
  remarks: string;
}

interface TimeContingencyEntry {
  rate: string;
  units: string;
  remarks: string;
}

interface ServiceTaxEntry {
  percentage: string;
}

type ExpensesType = {
  '2a': ExpenseEntry;
  '2b': ExpenseEntry;
  '3': ExpenseEntry;
  '4': ExpenseEntry;
  '5': ExpenseEntry;
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

  const [timeContingency, setTimeContingency] = useState<TimeContingencyEntry>({
    rate: '',
    units: '',
    remarks: ''
  });

  const [expenses, setExpenses] = useState<ExpensesType>({
    '2a': { number: '10000', remarks: '' },
    '2b': { number: '10000', remarks: '' },
    '3': { number: '', remarks: '' },
    '4': { number: '10000', remarks: '' },
    '5': { number: '10000', remarks: '' },
    '7': { number: '100000', remarks: '' },
  });

  const [surveyWorks, setSurveyWorks] = useState<ExpenseEntry>({
    number: '',
    remarks: ''
  });

  const [outsideAgency, setOutsideAgency] = useState<OutsideAgencyType>({
    'a': { description: '', rate: '', units: '', remarks: '' },
    'b': { description: '', rate: '', units: '', remarks: '' },
    'c': { description: '', rate: '', units: '', remarks: '' },
  });

  const [projectSpecific, setProjectSpecific] = useState<ProjectSpecificType>({
    '6c': { name: '', number: '', remarks: '' },
    '6d': { name: '', number: '', remarks: '' },
    '6e': { name: '', number: '', remarks: '' },
  });

  const [projectFees, setProjectFees] = useState<string>('800000');
  const [serviceTax, setServiceTax] = useState<ServiceTaxEntry>({
    percentage: '15'
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

  const handleTimeContingencyChange = (field: keyof TimeContingencyEntry, value: string) => {
    setTimeContingency(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExpenseChange = (id: keyof ExpensesType, field: keyof ExpenseEntry, value: string) => {
    setExpenses(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSurveyWorksChange = (field: keyof ExpenseEntry, value: string) => {
    setSurveyWorks(prev => ({
      ...prev,
      [field]: value
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

  const handleProjectFeesChange = (value: string) => {
    setProjectFees(value);
  };

  const handleServiceTaxChange = (value: string) => {
    setServiceTax(prev => ({
      ...prev,
      percentage: value
    }));
  };

  const calculateTimeContingencyCost = () => {
    const rate = Number(timeContingency.rate) || 0;
    const units = Number(timeContingency.units) || 0;
    return rate * units;
  };

  const calculateOutsideAgencyCost = (entry: OutsideAgencyEntry) => {
    const rate = Number(entry.rate) || 0;
    const units = Number(entry.units) || 0;
    return rate * units;
  };

  const calculateTotalTimeCost = () => {
    const employeesTotal = calculateTotalCost(employeeAllocations, false);
    const consultantsTotal = calculateTotalCost(employeeAllocations, true);
    const contingencyTotal = calculateTimeContingencyCost();
    return employeesTotal + consultantsTotal + contingencyTotal;
  };

  const calculateExpensesTotal = () => {
    let total = 0;
    // Add up all expense entries
    Object.values(expenses).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    // Add survey works
    total += Number(surveyWorks.number) || 0;
    // Add up outside agency entries (rate * units)
    Object.values(outsideAgency).forEach(entry => {
      total += calculateOutsideAgencyCost(entry);
    });
    // Add up project specific entries
    Object.values(projectSpecific).forEach(entry => {
      total += Number(entry.number) || 0;
    });
    return total;
  };

  const calculateGrandTotal = () => {
    const timeCost = calculateTotalTimeCost();
    const expensesTotal = calculateExpensesTotal();
    return timeCost + expensesTotal;
  };

  const calculateProfit = () => {
    const fees = Number(projectFees) || 0;
    const total = calculateGrandTotal();
    return fees - total;
  };

  const calculateServiceTax = () => {
    const fees = Number(projectFees) || 0;
    const taxPercentage = Number(serviceTax.percentage) || 0;
    return (fees * taxPercentage) / 100;
  };

  const calculateTotalProjectFees = () => {
    const fees = Number(projectFees) || 0;
    const tax = calculateServiceTax();
    return fees + tax;
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

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sr. No.</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Rate (Rs)</TableCell>
              <TableCell align="right">Units</TableCell>
              <TableCell align="right">Budgeted Cost (Rs.)</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Time Section */}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold'}}>1.0</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>TIME</TableCell>
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

            {/* Contract Employee Section (without label) */}
            <TableRow>
              <TableCell></TableCell>
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

            {/* Time Contingencies Row */}
            <TableRow>
              <TableCell>1b</TableCell>
              <TableCell>Time Contingencies</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={timeContingency.rate}
                  onChange={(e) => handleTimeContingencyChange('rate', e.target.value)}
                  placeholder="Rate"
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={timeContingency.units}
                  onChange={(e) => handleTimeContingencyChange('units', e.target.value)}
                  placeholder="Units"
                />
              </TableCell>
              <TableCell align="right">{calculateTimeContingencyCost()}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  value={timeContingency.remarks}
                  onChange={(e) => handleTimeContingencyChange('remarks', e.target.value)}
                  placeholder="Remarks"
                />
              </TableCell>
            </TableRow>

            {/* Total Time Cost Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>TOTAL TIME COST</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{calculateTotalTimeCost()}</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Estimated Expenses Section */}
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>2.0</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} colSpan={5}>ESTIMATED EXPENSES</TableCell>
            </TableRow>

            {/* Regular Expenses (2a through 5) */}
            {(['2a', '2b', '3', '4', '5'] as (keyof ExpensesType)[]).map((id) => (
              <TableRow key={id}>
                <TableCell>{id}</TableCell>
                <TableCell>
                  {id === '2a' && 'Travel'}
                  {id === '2b' && 'Subsistence'}
                  {id === '3' && 'Local conveyance'}
                  {id === '4' && 'Communications'}
                  {id === '5' && 'Stationery and printing'}
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={expenses[id].number}
                    onChange={(e) => handleExpenseChange(id, 'number', e.target.value)}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell align="right">{expenses[id].number}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={expenses[id].remarks}
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
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.description}
                    onChange={(e) => handleOutsideAgencyChange(id, 'description', e.target.value)}
                    placeholder="Enter description"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={entry.rate}
                    onChange={(e) => handleOutsideAgencyChange(id, 'rate', e.target.value)}
                    placeholder="Rate"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="number"
                    value={entry.units}
                    onChange={(e) => handleOutsideAgencyChange(id, 'units', e.target.value)}
                    placeholder="Units"
                  />
                </TableCell>
                <TableCell align="right">
                  {calculateOutsideAgencyCost(entry)}
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    fullWidth
                    value={entry.remarks}
                    onChange={(e) => handleOutsideAgencyChange(id, 'remarks', e.target.value)}
                    placeholder="Remarks"
                  />
                </TableCell>
              </TableRow>
            ))}

            {/* Survey Works Section */}
            <TableRow>
              <TableCell>6b</TableCell>
              <TableCell>Survey works</TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  type="number"
                  value={surveyWorks.number}
                  onChange={(e) => handleSurveyWorksChange('number', e.target.value)}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell align="right">{surveyWorks.number}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  value={surveyWorks.remarks}
                  onChange={(e) => handleSurveyWorksChange('remarks', e.target.value)}
                />
              </TableCell>
            </TableRow>

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

            {/* Expense Contingencies */}
            <TableRow>
              <TableCell>7</TableCell>
              <TableCell>Expense Contingencies</TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  type="number"
                  value={expenses['7'].number}
                  onChange={(e) => handleExpenseChange('7', 'number', e.target.value)}
                />
              </TableCell>
              <TableCell></TableCell>
              <TableCell align="right">{expenses['7'].number}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  fullWidth
                  value={expenses['7'].remarks}
                  onChange={(e) => handleExpenseChange('7', 'remarks', e.target.value)}
                />
              </TableCell>
            </TableRow>

            {/* Total Expenses Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>TOTAL EXPENSES (ODC)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{calculateExpensesTotal()}</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Grand Total Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>GRAND TOTAL</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{calculateGrandTotal()}</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5' }}></TableCell>
            </TableRow>

            {/* Profit Row - Styled to stand out */}
            <TableRow>
              <TableCell colSpan={4} sx={{ 
                fontWeight: 'bold', 
                bgcolor: '#e3f2fd',  // Light blue background
                fontSize: '1.1em'    // Slightly larger text
              }}>Profit</TableCell>
              <TableCell align="right" sx={{ 
                fontWeight: 'bold',
                bgcolor: '#e3f2fd',
                fontSize: '1.1em',
                color: calculateProfit() >= 0 ? 'green' : 'red' // Color based on profit/loss
              }}>{calculateProfit()}</TableCell>
              <TableCell sx={{ bgcolor: '#e3f2fd' }}></TableCell>
            </TableRow>

            {/* Project Fees Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>PROJECT FEES</TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  type="number"
                  value={projectFees}
                  onChange={(e) => handleProjectFeesChange(e.target.value)}
                />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Service Tax Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold' }}>
                Service Tax (GST) @ 
                <TextField
                  size="small"
                  type="number"
                  value={serviceTax.percentage}
                  onChange={(e) => handleServiceTaxChange(e.target.value)}
                  sx={{ width: '60px', mx: 1 }}
                />
                %
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>{calculateServiceTax()}</TableCell>
              <TableCell></TableCell>
            </TableRow>

            {/* Total Project Fees Row */}
            <TableRow>
              <TableCell colSpan={4} sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>TOTAL PROJECT FEES</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>{calculateTotalProjectFees()}</TableCell>
              <TableCell sx={{ bgcolor: '#f5f5f5' }}></TableCell>
            </TableRow>
</TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default JobStartForm;
