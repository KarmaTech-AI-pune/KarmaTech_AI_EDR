import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { Controller, useFormContext, useFieldArray, useWatch, FieldPath } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { MonthlyProgressAPI, MonthlyHourDto } from "../../../../services/monthlyProgressApi";
import { projectManagementAppContext } from "../../../../App";
import textFieldStyle from "../../../../theme/textFieldStyle";
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
  CircularProgress
} from "@mui/material";

interface BudgetTextFieldProps {
  name: FieldPath<MonthlyProgressSchemaType>;
  control: any;
  placeholder: string;
  readOnly?: boolean;
  endAdornment?: string;
  type?: string;
}

const BudgetTextField: React.FC<BudgetTextFieldProps> = ({
  name,
  control,
  placeholder,
  readOnly = false,
  endAdornment,
  type = "text"
}) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const getNestedError = (path: string, obj: any) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const error = getNestedError(name, errors);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          size="small"
          type={type}
          placeholder={placeholder}
          value={field.value ?? 0}
          onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          error={!!error}
          helperText={error?.message || ''}
          sx={readOnly ? {} : textFieldStyle}
          InputProps={{
            readOnly,
            endAdornment,
          }}
        />
      )}
    />
  );
};

const ManpowerPlanningTab: React.FC = () => {
  const { control, setValue } = useFormContext<MonthlyProgressSchemaType>();
  const context = useContext(projectManagementAppContext);
  const projectId = context?.selectedProject?.id?.toString();
  
  const [isLoading, setIsLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  const { fields, replace } = useFieldArray({
    control,
    name: "manpowerPlanning.manpower"
  });
  
  const manpowerEntries = useWatch({
    control,
    name: "manpowerPlanning.manpower"
  });

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
  
  const prevTotalsRef = useRef(totals);
  
  useEffect(() => {
    if (!manpowerEntries || manpowerEntries.length === 0) return;
    
    const prevTotals = prevTotalsRef.current;
    if (
      prevTotals.plannedTotal !== totals.plannedTotal ||
      prevTotals.consumedTotal !== totals.consumedTotal ||
      prevTotals.balanceTotal !== totals.balanceTotal ||
      prevTotals.nextMonthPlanningTotal !== totals.nextMonthPlanningTotal
    ) {
      prevTotalsRef.current = totals;
      
      setValue("manpowerPlanning.manpowerTotal", {
        plannedTotal: totals.plannedTotal,
        consumedTotal: totals.consumedTotal,
        balanceTotal: totals.balanceTotal,
        nextMonthPlanningTotal: totals.nextMonthPlanningTotal
      });
    }
  }, [totals, setValue, manpowerEntries]);
  
  useEffect(() => {
    const fetchManpowerData = async () => {
      if (!projectId) {
        setError("Project ID is not available. Please select a project.");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await MonthlyProgressAPI.getManpowerResources(projectId);
        
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
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.workAssignment`} control={control} placeholder="Work Assignment" readOnly />
                  </TableCell>
                  <TableCell>
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.assignee`} control={control} placeholder="Assignee" readOnly />
                  </TableCell>
                  <TableCell align="center">
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.planned`} control={control} placeholder="Planned" type="number" readOnly />
                  </TableCell>
                  <TableCell align="center">
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.consumed`} control={control} placeholder="Consumed" type="number" />
                  </TableCell>
                  <TableCell align="center">
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.balance`} control={control} placeholder="Balance" type="number" readOnly />
                  </TableCell>
                  <TableCell align="center">
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.nextMonthPlanning`} control={control} placeholder="Next Month" type="number" readOnly />
                  </TableCell>
                  <TableCell>
                    <BudgetTextField name={`manpowerPlanning.manpower.${index}.manpowerComments`} control={control} placeholder="Comments" />
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
