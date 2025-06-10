import React from "react";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import {
  Box,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

const ScheduleTab: React.FC = () => {
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
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
         <Typography variant="h6" gutterBottom color="primary">
            Schedule
          </Typography>
      <Grid container spacing={3}>

      <Grid item xs={12} md={6}>

          <Controller
            name="schedule.dateOfIssueWOLOI"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Date of issue of WO/LOI"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.schedule?.dateOfIssueWOLOI}
                  helperText={errors.schedule?.dateOfIssueWOLOI?.message || ''}
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
            name="schedule.completionDateAsPerContract"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Completion Date (Contract)"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.schedule?.completionDateAsPerContract}
                  helperText={errors.schedule?.completionDateAsPerContract?.message || ''}
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
          
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
            name="schedule.completionDateAsPerExtension"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Completion Date (Extension)"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.schedule?.completionDateAsPerExtension}
                  helperText={errors.schedule?.completionDateAsPerExtension?.message || ''}
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
            name="schedule.expectedCompletionDate"
            control={control}
            render={({ field }) => (
                <TextField
                  fullWidth
                  label="Expected Completion Date"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
                  error={!!errors.schedule?.expectedCompletionDate}
                  helperText={errors.schedule?.expectedCompletionDate?.message || ''}
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
      </Grid>
      
      </Grid>
        </Paper>
    </Box>
  );
};

export default ScheduleTab;
