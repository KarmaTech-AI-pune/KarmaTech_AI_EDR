import React, { useEffect } from "react";
import { MonthlyProgressSchemaType } from "../../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, Paper, TextField, Typography, FormControlLabel, Checkbox, Box } from "@mui/material";
import { formatCurrency } from "../../../../utils/MonthlyProgress/monthlyProgressUtils";

const FinancialDetailsTab: React.FC = () => {
    const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

    // Watch for calculation fields
    const net = watch("financialAndContractDetails.net");
    const serviceTax = watch("financialAndContractDetails.serviceTax");
    const odcs = watch("financialAndContractDetails.budgetOdcs");
    const staff = watch("financialAndContractDetails.budgetStaff");
    const contractType = watch("financialAndContractDetails.contractType");

    // Auto-calculate totals
    useEffect(() => {
        if (net != null && serviceTax != null) {
            const feeTotal = net + (net * serviceTax / 100);
            setValue("financialAndContractDetails.feeTotal", feeTotal);
        }
    }, [net, serviceTax, setValue]);

    useEffect(() => {
        if (odcs != null && staff != null) {
            const budgetSubTotal = odcs + staff;
            setValue("financialAndContractDetails.BudgetSubTotal", budgetSubTotal);
        }
    }, [odcs, staff, setValue]);


    return (
        <Grid container spacing={3}>
            
            <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Fees</Typography>
                    <Controller
                        name="financialAndContractDetails.net"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Net"
                                    type="text"
                                    {...field}
                                    error={!!errors.financialAndContractDetails?.net}
                                    helperText={errors.financialAndContractDetails?.net?.message || ''}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.serviceTax"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Service Tax (%)"
                                    error={!!errors.financialAndContractDetails?.serviceTax}
                                    helperText={errors.financialAndContractDetails?.serviceTax?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.feeTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Total"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.feeTotal}
                                    helperText={errors.financialAndContractDetails?.feeTotal?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Budget Costs</Typography>
                    <Controller
                        name="financialAndContractDetails.budgetOdcs"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="ODCs"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.budgetOdcs}
                                    helperText={errors.financialAndContractDetails?.budgetOdcs?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.budgetStaff"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Staff"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.budgetStaff}
                                    helperText={errors.financialAndContractDetails?.budgetStaff?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="financialAndContractDetails.BudgetSubTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Sub Total"
                                    type="text"
                                    error={!!errors.financialAndContractDetails?.BudgetSubTotal}
                                    helperText={errors.financialAndContractDetails?.BudgetSubTotal?.message || ''}
                                    {...field}
                                    value={field.value != null ? formatCurrency(field.value) : ''}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Contract Type
                      </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractType === 'lumpsum'}
                    onChange={() => {
                      setValue('financialAndContractDetails.contractType', 'lumpsum');
                    }}
                    sx={{
                      '&.Mui-checked': {
                        color: '#1869DA'
                      }
                    }}
                  />
                }
                label="Lumpsum"
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractType === 'timeAndExpense'}
                    onChange={() => {
                      setValue('financialAndContractDetails.contractType', 'timeAndExpense');
                    }}
                    sx={{
                      '&.Mui-checked': {
                        color: '#1869DA'
                      }
                    }}
                  />
                }
                label="Time & Expense"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={contractType === 'percentage'}
                    onChange={() => {
                      setValue('financialAndContractDetails.contractType', 'percentage');
                    }}
                    sx={{
                      '&.Mui-checked': {
                        color: '#1869DA'
                      }
                    }}
                  />
                }
                label="Percentage"
              />
            </Box>
            
                    </Paper>
            </Grid>
        </Grid>
    );
};

export default FinancialDetailsTab;
