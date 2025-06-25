namespace NJS.Application.DTOs
{
    public class ManpowerTotalDto
    {
        public decimal? PlannedTotal { get; set; }
        public decimal? ConsumedTotal { get; set; }
        public decimal? BalanceTotal { get; set; }
        public decimal? NextMonthPlanningTotal { get; set; }
    }
}
