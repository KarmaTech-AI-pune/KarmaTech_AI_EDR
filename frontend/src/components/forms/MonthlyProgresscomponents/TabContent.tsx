import { memo, useMemo } from 'react';
import { Box } from '@mui/material';
import { MonthlyReviewModel } from '../../../models/monthlyReviewModel';
import { 
    ActionsTab, 
    BudgetAndScheduleTab, 
    ChangeOrdersTab, 
    ContractAndCostsTab, 
    FinancialDetailsTab, 
    ManpowerPlanningTab,
    ProgressReviewDeliverables
} from '../MonthlyProgresscomponents';
import { TabPanel } from '../MonthlyProgresscomponents/TabPanel';

interface TabContentProps {
    tabValue: number;
    formData: MonthlyReviewModel;
    handleInputChange: (path: string, value: any) => void;
    formatCurrency: (value: number | null) => string;
}

export const TabContent = memo<TabContentProps>(({ 
    tabValue, 
    formData, 
    handleInputChange, 
    formatCurrency 
}) => {
    const tabComponents = useMemo(() => [
        <FinancialDetailsTab 
            key="financial"
            formData={formData}
            handleInputChange={handleInputChange}
            formatCurrency={formatCurrency}
        />,
        <ContractAndCostsTab 
            key="contract"
            formData={formData}
            handleInputChange={handleInputChange}
            formatCurrency={formatCurrency}
        />,
        <BudgetAndScheduleTab 
            key="budget"
            formData={formData}
            handleInputChange={handleInputChange}
        />,
        <ManpowerPlanningTab 
            key="manpower"
            formData={formData}
            handleInputChange={handleInputChange}
        />,
        <ProgressReviewDeliverables 
            key="deliverables"
            formData={formData}
            handleInputChange={handleInputChange}
        />,
        <ChangeOrdersTab 
            key="change-orders"
            formData={formData}
            handleInputChange={handleInputChange}
        />,
        <ActionsTab 
            key="actions"
            formData={formData}
            handleInputChange={handleInputChange}
        />
    ], [formData, handleInputChange, formatCurrency]);

    return (
        <Box sx={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            overflow: 'hidden',
            mb: 3
        }}>
            {tabComponents.map((component, index) => (
                <TabPanel key={index} value={tabValue} index={index}>
                    {component}
                </TabPanel>
            ))}
        </Box>
    );
});

TabContent.displayName = 'TabContent';
