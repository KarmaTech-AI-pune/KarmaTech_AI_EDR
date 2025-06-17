import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { MonthlyProgressAPI, MonthlyHourDto } from "../../../services/monthlyProgressApi";
import { projectManagementAppContext } from "../../../App";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from "@mui/material";

const ManpowerPlanningTab: React.FC = () => {
  const { control, formState: { errors }, setValue } = useFormContext<MonthlyProgressSchemaType>();
  const context = useContext(projectManagementAppContext);
  const projectId = context?.selectedProject?.id?.toString();
  
  // State for API data loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fields, replace } = useFieldArray({
    control,
    name: "manpowerPlanning.manpower"
  });
  
  // Watch manpower array to calculate total
  const manpowerEntries = useWatch({
    control,
    name: "manpowerPlanning.manpower"
  });

  // Common text field styles following the application pattern
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
      '&:hover fieldset': {
        borderColor: '#1869DA',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1869DA',
      }
    },
    // Hide number input arrows
    '& input[type=number]': {
      '-moz-appearance': 'textfield',
    },
    '& input[type=number]::-webkit-outer-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    },
    '& input[type=number]::-webkit-inner-spin-button': {
      '-webkit-appearance': 'none',
      margin: 0,
    }
  };

  // Helper function to get current and next month hours from monthlyHours array
  const getMonthlyHours = (monthlyHours: MonthlyHourDto[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextMonth = nextDate.toLocaleString('default', { month: 'long' });
    const nextYear = nextDate.getFullYear();
    
    const currentMonthData = monthlyHours?.find(item => 
      item.month === currentMonth && item.year === currentYear
    );
    
    const nextMonthData = monthlyHours?.find(item => 
      item.month === nextMonth && item.year === nextYear
    );
    
    return {
      currentMonthHours: currentMonthData?.plannedHours || 0,
      nextMonthHours: nextMonthData?.plannedHours || 0
    };
  };

  // Calculate totals using useMemo to avoid unnecessary recalculations
  const totals = useMemo(() => {
    if (!manpowerEntries || manpowerEntries.length === 0) {
      return {
        plannedTotal: 0,
        consumedTotal: 0,
        balanceTotal: 0,
        nextMonthPlanningTotal: 0
      };
    }
    
    const plannedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.planned || 0), 0);
    const consumedTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.consumed || 0), 0);
    const balanceTotal = plannedTotal - consumedTotal;
    const nextMonthPlanningTotal = manpowerEntries.reduce((sum, entry) => sum + (entry.nextMonthPlanning || 0), 0);
    
    return {
      plannedTotal,
      consumedTotal,
      balanceTotal,
      nextMonthPlanningTotal
    };
  }, [manpowerEntries]);
  
  // Use a ref to track previous totals to prevent unnecessary updates
  const prevTotalsRef = useRef(totals);
  
  // Update form values only when totals actually change
  useEffect(() => {
    // Skip the first render or when there are no entries
    if (!manpowerEntries || manpowerEntries.length === 0) return;
    
    // Check if totals have changed to avoid infinite loops
    const prevTotals = prevTotalsRef.current;
    if (
      prevTotals.plannedTotal !== totals.plannedTotal ||
      prevTotals.consumedTotal !== totals.consumedTotal ||
      prevTotals.balanceTotal !== totals.balanceTotal ||
      prevTotals.nextMonthPlanningTotal !== totals.nextMonthPlanningTotal
    ) {
      // Update the ref with current totals
      prevTotalsRef.current = totals;
      
      // Batch updates to reduce renders
      setValue("manpowerPlanning.manpowerTotal", {
        plannedTotal: totals.plannedTotal,
        consumedTotal: totals.consumedTotal,
        balanceTotal: totals.balanceTotal,
        nextMonthPlanningTotal: totals.nextMonthPlanningTotal
      });
    }
  }, [totals, setValue, manpowerEntries]);
  
  // Fetch manpower resources data
  useEffect(() => {
    const fetchManpowerData = async () => {
      if (!projectId) {
        setError("Project ID is not available. Please select a project.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch data from API using the project ID from context
        const data = await MonthlyProgressAPI.getManpowerResources(projectId);
        
        // Transform API data to form format
        if (data?.resources && data.resources.length > 0) {
          const formData = data.resources.map(resource => {
            const { currentMonthHours, nextMonthHours } = getMonthlyHours(resource.monthlyHours);
            
            return {
              workAssignment: resource.taskTitle,
              assignee: resource.employeeName,
              planned: currentMonthHours,
              consumed: 0,
              balance: currentMonthHours,
              nextMonthPlanning: nextMonthHours,
              manpowerComments: ""
            };
          });
          
          replace(formData);
        }
        
      } catch (err) {
        console.error("Error fetching manpower data:", err);
        setError("Failed to load manpower resources. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchManpowerData();
  }, [projectId, replace]);



  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Manpower Planning
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Loading data...
            </Typography>
          </Box>
        )}

        <TableContainer> 
          <Table sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 600, backgroundColor: '#f5f5f5', border: 'none' } }}>
                <TableCell>Work Assignment</TableCell>
                <TableCell sx={{ minWidth: 150 }}>Assignee</TableCell>
                <TableCell align="center">Planned</TableCell>
                <TableCell align="center">Consumed</TableCell>
                <TableCell align="center">Balance</TableCell>
                <TableCell align="center">Next Month Planning</TableCell>
                <TableCell>Comments</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.workAssignment`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Work Assignment"
                          value={field.value || ''}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.workAssignment}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.workAssignment?.message}
                          sx={textFieldStyle}
                          InputProps={{ readOnly: true }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.assignee`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Assignee"
                          value={field.value || ''}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.assignee}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.assignee?.message}
                          sx={textFieldStyle}
                          InputProps={{ readOnly: true }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.planned`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Planned"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            field.onChange(value);
                            
                            // Get current consumed value to calculate balance
                            const consumed = manpowerEntries?.[index]?.consumed;
                            if (value !== null && consumed !== null) {
                              setValue(`manpowerPlanning.manpower.${index}.balance`, value - consumed);
                            }
                          }}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.planned}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.planned?.message}
                          sx={textFieldStyle}
                          inputProps={{ min: 0 ,
                            readOnly: true
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.consumed`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Consumed"
                          value={field.value || ''}
                          onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            field.onChange(value);
                            
                            // Get current planned value to calculate balance
                            const planned = manpowerEntries?.[index]?.planned;
                            if (planned !== null && value !== null) {
                              setValue(`manpowerPlanning.manpower.${index}.balance`, planned - value);
                            }
                          }}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.consumed}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.consumed?.message}
                          sx={textFieldStyle}
                          inputProps={{ min: 0 }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.balance`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Balance"
                          value={field.value || ''}
                          InputProps={{
                            readOnly: true,
                          }}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.balance}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.balance?.message}
                          sx={{
                            ...textFieldStyle,
                            '& .MuiOutlinedInput-root': {
                              ...textFieldStyle['& .MuiOutlinedInput-root'],
                              backgroundColor: '#f9f9f9',
                            }
                          }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.nextMonthPlanning`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Next Month"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.nextMonthPlanning}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.nextMonthPlanning?.message}
                          sx={textFieldStyle}
                          inputProps={{ min: 0,
                            readOnly: true 
                           }}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.manpowerComments`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Comments"
                          value={field.value || ''}
                          error={!!errors.manpowerPlanning?.manpower?.[index]?.manpowerComments}
                          helperText={errors.manpowerPlanning?.manpower?.[index]?.manpowerComments?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
              
                
                  <TableRow sx={{ 
                    backgroundColor: '#f5f5f5',
                    '& .MuiTableCell-root': { 
                      fontWeight: 600,
                      border: 'none'
                    }
                  }}>
                    <TableCell>
                      <Typography variant="subtitle2">TOTAL</Typography>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2">
                        {totals.plannedTotal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2">
                        {totals.consumedTotal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2" color={totals.balanceTotal < 0 ? 'error' : 'inherit'}>
                        {totals.balanceTotal}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle2">
                        {totals.nextMonthPlanningTotal}
                      </Typography>
                    </TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ManpowerPlanningTab;