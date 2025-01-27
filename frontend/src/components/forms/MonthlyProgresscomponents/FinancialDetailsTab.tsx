import React from 'react';
import {
    Grid,
    Paper,
    Typography
} from '@mui/material';
import { InputField } from './InputField';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';

interface FinancialDetailsTabProps {
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
    formatCurrency: (value: number | null) => string;
}

export const FinancialDetailsTab: React.FC<FinancialDetailsTabProps> = ({
    formData,
    handleInputChange,
    formatCurrency
}) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Fees</Typography>
                    <InputField
                        label="Net"
                        value={formData.fees.net}
                        onChange={(value) => handleInputChange('fees.net', value)}
                        tooltip="Net fee amount before tax"
                    />
                    <InputField
                        label="Service Tax (%)"
                        value={formData.fees.serviceTax}
                        onChange={(value) => handleInputChange('fees.serviceTax', value)}
                        tooltip="Applicable service tax percentage"
                    />
                    <InputField
                        label="Total"
                        value={formData.fees.total != null ? formatCurrency(formData.fees.total) : ''}
                        readOnly
                        tooltip="Automatically calculated total including tax"
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Budget Costs</Typography>
                    <InputField
                        label="ODCs"
                        value={formData.budgetCosts.odcs}
                        onChange={(value) => handleInputChange('budgetCosts.odcs', value)}
                        tooltip="Other Direct Costs"
                    />
                    <InputField
                        label="Staff"
                        value={formData.budgetCosts.staff}
                        onChange={(value) => handleInputChange('budgetCosts.staff', value)}
                        tooltip="Staff-related costs"
                    />
                    <InputField
                        label="Sub Total"
                        value={formData.budgetCosts.subTotal != null ? formatCurrency(formData.budgetCosts.subTotal) : ''}
                        readOnly
                        tooltip="Automatically calculated subtotal"
                    />
                </Paper>
            </Grid>
        </Grid>
    );
};
