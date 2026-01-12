import React, { useEffect, useMemo } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext, Control } from "react-hook-form";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { formatToIndianNumber } from "../../../../utils/numberFormatting";

interface FormFieldProps {
  name: keyof MonthlyProgressSchemaType['actualCost'];
  label: string;
  control: Control<MonthlyProgressSchemaType>;
  readOnly?: boolean;
  value?: number;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, control, readOnly = false, value }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const error = errors.actualCost?.[name];

  return (
    <Controller
      name={`actualCost.${name}`}
      control={control}
      render={({ field }) => (
        <TextField
          fullWidth
          label={label}
          value={formatToIndianNumber(value !== undefined ? value : field.value)}
          onChange={(e) => {
            const val = e.target.value.replace(/,/g, '');
            field.onChange(val ? Number(val) : null);
          }}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          error={!!error}
          helperText={error?.message || ''}
          margin="normal"
          InputProps={{
            readOnly,
          }}
          sx={{
            ...textFieldStyle,
            '& .MuiOutlinedInput-root': {
              backgroundColor: readOnly ? '#f5f5f5' : 'inherit',
            },
          }}
        />
      )}
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
