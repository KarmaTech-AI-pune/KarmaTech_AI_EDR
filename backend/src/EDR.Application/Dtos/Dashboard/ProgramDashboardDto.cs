using System.Collections.Generic;

namespace EDR.Application.Dtos.Dashboard
{
    public class ProgramDashboardDto
    {
        public int ProgramId { get; set; }
        public string ProgramName { get; set; }
        
        // Aggregated Metrics
        public int TotalProjects { get; set; }
        public decimal TotalRevenueExpected { get; set; }
        public string RevenueChangeDescription { get; set; }
        public string RevenueChangeType { get; set; }
        public decimal TotalRevenueActual { get; set; }
        
        // Profit Metrics
        public decimal ProfitMargin { get; set; }
        public string ProfitMarginChangeDescription { get; set; }
        public string ProfitMarginChangeType { get; set; }
        
        // NPV Data
        public decimal CurrentNpv { get; set; }
        public int HighProfitProjectsCount { get; set; }
        public int MediumProfitProjectsCount { get; set; }
        public int LowProfitProjectsCount { get; set; }
        public string WhatIfAnalysis { get; set; }
        
        // Budget Metrics (Aggregated)
        public decimal BudgetTotal { get; set; }
        public decimal BudgetSpent { get; set; }
        public double BudgetPercentage { get; set; }
        
        // Status Distribution for Pie Chart
        public List<ProjectStatusCountDto> StatusDistribution { get; set; }
        
        public List<PendingFormDto> PendingForms { get; set; }
        public List<MilestoneBillingDto> Milestones { get; set; }
        public List<MonthlyCashflowDto> MonthlyCashflow { get; set; }
        public List<ProjectAtRiskDto> ProjectsAtRisk { get; set; }
        public List<RegionalPortfolioDto> RegionalPortfolio { get; set; }
    }

    public class ProjectStatusCountDto
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }
}
