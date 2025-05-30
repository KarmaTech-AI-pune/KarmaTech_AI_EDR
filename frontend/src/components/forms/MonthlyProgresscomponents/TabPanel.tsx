import React, { memo } from 'react';
import { Box } from '@mui/material';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export const TabPanel = memo<TabPanelProps>(({ children, value, index }) => (
    <div
        role="tabpanel"
        hidden={value !== index}
        id={`tabpanel-${index}`}
        aria-labelledby={`tab-${index}`}
    >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
));

TabPanel.displayName = 'TabPanel';
