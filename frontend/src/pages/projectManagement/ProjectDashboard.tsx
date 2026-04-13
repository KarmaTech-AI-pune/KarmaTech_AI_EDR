import React, { useState, useEffect } from "react";
import { Container, Grid, Box, CircularProgress, Alert, Typography, useTheme } from "@mui/material";
import { ProjectDashboardDto, dashboardService } from "../../services/dashboardService";

// Components
import MetricsGrid from "../../components/dashboard/MetricsGrid";
import CashflowChart from "../../components/dashboard/CashflowChart";
import PendingApprovals from "../../components/dashboard/PendingApprovals";
import MilestoneBillingTracker from "../../components/dashboard/MilestoneBillingTracker";
import NPVProfitability from "../../components/dashboard/NPVProfitability";
import PriorityProjectsPanel from "../../components/dashboard/PriorityProjectsPanel";
import RegionalPortfolio from "../../components/dashboard/RegionalPortfolio";
import TaskPriorityMatrix from "../../components/dashboard/TaskPriorityMatrix";

// Types
import { FinancialMetrics, CashflowData, PendingApproval, MilestoneData, Project } from "../../data/types/dashboard";
import { useProjectDetailsContext } from "./ProjectDetails";

const ProjectDashboard: React.FC = () => {
  const { project } = useProjectDetailsContext();
  const projectId = project?.id;
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProjectDashboardDto | null>(null);

  useEffect(() => {
    const fetchProjectDashboard = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        const result = await dashboardService.getProjectDashboard(parseInt(projectId));
        setData(result);
      } catch (err) {
        console.error("Error fetching project dashboard:", err);
        setError("Failed to load project dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDashboard();
  }, [projectId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error || "Project data not found"}</Alert>
      </Box>
    );
  }

  // Map Backend DTO to UI Metrics
  const financialMetrics: FinancialMetrics = {
    totalRevenue: data.totalRevenueExpected,
    currency: data.currency,
    totalRevenueActual: data.totalRevenueActual,
    totalRevenueChange: parseFloat(data.revenueChangeDescription.split("%")[0]) || 0,
    totalRevenueChangeType: data.revenueChangeType,
    expectedProfitMargin: {
      value: data.expectedProfitMargin?.expectedProfitMargin || 0,
      change: parseFloat(data.expectedProfitMargin?.changeDescription?.split("%")[0]) || 0,
      changeType: data.expectedProfitMargin?.changeType as any || "neutral",
    },
    actualProfitMargin: {
      value: data.actualProfitMargin?.actualProfitMargin || 0,
      change: parseFloat(data.actualProfitMargin?.changeDescription?.split("%")[0]) || 0,
      changeType: data.actualProfitMargin?.changeType as any || "neutral",
    },
    revenueAtRisk: 0,
    revenueAtRiskChange: 0,
    revenueAtRiskChangeType: "neutral",
    approvalDelays: data.pendingForms.length,
    approvalDelaysChange: 0,
    approvalDelaysChangeType: "neutral",
  };

  const mappedCashflow: CashflowData[] = data.monthlyCashflow.map((c: any) => ({
    month: c.month,
    planned: c.planned,
    actual: c.actual,
    variance: c.variance,
  }));

  const mappedPendingApprovals: PendingApproval[] = data.pendingForms.map((f: any) => ({
    id: f.formId,
    project: data.projectName,
    formName: f.formName,
    manager: f.holdingUserName,
    days: 0,
    impact: "Medium",
  }));

  const mappedMilestones: MilestoneData[] = data.milestones.map((m: any) => ({
    id: m.id,
    project: m.project,
    milestone: m.milestone,
    expectedAmount: m.expectedAmount,
    status: m.status as any,
    daysDelayed: m.daysDelayed,
    penalty: m.penalty,
  }));

  const mappedProjectsAtRisk: Project[] = (data.projectsAtRisk || []).map((p: any) => ({
    id: (p.id || p.projectId || 0).toString(),
    name: p.project || p.projectName || "Unknown",
    severity: p.priority || "P3",
    status: p.status || "falling_behind",
    delay: p.delayDays || (p.delay === "delayed" ? 10 : 0),
    region: p.region || "Global",
    budget: p.budgetTotal || 0,
    spent: p.budgetSpent || 0,
    timeline: p.budgetPercentage !== undefined ? `${p.budgetPercentage}%` : "0%",
    issues: p.issues || (p.delay === "delayed" ? ["Project is delayed"] : []),
  }));

  const mappedRegionalPortfolio = ((data as any).regionalPortfolio || []).map((r: any) => ({
    ...r,
    projectDetails: (r.projectDetails || []).map((pd: any) => ({
      projectName: pd.projectName,
      programName: pd.programName
    }))
  }));
  
  const mappedTasks = data.taskPriorityMatrix || [];

  return (
    <Box sx={{ py: 3, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Project Performance: {data.projectName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Real-time tracking of financial health and delivery milestones
          </Typography>
        </Box>

        {/* Executive Summary Metrics */}
        <MetricsGrid metrics={financialMetrics} />

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Project Summary & Regional & Tasks */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PriorityProjectsPanel 
                    projects={mappedProjectsAtRisk} 
                    suggestions={[]} 
                    onViewActionPlan={() => {}} 
                />
              </Grid>
              <Grid item xs={12}>
                <RegionalPortfolio data={mappedRegionalPortfolio} />
              </Grid>
              <Grid item xs={12}>
                <TaskPriorityMatrix 
                  tasks={mappedTasks}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Financial Analysis */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Cashflow Chart */}
              <Grid item xs={12}>
                <CashflowChart data={mappedCashflow} currencyCode={data.currency} />
              </Grid>

              {/* NPV & Profitability */}
              <Grid item xs={12}>
                <NPVProfitability
                  data={{
                    currentNpv: data.currentNpv || 0,
                    highProfitProjectsCount: (data.actualProfitMargin?.actualProfitMargin || 0) >= 20 ? 1 : 0,
                    mediumProfitProjectsCount: (data.actualProfitMargin?.actualProfitMargin || 0) >= 10 && (data.actualProfitMargin?.actualProfitMargin || 0) < 20 ? 1 : 0,
                    lowProfitProjectsCount: (data.actualProfitMargin?.actualProfitMargin || 0) < 10 ? 1 : 0,
                    whatIfAnalysis: data.whatIfAnalysis || "Not enough data for analysis",
                  }}
                  currencyCode={data.currency}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Bottom - Approvals & Milestones */}
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <PendingApprovals approvals={mappedPendingApprovals} onEscalate={() => {}} onRemind={() => {}} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MilestoneBillingTracker milestones={mappedMilestones} onSendNotice={() => {}} onFollowUp={() => {}} currencyCode={data.currency} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectDashboard;
