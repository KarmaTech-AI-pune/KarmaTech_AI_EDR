import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Tab,
    Tabs,
    Paper,
    Typography,
    Container,
    Alert,
    Snackbar
} from '@mui/material';
import { FormWrapper } from '../FormWrapper';
// import { TabContent, NavigationButtons } from './components';
import { TabContent } from './TabContent';
import { NavigationButtons } from './NavigationButtons';
import { useFormState } from '../../../hooks/MontlyProgress/useFormState';
import { getCurrentMonthYear, formatCurrency } from '../../../utils/MonthlyProgress/monthlyProgressUtils';

// Constants
const TABS = [
    { id: 0, label: 'Financial Details' },
    { id: 1, label: 'Contract & Costs' },
    { id: 2, label: 'Budget & Schedule' },
    { id: 3, label: 'Manpower Planning' },
    { id: 4, label: 'Progress Review Deliverables' },
    { id: 5, label: 'Change Orders' },
    { id: 6, label: 'Actions' }
] as const;

const SAVE_DELAY = 1000;
const SNACKBAR_DURATION = 3000;

// Main component
export const MonthlyProgressForm: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const { data: formData, isLoading, showSuccess, updateFormData, setLoading, setShowSuccess } = useFormState();

    // Use ref to prevent re-creating the date string on every render
    const currentMonthYear = useRef(getCurrentMonthYear()).current;

    // Memoized handlers
    const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    }, []);

    const handlePrevious = useCallback(() => {
        setTabValue(prev => Math.max(0, prev - 1));
    }, []);

    const handleNext = useCallback(() => {
        setTabValue(prev => Math.min(TABS.length - 1, prev + 1));
    }, []);

    const handleSave = useCallback(async () => {
        setLoading(true);
        try {
            // Simulate API call - replace with actual API call
            await new Promise(resolve => setTimeout(resolve, SAVE_DELAY));
            setShowSuccess(true);
        } catch (error) {
            console.error('Error saving form:', error);
            // Add error handling here
        } finally {
            setLoading(false);
        }
    }, [setLoading, setShowSuccess]);

    const handleSnackbarClose = useCallback(() => {
        setShowSuccess(false);
    }, [setShowSuccess]);

    // Memoized styles
    const tabsStyles = useMemo(() => ({
        '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            color: '#666',
            minWidth: 120,
            '&.Mui-selected': {
                color: '#1976d2'
            }
        },
        '& .MuiTabs-indicator': {
            backgroundColor: '#1976d2'
        }
    }), []);

    const containerStyles = useMemo(() => ({
        width: '100%',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
    }), []);

    return (
        <FormWrapper>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={containerStyles}>
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
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={tabsStyles}
                            >
                                {TABS.map(tab => (
                                    <Tab
                                        key={tab.id}
                                        label={tab.label}
                                        id={`tab-${tab.id}`}
                                        aria-controls={`tabpanel-${tab.id}`}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        <TabContent
                            tabValue={tabValue}
                            formData={formData}
                            handleInputChange={updateFormData}
                            formatCurrency={formatCurrency}
                        />

                        <NavigationButtons
                            tabValue={tabValue}
                            isLoading={isLoading}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onSave={handleSave}
                        />
                    </Paper>

                    <Snackbar
                        open={showSuccess}
                        autoHideDuration={SNACKBAR_DURATION}
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    >
                        <Alert
                            severity="success"
                            variant="filled"
                            sx={{ backgroundColor: '#1976d2' }}
                        >
                            Review saved successfully!
                        </Alert>
                    </Snackbar>
                </Box>
            </Container>
        </FormWrapper>
    );
};