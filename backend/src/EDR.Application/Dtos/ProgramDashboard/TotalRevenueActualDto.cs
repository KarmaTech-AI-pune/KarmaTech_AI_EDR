namespace EDR.Application.Dtos.ProgramDashboard
{
    public class TotalRevenueActualDto
    {
        public decimal TotalRevenue { get; set; }
        public string ChangeDescription { get; set; }
        public string ChangeType { get; set; }
        public int CompletedMilestonesCount { get; set; }
    }
}
