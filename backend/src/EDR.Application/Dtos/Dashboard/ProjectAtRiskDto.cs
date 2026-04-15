using System.Collections.Generic;

namespace EDR.Application.Dtos.Dashboard
{
    public class ProjectAtRiskDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Priority { get; set; }
        public string Region { get; set; }
        public string Status { get; set; }
        public int DelayDays { get; set; }
        public decimal BudgetSpent { get; set; }
        public decimal BudgetTotal { get; set; }
        public int BudgetPercentage { get; set; }
        public List<string> Issues { get; set; }
        public string Manager { get; set; }
        public string ProgramName { get; set; }
    }
}

