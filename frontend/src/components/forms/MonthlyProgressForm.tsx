import React, { useState } from 'react';
import {
    Box,
    Tab,
    Tabs,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Container
} from '@mui/material';
import { MonthlyReviewModel,initialFormState } from '../../models/monthlyReviewModel';
import { ActionsTab, BudgetAndScheduleTab, ChangeOrdersTab, ContractAndCostsTab, FinancialDetailsTab, ManpowerPlanningTab } from './MonthlyProgresscomponents';
import { FormWrapper } from './FormWrapper';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
);

const formatCurrency = (value: number | null) => {
    if (value == null) return '';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const calculateTotals = (data: MonthlyReviewModel): MonthlyReviewModel => {
    const newData = { ...data };

    // Calculate fees total
    const net = newData.fees.net || 0;
    const tax = newData.fees.serviceTax || 0;
    newData.fees.total = net + (net * tax / 100);

    // Calculate budget costs subtotal
    const budgetOdcs = newData.budgetCosts.odcs || 0;
    const budgetStaff = newData.budgetCosts.staff || 0;
    newData.budgetCosts.subTotal = budgetOdcs + budgetStaff;

    // Calculate actual costs subtotal
    const actualOdcs = newData.actualCosts.odcs || 0;
    const actualStaff = newData.actualCosts.staff || 0;
    newData.actualCosts.subtotal = actualOdcs + actualStaff;

    // Calculate costs to complete subtotal
    const ctcOdcs = newData.costsToComplete.odcs || 0;
    const ctcStaff = newData.costsToComplete.staff || 0;
    newData.costsToComplete.subtotal = ctcOdcs + ctcStaff;

    // Calculate total EAC estimate
    newData.totalEACEstimate = newData.actualCosts.subtotal + newData.costsToComplete.subtotal;

    // Calculate gross profit percentage
    if (newData.fees.total > 0) {
        newData.grossProfitPercentage = ((newData.fees.total - newData.totalEACEstimate) / newData.fees.total) * 100;
    }

    return newData;
};

export const MonthlyProgressForm: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState<MonthlyReviewModel>({
        ...initialFormState,
        changeOrders: {
            proposed: [],
            submitted: [],
            approved: []
        },
        lastMonthActions: [...initialFormState.lastMonthActions],
        currentMonthActions: [...initialFormState.currentMonthActions]
    });

    const date = new Date();
    const currentMonthYear = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    const handleInputChange = (path: string, value: any) => {
        setFormData(prevData => {
            const newData = { ...prevData };
            const pathArray = path.split('.');
            let current: any = newData;
            
            // Set the value at the specified path
            for (let i = 0; i < pathArray.length - 1; i++) {
                current = current[pathArray[i]];
            }
            current[pathArray[pathArray.length - 1]] = value;

            // Calculate all totals
            return calculateTotals(newData);
        });
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setShowSuccess(true);
        } catch (error) {
            console.error('Error saving form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formContent = (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            <Box sx={{ 
                width: '100%', 
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                overflowX: 'hidden',
                pr: 1,
                pb: 4
            }}>
                <Paper 
                    elevation={0}
                    sx={{ 
                        p: 3,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                    }}
                >
                    <Typography 
                        variant="h5" 
                        gutterBottom 
                        sx={{ 
                            color: '#1976d2', 
                            fontWeight: 500,
                            mb: 3
                        }}
                    >
                        PMD7. Monthly Progress Review - {currentMonthYear}
                    </Typography>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs 
                            value={tabValue} 
                            onChange={(_, newValue) => setTabValue(newValue)}
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    color: '#666',
                                    '&.Mui-selected': {
                                        color: '#1976d2'
                                    }
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#1976d2'
                                }
                            }}
                        >
                            <Tab label="Financial Details" />
                            <Tab label="Contract & Costs" />
                            <Tab label="Budget & Schedule" />
                            <Tab label="Manpower Planning" />
                            <Tab label="Change Orders" />
                            <Tab label="Actions" />
                        </Tabs>
                    </Box>

                    <Box sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        mb: 3
                    }}>
                        <TabPanel value={tabValue} index={0}>
                            <FinancialDetailsTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                                formatCurrency={formatCurrency}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={1}>
                            <ContractAndCostsTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                                formatCurrency={formatCurrency}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={2}>
                            <BudgetAndScheduleTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={3}>
                            <ManpowerPlanningTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={4}>
                            <ChangeOrdersTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                        </TabPanel>

                        <TabPanel value={tabValue} index={5}>
                            <ActionsTab 
                                formData={formData}
                                handleInputChange={handleInputChange}
                            />
                        </TabPanel>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={() => setTabValue(Math.max(0, tabValue - 1))}
                            disabled={tabValue === 0}
                            sx={{
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                '&:hover': {
                                    borderColor: '#1565c0',
                                    backgroundColor: 'rgba(25, 118, 210, 0.04)'
                                }
                            }}
                        >
                            Previous
                        </Button>
                        {tabValue < 5 ? (
                            <Button
                                variant="contained"
                                onClick={() => setTabValue(Math.min(5, tabValue + 1))}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    '&:hover': {
                                        backgroundColor: '#1565c0'
                                    }
                                }}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={isLoading}
                                startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                                sx={{
                                    backgroundColor: '#1976d2',
                                    '&:hover': {
                                        backgroundColor: '#1565c0'
                                    }
                                }}
                            >
                                {isLoading ? 'Saving...' : 'Save Review'}
                            </Button>
                        )}
                    </Box>
                </Paper>

                <Snackbar
                    open={showSuccess}
                    autoHideDuration={3000}
                    onClose={() => setShowSuccess(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert 
                        severity="success" 
                        variant="filled"
                        sx={{
                            backgroundColor: '#1976d2'
                        }}
                    >
                        Review saved successfully!
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );

    return (
        <FormWrapper>
            {formContent}
        </FormWrapper>
    );
};
