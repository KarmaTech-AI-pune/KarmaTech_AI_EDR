import React from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext, Control } from "react-hook-form";
import { Box, Grid, Paper, TextField, Typography } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";

interface DateFieldProps {
  name: keyof MonthlyProgressSchemaType['schedule'];
  label: string;
  control: Control<MonthlyProgressSchemaType>;
  disabled?: boolean;
}

const formatDateForInput = (date: Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
};

const parseDateFromInput = (dateString: string): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

const DateField: React.FC<DateFieldProps> = ({ name, label, control, disabled = false }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const error = errors.schedule?.[name];

  return (
    <Controller
      name={`schedule.${name}`}
      control={control}
      render={({ field }) => (
        <TextField
          fullWidth
          label={label}
          type="date"
          value={formatDateForInput(field.value as Date | null)}
          onChange={(e) => field.onChange(parseDateFromInput(e.target.value))}
          error={!!error}
          helperText={error?.message}
          margin="normal"
          disabled={disabled}
          sx={{
            ...textFieldStyle,
            '& .Mui-disabled': {
              backgroundColor: '#f5f5f5',
              color: 'rgba(0, 0, 0, 0.87)', // Ensure text is visible
              '-webkit-text-fill-color': 'rgba(0, 0, 0, 0.87)', // For webkit browsers
            },
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
    />
  );
};

const ScheduleTab: React.FC = () => {
  const { control } = useFormContext<MonthlyProgressSchemaType>();

  const fields: { name: keyof MonthlyProgressSchemaType['schedule']; label: string; disabled?: boolean }[] = [
    { name: "dateOfIssueWOLOI", label: "Date of issue of WO/LOI", disabled: true },
    { name: "completionDateAsPerContract", label: "Completion Date (Contract)", disabled: true },
    { name: "completionDateAsPerExtension", label: "Completion Date (Extension)", disabled: true },
    { name: "expectedCompletionDate", label: "Expected Completion Date" },
  ];

  return (
    <Box>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom color="primary">
          Schedule
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <DateField name={fields[0].name} label={fields[0].label} control={control} disabled={fields[0].disabled} />
            <DateField name={fields[1].name} label={fields[1].label} control={control} disabled={fields[1].disabled} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DateField name={fields[2].name} label={fields[2].label} control={control} disabled={fields[2].disabled} />
            <DateField name={fields[3].name} label={fields[3].label} control={control} disabled={fields[3].disabled} />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ScheduleTab;
