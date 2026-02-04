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
      <Grid item xs={12} sm={6} lg={2.4}>
        <MetricCard
          title="Total Revenue-Expected"
          value={formatCurrency(metrics.totalRevenue)}
          change={`${metrics.totalRevenueChange}% vs last quater`}
          changeType={metrics.totalRevenueChangeType}
          icon="revenue"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <MetricCard
          title="Total Revenue-Actual"
          value={formatCurrency(metrics.totalRevenueActual || metrics.totalRevenue)}
          change={`${metrics.totalRevenueChange}% vs last quater`}
          changeType={metrics.totalRevenueChangeType}
          icon="revenue"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <MetricCard
          title="Profit Margin"
          value={`${metrics.profitMargin.toFixed(2)}%`}
          change={`${metrics.profitMarginChange}% improvement`}
          changeType={metrics.profitMarginChangeType}
          icon="profit"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
        <MetricCard
          title="Revenue at Risk"
          value={formatCurrency(metrics.revenueAtRisk)}
          change={`${metrics.revenueAtRiskChange} projects affected`}
          changeType={metrics.revenueAtRiskChangeType}
          icon="risk"
        />
      </Grid>

      <Grid item xs={12} sm={6} lg={2.4}>
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
