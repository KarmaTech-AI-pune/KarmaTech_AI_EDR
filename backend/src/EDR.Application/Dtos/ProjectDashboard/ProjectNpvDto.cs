namespace EDR.Application.Dtos.ProjectDashboard
{
    public class ProjectNpvDto
    {
        public decimal CurrentNpv { get; set; }
        public decimal ExpectedRevenue { get; set; }
        public decimal ActualRevenue { get; set; }
        public string WhatIfAnalysis { get; set; }
    }
}
