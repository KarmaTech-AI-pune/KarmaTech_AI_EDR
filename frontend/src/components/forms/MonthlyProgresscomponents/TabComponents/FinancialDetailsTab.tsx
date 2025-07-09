import React from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Control, Controller, useFormContext } from "react-hook-form";
import { Grid, Paper, TextField, Typography, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import textFieldStyle from "../../../../theme/textFieldStyle";
import { formatCurrency } from "../../../../utils/MonthlyProgress/monthlyProgressUtils";

interface FormFieldProps {
  name: keyof MonthlyProgressSchemaType['financialAndContractDetails'];
  label: string;
  control: Control<MonthlyProgressSchemaType>;
  readOnly?: boolean;
  isCurrency?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({ name, label, control, readOnly = false, isCurrency = false }) => {
  const { formState: { errors } } = useFormContext<MonthlyProgressSchemaType>();
  const error = errors.financialAndContractDetails?.[name];

  return (
    <Controller
      name={`financialAndContractDetails.${name}`}
      control={control}
      render={({ field }) => (
        <TextField
          fullWidth
          label={label}
          type="text"
          value={isCurrency ? formatCurrency(Number(field.value ?? 0)) : (field.value ?? '')}
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
    name: keyof MonthlyProgressSchemaType['financialAndContractDetails'];
    label: string;
    readOnly?: boolean;
    isCurrency?: boolean;
  }>;
  control: Control<MonthlyProgressSchemaType>;
}

const Section: React.FC<SectionProps> = ({ title, fields, control }) => (
  <Grid item xs={12} md={4}>
    <Paper elevation={1} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>
      {fields.map(({ name, label, readOnly, isCurrency }) => (
        <FormField
          key={name}
          name={name}
          label={label}
          readOnly={readOnly}
          control={control}
          isCurrency={isCurrency}
        />
      ))}
    </Paper>
  </Grid>
);

const FinancialDetailsTab: React.FC = () => {
  const { control } = useFormContext<MonthlyProgressSchemaType>();

  const sections: SectionProps[] = [
    {
      title: "Fees",
      control,
      fields: [
        { name: "net", label: "Net", readOnly: true, isCurrency: true },
        { name: "serviceTax", label: "Service Tax (%)", readOnly: true },
        { name: "feeTotal", label: "Total", readOnly: true, isCurrency: true },
      ],
    },
    {
      title: "Budget Costs",
      control,
      fields: [
        { name: "budgetOdcs", label: "ODCs", readOnly: true, isCurrency: true },
        { name: "budgetStaff", label: "Staff", readOnly: true, isCurrency: true },
        { name: "BudgetSubTotal", label: "Sub Total", readOnly: true, isCurrency: true },
      ],
    },
  ];

  return (
    <Grid container spacing={3}>
      {sections.map(section => (
        <Section key={section.title} {...section} />
      ))}
      <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">
                    Contract Type
                    </Typography>
                    <Controller
                        name="financialAndContractDetails.contractType"
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value || ''}>
                                <FormControlLabel value="lumpsum" control={<Radio readOnly />} label="Lumpsum" />
                                <FormControlLabel value="timeAndExpense" control={<Radio readOnly />} label="Time & Expense" />
                                <FormControlLabel value="percentage" control={<Radio readOnly />} label="Percentage" />
                            </RadioGroup>
                        )}
                    />
                </Paper>
            </Grid>
    </Grid>
  );
};

export default FinancialDetailsTab;
