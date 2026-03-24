import React, { useState, useCallback, useEffect } from "react";
import { Container, Grid, Box, useMediaQuery, CircularProgress, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";

// Components
import DashboardHeader from "./DashboardHeader";
import MetricsGrid from "./MetricsGrid";
import PriorityProjectsPanel from "./PriorityProjectsPanel";
import CashflowChart from "./CashflowChart";
import RegionalPortfolio from "./RegionalPortfolio";
import NPVProfitability from "./NPVProfitability";
import PendingApprovals from "./PendingApprovals";
import TaskPriorityMatrix from "./TaskPriorityMatrix";
import MilestoneBillingTracker from "./MilestoneBillingTracker";

// Data & Types
import {
  FinancialMetrics,
  DashboardFilters,
  Project,
  CashflowData,
  RegionalData,
  PendingApproval,
  MilestoneData,
  
} from "../../data/types/dashboard";
import {
  aiSuggestions
} from "../../data/mockData/approvals";

// Service
import {
  dashboardService,
  PendingFormsResponseDto,
  TotalRevenueExpectedDto,
  TotalRevenueActualDto,
  ProfitMarginDto,
  RevenueAtRiskDto,
  ProjectsAtRiskResponseDto,
  MonthlyCashflowDto,
  RegionalPortfolioDto,
  NpvProfitabilityDto,
  MilestoneBillingDto,
  TaskPriorityItemDto
} from "../../services/dashboardService";

const DashboardLayout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState<DashboardFilters>({
    selectedRegion: "All",
    timeframe: "quarter",
  });

  // State for API data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pendingForms, setPendingForms] = useState<PendingFormsResponseDto | null>(null);
  const [totalRevenueExpected, setTotalRevenueExpected] = useState<TotalRevenueExpectedDto | null>(null);
  const [totalRevenueActual, setTotalRevenueActual] = useState<TotalRevenueActualDto | null>(null);
  const [profitMargin, setProfitMargin] = useState<ProfitMarginDto | null>(null);
  const [revenueAtRisk, setRevenueAtRisk] = useState<RevenueAtRiskDto | null>(null);
  const [projectsAtRisk, setProjectsAtRisk] = useState<ProjectsAtRiskResponseDto | null>(null);
  const [monthlyCashflow, setMonthlyCashflow] = useState<MonthlyCashflowDto[]>([]);
  const [regionalPortfolio, setRegionalPortfolio] = useState<RegionalPortfolioDto[]>([]);
  const [npvProfitability, setNpvProfitability] = useState<NpvProfitabilityDto | null>(null);
  const [milestoneBilling, setMilestoneBilling] = useState<MilestoneBillingDto[]>([]);
  const [taskPriorityMatrix, setTaskPriorityMatrix] = useState<TaskPriorityItemDto[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [
          pendingFormsData,
          revenueExpectedData,
          revenueActualData,
          profitMarginData,
          revenueAtRiskData,
          projectsAtRiskData,
          cashflowData,
          regionalData,
          npvData,
          milestoneData,
          taskPriorityMatrixData
        ] = await Promise.all([
          dashboardService.getPendingForms(),
          dashboardService.getTotalRevenueExpected(),
          dashboardService.getTotalRevenueActual(),
          dashboardService.getProfitMargin(),
          dashboardService.getRevenueAtRisk(),
          dashboardService.getProjectsAtRisk(),
          dashboardService.getMonthlyCashflow(),
          dashboardService.getRegionalPortfolio(),
          dashboardService.getNpvProfitability(),
          dashboardService.getMilestoneBilling(),
          dashboardService.getTaskPriorityMatrix()
        ]);

        setPendingForms(pendingFormsData);
        setTotalRevenueExpected(revenueExpectedData);
        setTotalRevenueActual(revenueActualData);
        setProfitMargin(profitMarginData);
        setRevenueAtRisk(revenueAtRiskData);
        setProjectsAtRisk(projectsAtRiskData);
        setMonthlyCashflow(cashflowData);
        setRegionalPortfolio(regionalData);
        setNpvProfitability(npvData);
        setMilestoneBilling(milestoneData);
        setTaskPriorityMatrix(taskPriorityMatrixData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: Partial<DashboardFilters>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const handleNotificationsClick = useCallback(() => {
    console.log("Notifications clicked");
  }, []);

  const handleViewActionPlan = useCallback((projectId: string) => {
    console.log("View action plan for project:", projectId);
  }, []);

  // Map API data to UI types
  const financialMetrics: FinancialMetrics = {
    totalRevenue: totalRevenueExpected?.totalRevenue || 0,
    totalRevenueActual: totalRevenueActual?.totalRevenue || 0,
    totalRevenueChange: 0, // Not in DTO
    totalRevenueChangeType: (totalRevenueExpected?.changeType?.toLowerCase() as any) || 'neutral',
    profitMargin: profitMargin?.profitMargin || 0,
    profitMarginChange: 0, // Not in DTO
    profitMarginChangeType: (profitMargin?.changeType?.toLowerCase() as any) || 'neutral',
    revenueAtRisk: revenueAtRisk?.revenueAtRisk || 0,
    revenueAtRiskChange: 0, // Not in DTO
    revenueAtRiskChangeType: (revenueAtRisk?.changeType?.toLowerCase() as any) || 'neutral',
    approvalDelays: pendingForms?.totalPendingForms || 0,
    approvalDelaysChange: 0,
    approvalDelaysChangeType: 'negative'
  };

  const mappedProjects: Project[] = projectsAtRisk?.projects?.map(p => ({
    id: p.projectId.toString(),
    name: p.projectName,
    severity: p.priority === 'High' ? 'P3' : 'P5', // Simple mapping
    status: 'falling_behind', // Default or map from p.Status
    delay: p.delayDays,
    region: p.region,
    budget: p.budgetTotal,
    spent: p.budgetSpent,
    timeline: `${p.budgetPercentage}%`,
    issues: p.issues
  })) || [];

  const mappedCashflow: CashflowData[] = monthlyCashflow.map(c => ({
    month: c.month,
    planned: c.planned,
    actual: c.actual,
    variance: c.variance
  }));

  const mappedRegionalData: RegionalData[] = regionalPortfolio.map(r => ({
    region: r.region,
    q1: r.q1,
    q2: r.q2,
    q3: r.q3,
    q4: r.q4,
    revenue: r.revenue,
    profit: r.profit
  }));

  const mappedPendingApprovals: PendingApproval[] = pendingForms?.pendingForms?.map(f => ({
    id: f.formId,
    project: f.projectName,
    formName: f.formName,
    manager: f.holdingUserName,
    days: 0, // Not in DTO
    impact: 'High' // Default
  })) || [];

  const mappedMilestones: MilestoneData[] = milestoneBilling.map(m => ({
    id: m.id,
    project: m.project,
    milestone: m.milestone,
    expectedAmount: m.expectedAmount,
    status: m.status as any,
    daysDelayed: m.daysDelayed,
    penalty: m.penalty
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
        py: isMobile ? 2 : 3,
      }}
    >
      <Container maxWidth="xl">
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
              projects={mappedProjects}
              suggestions={aiSuggestions}
              onViewActionPlan={handleViewActionPlan}
            />
          </Grid>

          {/* Right Column - Financial Analysis */}
          <Grid item xs={12} lg={8}>
            <Grid container spacing={isMobile ? 2 : 3}>
              {/* Cashflow Chart - Full Width */}
              <Grid item xs={12}>
                <CashflowChart data={mappedCashflow} />
              </Grid>

              {/* Regional Portfolio */}
              <Grid item xs={12} md={6}>
                <RegionalPortfolio data={mappedRegionalData} />
              </Grid>

              {/* NPV & Profitability */}
              <Grid item xs={12} md={6}>
                <NPVProfitability data={npvProfitability} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Resource & Approval Management - Bottom */}
        <Grid
          container
          spacing={isMobile ? 2 : 3}
          sx={{ mt: isMobile ? 2 : 3 }}
        >
          {/* Pending Approvals */}
          <Grid item xs={12} md={6}>
            <PendingApprovals
              approvals={mappedPendingApprovals}
              onEscalate={(id) => console.log("Escalate:", id)}
              onRemind={(id) => console.log("Remind:", id)}
            />
          </Grid>

          {/* Task Priority Matrix */}
          <Grid item xs={12} md={6}>
            <TaskPriorityMatrix tasks={taskPriorityMatrix} />
          </Grid>
        </Grid>

        {/* Milestone & Billing Tracker */}
        <Box sx={{ mt: isMobile ? 2 : 3 }}>
          <MilestoneBillingTracker
            milestones={mappedMilestones}
            onSendNotice={(id) => console.log("Send Notice:", id)}
            onFollowUp={(id) => console.log("Follow Up:", id)}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardLayout;
