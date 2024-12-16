import React, { useState } from 'react';
import { MonthlyReviewModel, ManpowerWorkItem, ChangeOrderItem, ActionItem } from '../../models/monthlyReviewModel';
import {
    Box,
    Tab,
    Tabs,
    Paper,
    TextField,
    Grid,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    CircularProgress,
    Alert,
    Snackbar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    List,
    ListItem,
    Select,
    MenuItem,
    IconButton
} from '@mui/material';
import { InputField } from './MonthlyProgresscomponents/InputField';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

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

const initialManpowerData: ManpowerWorkItem[] = [
    {
        workAssignment: "Topographical Survey",
        assignee: ["Lavisha Surveyor"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Geotechnical Survey",
        assignee: ["Suresh Kumar Wilson"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Hydraulic Modelling",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Draft DDR",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Final DDR",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Draft Tender docs",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma", "Fatima Rahman"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Final Tender docs",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    },
    {
        workAssignment: "Tender Evaluation and Award of work",
        assignee: ["Michael Brown", "Maria Patel", "Vikram Verma"],
        planned: null,
        consumed: null,
        balance: null,
        nextMonthPlanning: null,
        comments: ""
    }
];

const initialFormState: MonthlyReviewModel = {
    fees: {
        net: null,
        serviceTax: null,
        total: null
    },
    budgetCosts: {
        odcs: null,
        staff: null,
        subTotal: null
    },
    contractType: {
        lumpsum: false,
        tAndE: false,
        percentage: null
    },
    actualCosts: {
        odcs: null,
        staff: null,
        subtotal: null
    },
    accruals: null,
    costsToComplete: {
        odcs: null,
        staff: null,
        subtotal: null
    },
    totalEACEstimate: null,
    grossProfitPercentage: null,
    budgetComparison: {
        originalBudget: {
            revenue: null,
            cost: null,
            profit: null
        },
        currentBudget: {
            revenue: null,
            cost: null,
            profit: null
        }
    },
    completion: {
        percentCompleteOnCosts: null,
        percentCompleteOnEV: null
    },
    schedule: {
        dateOfIssueWOLOI: '',
        completionDateAsPerContract: '',
        completionDateAsPerExtension: '',
        expectedCompletionDate: '',
        spi: null
    },
    manpowerPlanning: initialManpowerData,
    changeOrders: {
        proposed: [],
        submitted: [],
        approved: []
    },
    lastMonthActions: [
        {
            description: "Meetings with MCGM for finalization of techniques of execution",
            date: "",
            comments: "",
            priority: undefined
        },
        {
            description: "Site visits with MCGM for slum sanitation schemes",
            date: "",
            comments: "",
            priority: undefined
        },
        {
            description: "Chasing to payment of invoices raised",
            date: "",
            comments: "",
            priority: undefined
        }
    ],
    currentMonthActions: [
        {
            description: "Cost comparison to be submitted to MCGM for various techniques",
            date: "8/10/15",
            comments: "",
            priority: "H"
        },
        {
            description: "Re-doing the final detailed project report and finalization of tenders",
            date: "9/11/15",
            comments: "",
            priority: "H"
        },
        {
            description: "Chasing to payment of invoices raised",
            date: "",
            comments: "",
            priority: "H"
        }
    ]
};

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

    const renderFinancialDetails = () => (
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

    const renderContractAndCosts = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Contract Type</Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.contractType.lumpsum}
                                onChange={(e) => handleInputChange('contractType.lumpsum', e.target.checked)}
                            />
                        }
                        label="Lumpsum"
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.contractType.tAndE}
                                onChange={(e) => handleInputChange('contractType.tAndE', e.target.checked)}
                            />
                        }
                        label="Time & Expense"
                    />
                    <InputField
                        label="Percentage"
                        value={formData.contractType.percentage}
                        onChange={(value) => handleInputChange('contractType.percentage', value)}
                        tooltip="Contract percentage if applicable"
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Actual Costs</Typography>
                    <InputField
                        label="ODCs"
                        value={formData.actualCosts.odcs}
                        onChange={(value) => handleInputChange('actualCosts.odcs', value)}
                        tooltip="Actual Other Direct Costs"
                    />
                    <InputField
                        label="Staff"
                        value={formData.actualCosts.staff}
                        onChange={(value) => handleInputChange('actualCosts.staff', value)}
                        tooltip="Actual staff costs"
                    />
                    <InputField
                        label="Subtotal"
                        value={formData.actualCosts.subtotal != null ? formatCurrency(formData.actualCosts.subtotal) : ''}
                        readOnly
                        tooltip="Automatically calculated actual costs subtotal"
                    />
                </Paper>
            </Grid>
        </Grid>
    );

    const renderSchedule = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Schedule</Typography>
                    <InputField
                        label="Date of issue of WO/LOI"
                        value={formData.schedule.dateOfIssueWOLOI}
                        onChange={(value) => handleInputChange('schedule.dateOfIssueWOLOI', value)}
                        type="date"
                        tooltip="Work Order/Letter of Intent issue date"
                    />
                    <InputField
                        label="Completion Date (Contract)"
                        value={formData.schedule.completionDateAsPerContract}
                        onChange={(value) => handleInputChange('schedule.completionDateAsPerContract', value)}
                        type="date"
                        tooltip="Original completion date as per contract"
                    />
                    <InputField
                        label="Expected Completion Date"
                        value={formData.schedule.expectedCompletionDate}
                        onChange={(value) => handleInputChange('schedule.expectedCompletionDate', value)}
                        type="date"
                        tooltip="Current expected completion date"
                    />
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Completion Status</Typography>
                    <InputField
                        label="% Complete on costs"
                        value={formData.completion.percentCompleteOnCosts}
                        onChange={(value) => handleInputChange('completion.percentCompleteOnCosts', value)}
                        tooltip="Percentage completion based on costs"
                    />
                    <InputField
                        label="% Complete on EV (PPC)"
                        value={formData.completion.percentCompleteOnEV}
                        onChange={(value) => handleInputChange('completion.percentCompleteOnEV', value)}
                        tooltip="Percentage completion based on Earned Value"
                    />
                    <InputField
                        label="SPI"
                        value={formData.schedule.spi}
                        onChange={(value) => handleInputChange('schedule.spi', value)}
                        tooltip="Schedule Performance Index"
                    />
                </Paper>
            </Grid>
        </Grid>
    );

    const renderManpowerPlanning = () => (
        <Paper elevation={1} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Manpower Planned for Remaining Works
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Work Assignment</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Assignee</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Planned</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Consumed</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Balance</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '10%' }}>Next Month's Planning</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Comments</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.manpowerPlanning.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.workAssignment}</TableCell>
                                <TableCell>
                                    <List dense disablePadding>
                                        {row.assignee.map((name, idx) => (
                                            <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                                {name}
                                            </ListItem>
                                        ))}
                                    </List>
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.planned || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                planned: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.consumed || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                consumed: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.balance || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                balance: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        type="number"
                                        size="small"
                                        value={row.nextMonthPlanning || ''}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                nextMonthPlanning: e.target.value === '' ? null : Number(e.target.value)
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={row.comments}
                                        onChange={(e) => {
                                            const newManpowerPlanning = [...formData.manpowerPlanning];
                                            newManpowerPlanning[index] = {
                                                ...newManpowerPlanning[index],
                                                comments: e.target.value
                                            };
                                            handleInputChange('manpowerPlanning', newManpowerPlanning);
                                        }}
                                        multiline
                                        rows={2}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.planned || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.consumed || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.balance || 0), 0)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                {formData.manpowerPlanning.reduce((sum, row) => sum + (row.nextMonthPlanning || 0), 0)}
                            </TableCell>
                            <TableCell />
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );

    const renderChangeOrders = () => {
        const changeOrders = formData.changeOrders || { proposed: [], submitted: [], approved: [] };
        
        return (
            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Change Orders Summary
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Contract Total</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Cost</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Fee</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Summary Details</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>Status</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(['proposed', 'submitted', 'approved'] as const).map((status) => (
                                changeOrders[status]?.map((row, index) => (
                                    <TableRow key={`${status}-${index}`}>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={row.contractTotal || ''}
                                                onChange={(e) => {
                                                    const newChangeOrders = { ...changeOrders };
                                                    if (!newChangeOrders[status]) {
                                                        newChangeOrders[status] = [];
                                                    }
                                                    newChangeOrders[status][index] = {
                                                        ...row,
                                                        contractTotal: e.target.value === '' ? null : Number(e.target.value)
                                                    };
                                                    handleInputChange('changeOrders', newChangeOrders);
                                                }}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={row.cost || ''}
                                                onChange={(e) => {
                                                    const newChangeOrders = { ...changeOrders };
                                                    if (!newChangeOrders[status]) {
                                                        newChangeOrders[status] = [];
                                                    }
                                                    newChangeOrders[status][index] = {
                                                        ...row,
                                                        cost: e.target.value === '' ? null : Number(e.target.value)
                                                    };
                                                    handleInputChange('changeOrders', newChangeOrders);
                                                }}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={row.fee || ''}
                                                onChange={(e) => {
                                                    const newChangeOrders = { ...changeOrders };
                                                    if (!newChangeOrders[status]) {
                                                        newChangeOrders[status] = [];
                                                    }
                                                    newChangeOrders[status][index] = {
                                                        ...row,
                                                        fee: e.target.value === '' ? null : Number(e.target.value)
                                                    };
                                                    handleInputChange('changeOrders', newChangeOrders);
                                                }}
                                                fullWidth
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={row.summaryDetails}
                                                onChange={(e) => {
                                                    const newChangeOrders = { ...changeOrders };
                                                    if (!newChangeOrders[status]) {
                                                        newChangeOrders[status] = [];
                                                    }
                                                    newChangeOrders[status][index] = {
                                                        ...row,
                                                        summaryDetails: e.target.value
                                                    };
                                                    handleInputChange('changeOrders', newChangeOrders);
                                                }}
                                                fullWidth
                                                multiline
                                                rows={2}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                size="small"
                                                value={row.status}
                                                onChange={(e) => {
                                                    const newStatus = e.target.value as 'Proposed' | 'Submitted' | 'Approved';
                                                    const newChangeOrders = { ...changeOrders };
                                                    
                                                    // Ensure arrays exist
                                                    if (!newChangeOrders[status]) newChangeOrders[status] = [];
                                                    if (!newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders]) {
                                                        newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders] = [];
                                                    }
                                                    
                                                    // Remove from current status array
                                                    newChangeOrders[status] = 
                                                        newChangeOrders[status].filter((_, i) => i !== index);
                                                    
                                                    // Add to new status array
                                                    newChangeOrders[newStatus.toLowerCase() as keyof typeof newChangeOrders].push({
                                                        ...row,
                                                        status: newStatus
                                                    });
                                                    
                                                    handleInputChange('changeOrders', newChangeOrders);
                                                }}
                                                fullWidth
                                            >
                                                <MenuItem value="Proposed">Proposed</MenuItem>
                                                <MenuItem value="Submitted">Submitted</MenuItem>
                                                <MenuItem value="Approved">Approved</MenuItem>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="outlined"
                    onClick={() => {
                        const newChangeOrders = { ...changeOrders };
                        if (!newChangeOrders.proposed) {
                            newChangeOrders.proposed = [];
                        }
                        newChangeOrders.proposed.push({
                            contractTotal: null,
                            cost: null,
                            fee: null,
                            summaryDetails: '',
                            status: 'Proposed'
                        });
                        handleInputChange('changeOrders', newChangeOrders);
                    }}
                    sx={{ mt: 2 }}
                >
                    Add Change Order
                </Button>
            </Paper>
        );
    };

    const renderActions = () => (
        <>
            <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Actions from last month
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell width={50}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formData.lastMonthActions.map((action, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.description}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    description: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={action.date}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    date: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.comments}
                                            onChange={(e) => {
                                                const newActions = [...formData.lastMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    comments: e.target.value
                                                };
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                const newActions = formData.lastMonthActions.filter((_, i) => i !== index);
                                                handleInputChange('lastMonthActions', newActions);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        const newActions = [...formData.lastMonthActions];
                        newActions.push({
                            description: '',
                            date: '',
                            comments: '',
                            priority: undefined
                        });
                        handleInputChange('lastMonthActions', newActions);
                    }}
                    sx={{ mt: 2 }}
                >
                    Add Action
                </Button>
            </Paper>

            <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Actions and Priorities for this month
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Comments</TableCell>
                                <TableCell>H/M/L</TableCell>
                                <TableCell width={50}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {formData.currentMonthActions.map((action, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.description}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    description: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="date"
                                            size="small"
                                            value={action.date}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    date: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={action.comments}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    comments: e.target.value
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            size="small"
                                            value={action.priority || ''}
                                            onChange={(e) => {
                                                const newActions = [...formData.currentMonthActions];
                                                newActions[index] = {
                                                    ...newActions[index],
                                                    priority: e.target.value as 'H' | 'M' | 'L'
                                                };
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                            fullWidth
                                        >
                                            <MenuItem value="H">H</MenuItem>
                                            <MenuItem value="M">M</MenuItem>
                                            <MenuItem value="L">L</MenuItem>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                const newActions = formData.currentMonthActions.filter((_, i) => i !== index);
                                                handleInputChange('currentMonthActions', newActions);
                                            }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        const newActions = [...formData.currentMonthActions];
                        newActions.push({
                            description: '',
                            date: '',
                            comments: '',
                            priority: 'M'
                        });
                        handleInputChange('currentMonthActions', newActions);
                    }}
                    sx={{ mt: 2 }}
                >
                    Add Action
                </Button>
            </Paper>
        </>
    );

    return (
        <Box sx={{ maxWidth: 1200, margin: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                    Monthly Progress Review
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                        <Tab label="Financial Details" />
                        <Tab label="Contract & Costs" />
                        <Tab label="Budget & Schedule" />
                        <Tab label="Manpower Planning" />
                        <Tab label="Change Orders" />
                        <Tab label="Actions" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    {renderFinancialDetails()}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {renderContractAndCosts()}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    {renderSchedule()}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    {renderManpowerPlanning()}
                </TabPanel>

                <TabPanel value={tabValue} index={4}>
                    {renderChangeOrders()}
                </TabPanel>

                <TabPanel value={tabValue} index={5}>
                    {renderActions()}
                </TabPanel>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setTabValue(Math.max(0, tabValue - 1))}
                        disabled={tabValue === 0}
                    >
                        Previous
                    </Button>
                    {tabValue < 5 ? (
                        <Button
                            variant="contained"
                            onClick={() => setTabValue(Math.min(5, tabValue + 1))}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
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
                <Alert severity="success" variant="filled">
                    Review saved successfully!
                </Alert>
            </Snackbar>
        </Box>
    );
};
