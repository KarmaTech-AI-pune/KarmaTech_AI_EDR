import React, { useEffect, useMemo } from "react";
import { Controller, useFormContext, Control } from "react-hook-form";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Grid, Paper, TextField, Typography, Tooltip } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { calculateGrossPercentage } from "../../../../utils/calculations";
import { formatToIndianNumber } from "../../../../utils/numberFormatting";
import { useCurrencyInput } from "../../../../hooks/useCurrencyInput";

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
      render={({ field }) => {
        // Convert null to undefined for useCurrencyInput hook
        const fieldValue = field.value ?? undefined;
        const displayValue = value !== undefined ? value : fieldValue;
        
        // Use currency input hook for editable fields only
        const currencyInput = useCurrencyInput(
          readOnly ? displayValue : fieldValue,
          name
        );

        return (
          <TextField
            fullWidth
            label={label}
            type="text"
            value={readOnly ? formatToIndianNumber(displayValue) : currencyInput.value}
            onChange={readOnly ? undefined : currencyInput.getChangeHandler((rawValue) => {
              field.onChange(rawValue);
            })}
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
        );
      }}
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
  } else if (title === "TCAC") {
    fullTitle = "Total Cumulative Actual Cost";
  }

  return (
    <Grid item xs={12} md={2.4}>
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
  const manpowerPlanning = watch('manpowerPlanning');
  const extraCostTotal = manpowerPlanning?.manpowerTotal?.extraCostTotal || 0;
  
  const totalCumulativeOdcs = watch('actualCost.totalCumulativeOdc') || 0;
  const totalCumulativeStaff = watch('actualCost.totalCumulativeStaff') || 0;
  const ctcODC = watch('ctcAndEac.ctcODC');
  const ctcStaff = watch('ctcAndEac.ctcStaff');
  const actualctcODC = watch('ctcAndEac.actualctcODC');

  const calculatedValues = useMemo(() => {
    const calculatedCtcODC = (budgetOdcs ?? 0) - totalCumulativeOdcs;
    const calculatedCtcStaff = (budgetStaff ?? 0) - totalCumulativeStaff;
    const ctcSubtotal = calculatedCtcODC + calculatedCtcStaff;
    
    // actualCtcStaff = Cost to Complete Staff + Extra Cost Total
    const calculatedActualCtcStaff = calculatedCtcStaff + Number(extraCostTotal);
    const actualCtcSubtotal = (actualctcODC ?? 0) + calculatedActualCtcStaff;
    
    const eacOdc = actualctcODC != null ? (totalCumulativeOdcs + actualctcODC) : (budgetOdcs ?? 0);
    const eacStaff = totalCumulativeStaff + calculatedActualCtcStaff;
    const totalEAC = eacOdc + eacStaff;
    
    const grossProfitPercentage = calculateGrossPercentage(net, totalEAC);

    return {
      calculatedCtcODC,
      calculatedCtcStaff,
      ctcSubtotal,
      calculatedActualCtcStaff,
      actualCtcSubtotal,
      eacOdc,
      eacStaff,
      totalEAC,
      grossProfitPercentage,
    };
  }, [budgetOdcs, budgetStaff, totalCumulativeOdcs, totalCumulativeStaff, actualctcODC, net, extraCostTotal]);

  useEffect(() => {
    setValue('ctcAndEac.ctcODC', calculatedValues.calculatedCtcODC);
    setValue('ctcAndEac.ctcStaff', calculatedValues.calculatedCtcStaff);
    setValue('ctcAndEac.ctcSubtotal', calculatedValues.ctcSubtotal);
    setValue('ctcAndEac.actualCtcStaff', calculatedValues.calculatedActualCtcStaff);
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
      title: "TCAC",
      control,
      fields: [
        { name: "eacOdc", label: "ODCs", readOnly: true, value: watch('actualCost.totalCumulativeOdc') ?? 0 },
        { name: "eacStaff", label: "Staff", readOnly: true, value: watch('actualCost.totalCumulativeStaff') ?? 0 },
        { name: "totalEAC", label: "Subtotal", readOnly: true, value: watch('actualCost.totalCumulativeCost') ?? 0 },
      ],
    },
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
        { name: "actualCtcStaff", label: "Staff", readOnly: true, value: calculatedValues.calculatedActualCtcStaff },
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
    <Grid container spacing={1}>
      {sections.map(section => (
        <Section key={section.title} {...section} />
      ))}
    </Grid>
  );
};

export default CostToCompleteAndEAC;
