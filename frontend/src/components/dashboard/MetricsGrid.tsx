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
      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Total Revenue-Expected"
          value={formatCurrency(metrics.totalRevenue, metrics.currency)}
          change={`${metrics.totalRevenueChange}% vs last quarter`}
          changeType={metrics.totalRevenueChangeType}
          icon="revenue"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Total Revenue-Actual"
          value={formatCurrency(metrics.totalRevenueActual, metrics.currency)}
          change={`${metrics.totalRevenueChange}% vs last quarter`}
          changeType={metrics.totalRevenueChangeType}
          icon="revenue"
          subtitle={metrics.completedMilestonesCount !== undefined ? `${metrics.completedMilestonesCount} milestones completed` : undefined}
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Expected Gross Profit %"
          value={`${(metrics.expectedProfitMargin?.value ?? 0).toFixed(2)}%`}
          change={`${metrics.expectedProfitMargin?.change ?? 0}% improvement`}
          changeType={metrics.expectedProfitMargin?.changeType ?? 'neutral'}
          icon="profit"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Actual Gross Profit %"
          value={`${(metrics.actualProfitMargin?.value ?? 0).toFixed(2)}%`}
          change={`${metrics.actualProfitMargin?.change ?? 0}% improvement`}
          changeType={metrics.actualProfitMargin?.changeType ?? 'neutral'}
          icon="profit"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(metrics.revenueAtRisk, metrics.currency)}
          change={`${metrics.revenueAtRiskChange} projects affected`}
          changeType={metrics.revenueAtRiskChangeType}
          icon="risk"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2}>
        <MetricCard
          title="Pending Approvals"
          value={metrics.approvalDelays.toString()}
          change={`Avg ${metrics.approvalDelaysChange} days delay`}
          changeType={metrics.approvalDelaysChangeType}
          icon="approvals"
        />
      </Grid>


    </Grid>
  );
};

export default MetricsGrid;
