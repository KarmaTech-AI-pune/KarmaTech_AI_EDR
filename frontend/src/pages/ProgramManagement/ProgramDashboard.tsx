import React, { useState, useEffect } from "react";
import { Container, Grid, Box, CircularProgress, Alert, Typography, useTheme } from "@mui/material";
import { dashboardService } from "../../services/dashboardService";
import { useProject } from "../../context/ProjectContext";
import { programApi } from "../../services/programApi";

// Components
import MetricsGrid from "../../components/dashboard/MetricsGrid";
import CashflowChart from "../../components/dashboard/CashflowChart";
import PendingApprovals from "../../components/dashboard/PendingApprovals";
import MilestoneBillingTracker from "../../components/dashboard/MilestoneBillingTracker";
import NPVProfitability from "../../components/dashboard/NPVProfitability";
import PriorityProjectsPanel from "../../components/dashboard/PriorityProjectsPanel";
import RegionalPortfolio from "../../components/dashboard/RegionalPortfolio";
import TaskPriorityMatrix from "../../components/dashboard/TaskPriorityMatrix";
import { aiSuggestions } from "../../data/mockData/approvals";

// Types
import { Program } from "../../types/program";
import { FinancialMetrics, CashflowData, PendingApproval, MilestoneData, Project } from "../../data/types/dashboard";

const ProgramDashboard: React.FC = () => {
  const { programId } = useProject();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [program, setProgram] = useState<Program | null>(null);

  useEffect(() => {
    const fetchProgramData = async () => {
      if (!programId) {
        console.warn("No programId found in context");
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching dashboard data for programId: ${programId}`);
        
        const responseData = await dashboardService.getProgramDashboard(parseInt(programId));
        console.log("Dashboard response data:", responseData);
        
        if (!responseData) {
            throw new Error("Dashboard service returned no data");
        }
        setData(responseData);

        const programData = await programApi.getById(parseInt(programId));
        setProgram(programData);
        
      } catch (err: any) {
        console.error("Error fetching program dashboard:", err);
        const msg = err.response?.data?.message || err.message || "Failed to load program dashboard data.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 4, mt: 8 }}>
        <Alert severity="error">{error || "Program data not found"}</Alert>
      </Box>
    );
  }

  // Map Backend DTO to UI Metrics
  const financialMetrics: FinancialMetrics = {
    totalRevenue: data.totalRevenueExpected,
    totalRevenueActual: data.totalRevenueActual,
    totalRevenueChange: parseFloat(data.revenueChangeDescription?.split("%")[0]) || 0,
    totalRevenueChangeType: data.revenueChangeType,
    profitMargin: data.profitMargin,
    profitMarginChange: parseFloat(data.profitMarginChangeDescription?.split("%")[0]) || 0,
    profitMarginChangeType: data.profitMarginChangeType,
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
    project: f.projectName,
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

  const mappedRegionalPortfolio = data.regionalPortfolio || [];
  
  const mappedTasks = data.taskPriorityMatrix || [];

  return (
    <Box sx={{ py: 3, backgroundColor: theme.palette.background.default, minHeight: "100vh" }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4, mt: 8 }}>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Program Dashboard: {program?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Aggregated metrics for all projects within this program
          </Typography>
        </Box>

        {/* Executive Summary Metrics */}
        <MetricsGrid metrics={financialMetrics} />

        {/* Main Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Left Column - Priority Projects & Regional & Tasks */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <PriorityProjectsPanel
                  projects={mappedProjectsAtRisk}
                  suggestions={aiSuggestions}
                  onViewActionPlan={(projectId: string) => console.log("View action plan for project:", projectId)}
                />
              </Grid>
              <Grid item xs={12}>
                <RegionalPortfolio data={mappedRegionalPortfolio} />
              </Grid>
              <Grid item xs={12}>
                <TaskPriorityMatrix 
                  tasks={mappedTasks}
                  onTaskClick={(taskId) => console.log("View task:", taskId)}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column - Financial Analysis */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={3}>
              {/* Cashflow Chart */}
              <Grid item xs={12}>
                <CashflowChart data={mappedCashflow} />
              </Grid>
              
              {/* NPV & Profitability */}
              <Grid item xs={12}>
                <NPVProfitability
                  data={{
                    currentNpv: data.currentNpv || 0,
                    highProfitProjectsCount: data.highProfitProjectsCount || 0,
                    mediumProfitProjectsCount: data.mediumProfitProjectsCount || 0,
                    lowProfitProjectsCount: data.lowProfitProjectsCount || 0,
                    whatIfAnalysis: data.whatIfAnalysis || "Not enough data for analysis",
                  }}
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
            <MilestoneBillingTracker milestones={mappedMilestones} onSendNotice={() => {}} onFollowUp={() => {}} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProgramDashboard;
