using System.Collections.Generic;

namespace EDR.Application.Dtos.Dashboard
{
    public class ProjectDashboardDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        
        // Revenue Metrics
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
        public string WhatIfAnalysis { get; set; }
        
        // Budget Metrics (Project Specific)
        public decimal BudgetTotal { get; set; }
        public decimal BudgetSpent { get; set; }
        public double BudgetPercentage { get; set; }
        
        public List<PendingFormDto> PendingForms { get; set; }
        public List<MilestoneBillingDto> Milestones { get; set; }
        public List<MonthlyCashflowDto> MonthlyCashflow { get; set; }
        public List<ProjectAtRiskDto> ProjectsAtRisk { get; set; }
        public List<RegionalPortfolioDto> RegionalPortfolio { get; set; }
    }
}
