namespace EDR.Application.Dtos.ProjectDashboard
{
    public class ProjectAtRiskDto
    {
        public int Id { get; set; }
        public string Project { get; set; }
        public decimal MilestoneValue { get; set; }
        public decimal ProfitMargin { get; set; }
        public string Delay { get; set; }
        public decimal CriticalResource { get; set; }
    }
}
