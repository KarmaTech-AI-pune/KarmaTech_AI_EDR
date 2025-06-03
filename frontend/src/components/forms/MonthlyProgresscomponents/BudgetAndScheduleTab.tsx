import React from "react";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import {
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const BudgetAndScheduleTab: React.FC = () => {
  const { control, formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();

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

  // Helper function to format date for input
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // Helper function to parse date from input
  const parseDateFromInput = (dateString: string): Date | null => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Schedule
          </Typography>

          <Controller
            name="dateOfIssueWOLOI"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Date of issue of WO/LOI"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.dateOfIssueWOLOI}
                  helperText={errors.dateOfIssueWOLOI?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    }
                  }}
                />
            )}
          />

          <Controller
            name="completionDateAsPerContract"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Completion Date (Contract)"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.completionDateAsPerContract}
                  helperText={errors.completionDateAsPerContract?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    }
                  }}
                />
            )}
          />

          <Controller
            name="completionDateAsPerExtension"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Completion Date (Extension)"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.completionDateAsPerExtension}
                  helperText={errors.completionDateAsPerExtension?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    }
                  }}
                />
            )}
          />

          <Controller
            name="expectedCompletionDate"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Expected Completion Date"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.expectedCompletionDate}
                  helperText={errors.expectedCompletionDate?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    }
                  }}
                />
            )}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Completion Status
          </Typography>

          <Controller
            name="completeOnCosts"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="% Complete on costs"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.completeOnCosts}
                  helperText={errors.completeOnCosts?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                      step: 0.1
                    }
                  }}
                />
            )}
          />

          <Controller
            name="completeOnEV"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="% Complete on EV (PPC)"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.completeOnEV}
                  helperText={errors.completeOnEV?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      max: 100,
                      step: 0.1
                    }
                  }}
                />
            )}
          />

          <Controller
            name="spi"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="SPI"
                  type="number"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  error={!!errors.spi}
                  helperText={errors.spi?.message || ''}
                  sx={textFieldStyle}
                  margin="normal"
                  slotProps={{
                    htmlInput: {
                      min: 0,
                      step: 0.01
                    }
                  }}
                />
            )}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default BudgetAndScheduleTab;
