using System.Collections.Generic;

namespace EDR.Application.Dtos.ProgramDashboard
{
    public class ProgramDashboardDto
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; }
        public int TotalProjects { get; set; }
        
        // Revenue Metrics
        public decimal TotalRevenueExpected { get; set; }
        public string RevenueChangeDescription { get; set; }
        public string RevenueChangeType { get; set; }
        public decimal TotalRevenueActual { get; set; }
        
        // Profit Metrics
        public decimal ProfitMargin { get; set; }
        public string ProfitMarginChangeDescription { get; set; }
        public string ProfitMarginChangeType { get; set; }
        
        // NPV & Profitability
        public decimal CurrentNpv { get; set; }
        public int HighProfitProjectsCount { get; set; }
        public int MediumProfitProjectsCount { get; set; }
        public int LowProfitProjectsCount { get; set; }
        public string WhatIfAnalysis { get; set; }
        
        
        public List<PendingFormDto> PendingForms { get; set; }
        public List<MilestoneBillingDto> Milestones { get; set; }
        public List<MonthlyCashflowDto> MonthlyCashflow { get; set; }
        public List<RegionalPortfolioDto> RegionalPortfolio { get; set; }
        public List<ProjectAtRiskDto> ProjectsAtRisk { get; set; }
        public List<TaskPriorityItemDto> TaskPriorityMatrix { get; set; }
        public List<MonthlyAssigneeProgressDto> MonthlyAssigneeProgress { get; set; }
        public List<PendingApprovalItemDto> PendingApprovals { get; set; }
        public List<RevenueAtRiskDto> RevenueAtRiskMetrics { get; set; }
    }
}
