namespace NJS.Application.DTOs
{
    public class ManpowerDto
    {
        public string WorkAssignment { get; set; }
        public string Assignee { get; set; }
        public decimal? Planned { get; set; }
        public decimal? Consumed { get; set; }
        public decimal? Balance { get; set; }
        public decimal? NextMonthPlanning { get; set; }
        public string ManpowerComments { get; set; }
    }
}
