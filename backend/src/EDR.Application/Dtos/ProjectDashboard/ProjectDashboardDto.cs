using System.Collections.Generic;

namespace EDR.Application.Dtos.ProjectDashboard
{
    public class ProjectDashboardDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Currency { get; set; }
        
        // Revenue Metrics
        public decimal TotalRevenueExpected { get; set; }
        public string RevenueChangeDescription { get; set; }
        public string RevenueChangeType { get; set; }
        public decimal TotalRevenueActual { get; set; }
        
        // Profit Metrics
        public ProjectExpectedProfitMarginDto ExpectedProfitMargin { get; set; }
        public ProjectActualProfitMarginDto ActualProfitMargin { get; set; }
        
        // NPV Data
        public decimal CurrentNpv { get; set; }
        public string WhatIfAnalysis { get; set; }
        
        
        public List<PendingFormDto> PendingForms { get; set; }
        public List<MilestoneBillingDto> Milestones { get; set; }
        public List<MonthlyCashflowDto> MonthlyCashflow { get; set; }
        public List<ProjectAtRiskDto> ProjectsAtRisk { get; set; }
        public List<RegionalPortfolioDto> RegionalPortfolio { get; set; }
        public List<TaskPriorityItemDto> TaskPriorityMatrix { get; set; }
        public List<MonthlyAssigneeProgressDto> MonthlyAssigneeProgress { get; set; }
        public List<PendingApprovalItemDto> PendingApprovals { get; set; }
        public List<RevenueAtRiskDto> RevenueAtRiskMetrics { get; set; }
    }
}
