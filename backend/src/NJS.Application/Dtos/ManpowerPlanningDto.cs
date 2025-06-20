namespace NJS.Application.DTOs
{
    public class ManpowerPlanningDto
    {
        public string? WorkAssignment { get; set; }
        public string? AssigneesJson { get; set; } // Changed from Assignee
        public decimal? Planned { get; set; }
        public decimal? Consumed { get; set; }
        public decimal? Balance { get; set; }
        public decimal? NextMonthPlanning { get; set; }
        public string? ManpowerComments { get; set; }
    }
}
