import React from "react";
import { MonthlyProgressSchemaType } from "../../../schemas/monthlyProgress/MonthlyProgressSchema";
import { Controller, useFormContext } from "react-hook-form";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import { formatCurrency } from "../../../utils/MonthlyProgress/monthlyProgressUtils";

const FinancialDetailsTab: React.FC = () => {
    const { control, formState: { errors }, watch, setValue } = useFormContext<MonthlyProgressSchemaType>();

    // Watch for calculation fields
    const net = watch("net");
    const serviceTax = watch("serviceTax");
    const odcs = watch("budgetOdcs");
    const staff = watch("budgetStaff");

    // Auto-calculate totals
    React.useEffect(() => {
        if (net != null && serviceTax != null) {
            const feeTotal = net + (net * serviceTax / 100);
            setValue("feeTotal", feeTotal);
        }
    }, [net, serviceTax, setValue]);

    React.useEffect(() => {
        if (odcs != null && staff != null) {
            const budgetSubTotal = odcs + staff;
            setValue("BudgetSubTotal", budgetSubTotal);
        }
    }, [odcs, staff, setValue]);


    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Fees</Typography>
                    <Controller
                        name="net"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Net"
                                    type="text"
                                    {...field}
                                    error={!!errors.net}
                                    helperText={errors.net?.message || ''}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="serviceTax"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Service Tax (%)"
                                    error={!!errors.serviceTax}
                                    helperText={errors.serviceTax?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    slotProps={{
                                        htmlInput: { min: 0, max: 100, step: 0.01 }
                                    }}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="feeTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Total"
                                    type="text"
                                    error={!!errors.feeTotal}
                                    helperText={errors.feeTotal?.message || ''}
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

            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom color="primary">Budget Costs</Typography>
                    <Controller
                        name="budgetOdcs"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="ODCs"
                                    type="text"
                                    error={!!errors.budgetOdcs}
                                    helperText={errors.budgetOdcs?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="budgetStaff"
                        control={control}
                        render={({ field }) => (
                        
                                <TextField
                                    fullWidth
                                    label="Staff"
                                    type="text"
                                    error={!!errors.budgetStaff}
                                    helperText={errors.budgetStaff?.message || ''}
                                    {...field}
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                    sx={{ mb: 2 }}
                                />
                        )}
                    />
                    <Controller
                        name="BudgetSubTotal"
                        control={control}
                        render={({ field }) => (
                                <TextField
                                    fullWidth
                                    label="Sub Total"
                                    type="text"
                                    error={!!errors.BudgetSubTotal}
                                    helperText={errors.BudgetSubTotal?.message || ''}
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
        </Grid>
    );
};

export default FinancialDetailsTab;
