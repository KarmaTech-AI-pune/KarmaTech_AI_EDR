namespace EDR.Application.Dtos.ProgramDashboard
{
    public class ProgramNpvDto
    {
        public decimal CurrentNpv { get; set; }
        public decimal ExpectedRevenue { get; set; }
        public decimal ActualRevenue { get; set; }
        public int HighProfitProjectsCount { get; set; }
        public int MediumProfitProjectsCount { get; set; }
        public int LowProfitProjectsCount { get; set; }
        public string WhatIfAnalysis { get; set; }
    }
}
