using System.Collections.Generic;

namespace EDR.Application.Dtos.ProjectDashboard
{
    public class RegionalProjectDetailDto
    {
        public string ProjectName { get; set; }
        public string ProgramName { get; set; }
    }

    public class RegionalPortfolioDto
    {
        public string Region { get; set; }
        public int Q1 { get; set; }
        public int Q2 { get; set; }
        public int Q3 { get; set; }
        public int Q4 { get; set; }
        public decimal Revenue { get; set; }
        public decimal Profit { get; set; }
        public List<RegionalProjectDetailDto> ProjectDetails { get; set; } = new List<RegionalProjectDetailDto>();
    }
}
