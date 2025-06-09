import React from "react";
import { Controller, useFormContext, useFieldArray } from "react-hook-form";
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
  Autocomplete
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';


const ManpowerPlanningTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "manpowerPlanning"
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
                <TableCell>Planned</TableCell>
                <TableCell>Consumed</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Next Month Planning</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id} sx={{ '& .MuiTableCell-root': { border: 'none' } }}>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.workAssignment`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Work Assignment"
                          value={field.value || ''}
                          error={!!errors.manpowerPlanning?.[index]?.workAssignment}
                          helperText={errors.manpowerPlanning?.[index]?.workAssignment?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.assignee`}
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
                              error={!!errors.manpowerPlanning?.[index]?.assignee}
                              helperText={errors.manpowerPlanning?.[index]?.assignee?.message}
                              sx={textFieldStyle}
                            />
                          )}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.planned`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Planned"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          error={!!errors.manpowerPlanning?.[index]?.planned}
                          helperText={errors.manpowerPlanning?.[index]?.planned?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.consumed`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Consumed"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          error={!!errors.manpowerPlanning?.[index]?.consumed}
                          helperText={errors.manpowerPlanning?.[index]?.consumed?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.balance`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          type="number"
                          placeholder="Balance"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                          error={!!errors.manpowerPlanning?.[index]?.balance}
                          helperText={errors.manpowerPlanning?.[index]?.balance?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.nextMonthPlanning`}
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
                          error={!!errors.manpowerPlanning?.[index]?.nextMonthPlanning}
                          helperText={errors.manpowerPlanning?.[index]?.nextMonthPlanning?.message}
                          sx={textFieldStyle}
                        />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      name={`manpowerPlanning.${index}.manpowerComments`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          size="small"
                          placeholder="Comments"
                          value={field.value || ''}
                          error={!!errors.manpowerPlanning?.[index]?.manpowerComments}
                          helperText={errors.manpowerPlanning?.[index]?.manpowerComments?.message}
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
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ManpowerPlanningTab;
