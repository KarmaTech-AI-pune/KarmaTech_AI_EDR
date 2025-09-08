import React from 'react';
import { Grid } from '@mui/material';
import MetricCard from './MetricCard';
import { FinancialMetrics } from '../../data/types/dashboard';
import { formatCurrency } from '../../utils/formatters';

interface MetricsGridProps {
  metrics: FinancialMetrics;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change="12.5% vs last quarter"
          changeType="positive"
          icon="revenue"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          title="Profit Margin"
          value={`${metrics.profitMargin}%`}
          change="2.1% improvement"
          changeType="positive"
          icon="profit"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(metrics.revenueAtRisk)}
          change="3 projects affected"
          changeType="negative"
          icon="risk"
          subtitle="Critical attention needed"
        />
      </Grid>
      
      <Grid item xs={12} sm={6} lg={3}>
        <MetricCard
          title="Pending Approvals"
          value={metrics.approvalDelays.toString()}
          change="Avg 11.7 days delay"
          changeType="negative"
          icon="approvals"
          subtitle="Process bottleneck identified"
        />
      </Grid>
    </Grid>
  );
};

export default MetricsGrid;
