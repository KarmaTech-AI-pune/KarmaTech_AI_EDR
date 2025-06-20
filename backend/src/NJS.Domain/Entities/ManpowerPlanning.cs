namespace NJS.Domain.Entities
{
    public class ManpowerPlanning
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string WorkAssignment { get; set; }
        public string Assignee { get; set; } // For multiple, use a separate table or JSON
        public decimal Planned { get; set; }
        public decimal Consumed { get; set; }
        public decimal Balance { get; set; }
        public decimal NextMonthPlanning { get; set; }
        public string ManpowerComments { get; set; }
    }
}
