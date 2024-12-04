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
              .map((emp, index) => (
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
              .map((emp, index) => (
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
    </Paper>
  );
};

export default JobStartForm;
