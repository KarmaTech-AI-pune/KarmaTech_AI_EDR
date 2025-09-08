import React, { useState, useCallback } from 'react';
import { Container, Grid, Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Components
import DashboardHeader from './DashboardHeader';
import MetricsGrid from './MetricsGrid';
import PriorityProjectsPanel from './PriorityProjectsPanel';
import CashflowChart from './CashflowChart';
import RegionalPortfolio from './RegionalPortfolio';
import NPVProfitability from './NPVProfitability';
import PendingApprovals from './PendingApprovals';
import TaskPriorityMatrix from './TaskPriorityMatrix';
import MilestoneBillingTracker from './MilestoneBillingTracker';

// Data
import { priorityProjects } from '../../data/mockData/projects';
import { financialMetrics, cashflowData } from '../../data/mockData/financial';
import { aiSuggestions, pendingApprovals, milestoneData, taskItems } from '../../data/mockData/approvals';
import { regionalProjects } from '../../data/mockData/regional';
import { DashboardFilters } from '../../data/types/dashboard';

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [filters, setFilters] = useState<DashboardFilters>({
    selectedRegion: 'All',
    timeframe: 'quarter'
  });

  const handleFiltersChange = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const handleNotificationsClick = useCallback(() => {
    console.log('Notifications clicked');
    // Implement notifications logic here
  }, []);

  const handleViewActionPlan = useCallback((projectId: string) => {
    console.log('View action plan for project:', projectId);
    // Implement action plan navigation here
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        py: isMobile ? 2 : 3
      }}
    >
      <Container 
        maxWidth="xl" 
        // sx={{ 
        //   px: isMobile ? 2 : 3,
        //   '&.MuiContainer-root': {
        //     paddingLeft: isMobile ? 16 : 24,
        //     paddingRight: isMobile ? 16 : 24
        //   }
        // }}
      >
        {/* Header */}
        <DashboardHeader
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onNotificationsClick={handleNotificationsClick}
        />

        {/* Executive Summary Metrics */}
        <MetricsGrid metrics={financialMetrics} />

        {/* Main Dashboard Grid */}
        <Grid spacing={3}>
          {/* Left Column - Priority Projects */}
          <Grid item xs={12} lg={4}>
            <PriorityProjectsPanel
              projects={priorityProjects}
              suggestions={aiSuggestions}
              onViewActionPlan={handleViewActionPlan}
            />
          </Grid>

          {/* Right Column - Financial Analysis */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Cashflow Chart - Full Width */}
              <Grid item xs={12}>
                <CashflowChart data={cashflowData} />
              </Grid>

              {/* Regional Portfolio */}
              <Grid item xs={12} md={6}>
                <RegionalPortfolio data={regionalProjects} />
              </Grid>

              {/* NPV & Profitability */}
              <Grid item xs={12} md={6}>
                <NPVProfitability metrics={financialMetrics} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Resource & Approval Management - Bottom */}
        <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: isMobile ? 2 : 3 }}>
          {/* Pending Approvals */}
          <Grid item xs={12} md={6}>
            <PendingApprovals
              approvals={pendingApprovals}
              onEscalate={(id) => console.log('Escalate:', id)}
              onRemind={(id) => console.log('Remind:', id)}
            />
          </Grid>

          {/* Task Priority Matrix */}
          <Grid item xs={12} md={6}>
            <TaskPriorityMatrix tasks={taskItems} />
          </Grid>
        </Grid>

        {/* Milestone & Billing Tracker */}
        <Box sx={{ mt: isMobile ? 2 : 3 }}>
          <MilestoneBillingTracker
            milestones={milestoneData}
            onSendNotice={(id) => console.log('Send Notice:', id)}
            onFollowUp={(id) => console.log('Follow Up:', id)}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardLayout;
