import React, { useEffect, useMemo } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext, Control } from "react-hook-form";
import { Grid, Paper, TextField, Typography, Box } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { formatToIndianNumber } from "../../../../utils/numberFormatting";

interface FormFieldProps {
  name: keyof MonthlyProgressSchemaType['actualCost'];
  label: string;
  control: Control<MonthlyProgressSchemaType>;
  readOnly?: boolean;
  value?: number;
}

// Component for displaying formatted numbers in read-only mode
const FormattedNumberField: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const formattedValue = formatToIndianNumber(value);
  
  return (
    <Box sx={{ marginBottom: 2 }}>
      <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 0.5 }}>
        {label}
      </Typography>
      <Box sx={{ 
        padding: '12px 16px', 
        border: '1px solid #e0e0e0', 
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.875rem',
        fontWeight: 500
      }}>
        {formattedValue}
      </Box>
    </Box>
  );
};

const FormField: React.FC<FormFieldProps> = ({ name, label, control, readOnly = false, value }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const error = errors.actualCost?.[name];

  return (
    <Controller
      name={`actualCost.${name}`}
      control={control}
      render={({ field }) => {
        // For read-only fields, show formatted display
        if (readOnly && value !== undefined) {
          return <FormattedNumberField label={label} value={value} />;
        }

        // For editable fields, use regular input
        return (
          <TextField
            fullWidth
            label={label}
            type="number"
            value={field.value ?? ''}
            onChange={(e) => {
              const rawValue = e.target.value === '' ? null : Number(e.target.value);
              field.onChange(rawValue);
            }}
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            error={!!error}
            helperText={error?.message || ''}
            margin="normal"
            InputProps={{
              inputProps: {
                step: 'any'
              }
            }}
            sx={{
              ...textFieldStyle,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'inherit',
              },
            }}
          />
        );
      }}
    />
  );
};

interface SectionProps {
  title: string;
  fields: Array<{
    name: keyof MonthlyProgressSchemaType['actualCost'];
    label: string;
    readOnly?: boolean;
    value?: number;
  }>;
  control: Control<MonthlyProgressSchemaType>;
}

const Section: React.FC<SectionProps> = ({ title, fields, control }) => (
  <Grid item xs={12} md={4}>
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>
      {fields.map(({ name, label, readOnly, value }) => (
        <FormField
          key={name}
          name={name}
          label={label}
          readOnly={readOnly}
          value={value}
          control={control}
        />
      ))}
    </Paper>
  </Grid>
);

const ActualCost: React.FC = () => {
  const { control, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const actualOdcs = watch('actualCost.actualOdc') || 0;
  const actualStaff = watch('actualCost.actualStaff') || 0;
  const priorCumulativeOdc = watch('actualCost.priorCumulativeOdc');
  const priorCumulativeStaff = watch('actualCost.priorCumulativeStaff');

  const calculatedValues = useMemo(() => {
    const priorCumulativeTotal = (priorCumulativeOdc || 0) + (priorCumulativeStaff || 0);
    const actualSubtotal = actualOdcs + actualStaff;
    const totalCumulativeOdc = (priorCumulativeOdc || 0) + actualOdcs;
    const totalCumulativeStaff = (priorCumulativeStaff || 0) + actualStaff;
    const totalCumulativeCost = totalCumulativeOdc + totalCumulativeStaff;
    return {
      priorCumulativeTotal,
      actualSubtotal,
      totalCumulativeOdc,
      totalCumulativeStaff,
      totalCumulativeCost,
    };
  }, [priorCumulativeOdc, priorCumulativeStaff, actualOdcs, actualStaff]);

  useEffect(() => {
    setValue('actualCost.priorCumulativeTotal', calculatedValues.priorCumulativeTotal);
    setValue('actualCost.actualSubtotal', calculatedValues.actualSubtotal);
    setValue('actualCost.totalCumulativeOdc', calculatedValues.totalCumulativeOdc);
    setValue('actualCost.totalCumulativeStaff', calculatedValues.totalCumulativeStaff);
    setValue('actualCost.totalCumulativeCost', calculatedValues.totalCumulativeCost);
  }, [calculatedValues, setValue]);

  const sections: SectionProps[] = [
    {
      title: "Prior Cumulative Actual Cost",
      control,
      fields: [
        { name: "priorCumulativeOdc", label: "ODCs", readOnly: true, value: priorCumulativeOdc ?? 0 },
        { name: "priorCumulativeStaff", label: "Staff", readOnly: true, value: priorCumulativeStaff ?? 0 },
        { name: "priorCumulativeTotal", label: "Subtotal", readOnly: true, value: calculatedValues.priorCumulativeTotal },
      ],
    },
    {
      title: "Current Month Actual Costs",
      control,
      fields: [
        { name: "actualOdc", label: "ODCs" },
        { name: "actualStaff", label: "Staff" },
        { name: "actualSubtotal", label: "Subtotal", readOnly: true, value: calculatedValues.actualSubtotal },
      ],
    },
    {
      title: "Total Cumulative Actual Cost",
      control,
      fields: [
        { name: "totalCumulativeOdc", label: "ODCs", readOnly: true, value: calculatedValues.totalCumulativeOdc },
        { name: "totalCumulativeStaff", label: "Staff", readOnly: true, value: calculatedValues.totalCumulativeStaff },
        { name: "totalCumulativeCost", label: "Subtotal", readOnly: true, value: calculatedValues.totalCumulativeCost },
      ],
    },
  ];

  return (
    <Grid container spacing={3}>
      {sections.map(section => (
        <Section key={section.title} {...section} />
      ))}
    </Grid>
  );
};

export default ActualCost;
