import React, { useEffect, useMemo, useRef } from "react";
import { Controller, useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  IconButton,
  Chip,
  Autocomplete,
  Divider
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const ManpowerPlanningTab: React.FC = () => {
  const { control, formState: { errors }, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
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
    }
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

  // Add new manpower planning row
  const addManpowerRow = () => {
    append({
      workAssignment: "",
      assignee: [],
      planned: null,
      consumed: null,
      balance: null,
      nextMonthPlanning: null,
      manpowerComments: ""
    });
  };

  // Remove manpower planning row
  const removeManpowerRow = (index: number) => {
    remove(index);
  };

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Manpower Planning
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addManpowerRow}
            sx={{
              borderColor: '#1869DA',
              color: '#1869DA',
              '&:hover': {
                borderColor: '#1869DA',
                backgroundColor: 'rgba(24, 105, 218, 0.04)'
              }
            }}
          >
            Add Row
          </Button>
        </Box>

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
                <TableCell>Actions</TableCell>
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
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.manpower.${index}.assignee`}
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          multiple
                          freeSolo
                          options={[]}
                          value={field.value || []}
                          onChange={(_, newValue) => field.onChange(newValue)}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                variant="outlined"
                                label={option}
                                size="small"
                                {...getTagProps({ index })}
                                key={index}
                              />
                            ))
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              placeholder="Add assignee"
                              error={!!errors.manpowerPlanning?.manpower?.[index]?.assignee}
                              helperText={errors.manpowerPlanning?.manpower?.[index]?.assignee?.message}
                              sx={textFieldStyle}
                            />
                          )}
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
                          inputProps={{ min: 0 }}
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
                          inputProps={{ min: 0 }}
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
                  <TableCell>
                    <IconButton
                      onClick={() => removeManpowerRow(index)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {fields.length === 0 && (
                <TableRow sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No manpower planning entries. Click "Add Row" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              
              {/* Total Row */}
              {fields.length > 0 && (
                <>
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
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ManpowerPlanningTab;
