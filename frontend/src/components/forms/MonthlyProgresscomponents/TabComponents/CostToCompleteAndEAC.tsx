import React, { useEffect, useMemo } from "react";
import { Controller, useFormContext, Control } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography, Tooltip } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { calculateGrossPercentage } from "../../../../utils/calculations";

interface FormFieldProps {
  name: keyof MonthlyProgressSchemaType['ctcAndEac'];
  label: string;
  control: Control<MonthlyProgressSchemaType>;
  readOnly?: boolean;
  value?: number;
  defaultValue?: number;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, control, readOnly = false, value, defaultValue }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const error = errors.ctcAndEac?.[name];

  return (
    <Controller
      name={`ctcAndEac.${name}`}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <TextField
          fullWidth
          label={label}
          type="number"
          value={value !== undefined ? value : field.value}
          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          error={!!error}
          helperText={error?.message}
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
    name: keyof MonthlyProgressSchemaType['ctcAndEac'];
    label: string;
    readOnly?: boolean;
    value?: number;
    defaultValue?: number;
  }>;
  control: Control<MonthlyProgressSchemaType>;
}

const Section: React.FC<SectionProps> = ({ title, fields, control }) => {
  let fullTitle = title;
  if (title === "CTC") {
    fullTitle = "Cost to Complete";
  } else if (title === "ACTC") {
    fullTitle = "Actual Cost To Complete";
  } else if (title === "EAC") {
    fullTitle = "Estimated Actual Cost";
  }

  return (
    <Grid item xs={12} md={3}>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Tooltip title={fullTitle} arrow>
          <Typography variant="h6" gutterBottom color="primary">
            {title}
          </Typography>
        </Tooltip>
        {fields.map(field => (
          <FormField key={field.name} {...field} control={control} />
        ))}
      </Paper>
    </Grid>
  );
};

const CostToCompleteAndEAC: React.FC = () => {
  const { control, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

  const net = watch('financialAndContractDetails.net') || 0;
  const budgetOdcs = watch('financialAndContractDetails.budgetOdcs');
  const budgetStaff = watch('financialAndContractDetails.budgetStaff');
  
  const totalCumulativeOdcs = watch('actualCost.totalCumulativeOdc') || 0;
  const totalCumulativeStaff = watch('actualCost.totalCumulativeStaff') || 0;
  const actualSubtotal = watch('actualCost.actualSubtotal') || 0;

  const ctcODC = watch('ctcAndEac.ctcODC');
  const ctcStaff = watch('ctcAndEac.ctcStaff');
  const actualctcODC = watch('ctcAndEac.actualctcODC');
  const actualCtcStaff = watch('ctcAndEac.actualCtcStaff');

  const calculatedValues = useMemo(() => {
    const calculatedCtcODC = (budgetOdcs ?? 0) - totalCumulativeOdcs;
    const calculatedCtcStaff = (budgetStaff ?? 0) - totalCumulativeStaff;
    const ctcSubtotal = calculatedCtcODC + calculatedCtcStaff;
    
    const actualCtcSubtotal = (actualctcODC ?? 0) + (actualCtcStaff ?? 0);
    
    const useActualCtc = actualctcODC != null || actualCtcStaff != null;

    const eacOdc = totalCumulativeOdcs + (useActualCtc ? (actualctcODC ?? 0) : calculatedCtcODC);
    const eacStaff = totalCumulativeStaff + (useActualCtc ? (actualCtcStaff ?? 0) : calculatedCtcStaff);
    const totalEAC = eacOdc + eacStaff;
    
    const grossProfitPercentage = calculateGrossPercentage(net, totalEAC);

    return {
      calculatedCtcODC,
      calculatedCtcStaff,
      ctcSubtotal,
      actualCtcSubtotal,
      eacOdc,
      eacStaff,
      totalEAC,
      grossProfitPercentage,
    };
  }, [budgetOdcs, budgetStaff, totalCumulativeOdcs, totalCumulativeStaff, actualctcODC, actualCtcStaff, actualSubtotal, net]);

  useEffect(() => {
    setValue('ctcAndEac.ctcODC', calculatedValues.calculatedCtcODC);
    setValue('ctcAndEac.ctcStaff', calculatedValues.calculatedCtcStaff);
    setValue('ctcAndEac.ctcSubtotal', calculatedValues.ctcSubtotal);
    setValue('ctcAndEac.actualCtcSubtotal', calculatedValues.actualCtcSubtotal);
    setValue('ctcAndEac.eacOdc', calculatedValues.eacOdc);
    setValue('ctcAndEac.eacStaff', calculatedValues.eacStaff);
    setValue('ctcAndEac.totalEAC', calculatedValues.totalEAC);
    setValue('ctcAndEac.grossProfitPercentage', calculatedValues.grossProfitPercentage);
    setValue('budgetTable.currentBudgetInMIS.profitPercentage', calculatedValues.grossProfitPercentage);
    setValue('budgetTable.currentBudgetInMIS.cost', calculatedValues.totalEAC);
  }, [calculatedValues, setValue]);

  const sections: SectionProps[] = [
    {
      title: "CTC",
      control,
      fields: [
        { name: "ctcODC", label: "ODCs", readOnly: true, value: ctcODC ?? 0 },
        { name: "ctcStaff", label: "Staff", readOnly: true, value: ctcStaff ?? 0 },
        { name: "ctcSubtotal", label: "Subtotal", readOnly: true, value: calculatedValues.ctcSubtotal },
      ],
    },
    {
      title: "ACTC",
      control,
      fields: [
        { name: "actualctcODC", label: "ODCs"},
        { name: "actualCtcStaff", label: "Staff"},
        { name: "actualCtcSubtotal", label: "Subtotal", readOnly: true, value: calculatedValues.actualCtcSubtotal },
      ],
    },
    {
      title: "EAC",
      control,
      fields: [
        { name: "eacOdc", label: "ODCs", readOnly: true, value: calculatedValues.eacOdc ?? 0},
        { name: "eacStaff", label: "Staff", readOnly: true, value: calculatedValues.eacStaff ?? 0 },
        { name: "totalEAC", label: "Total EAC", readOnly: true, value: calculatedValues.totalEAC },
      ],
    },
    {
      title: "Gross Profit",
      control,
      fields: [
        { name: "grossProfitPercentage", label: "Gross Profit %", readOnly: true, value: calculatedValues.grossProfitPercentage ?? 0 },
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

export default CostToCompleteAndEAC;
