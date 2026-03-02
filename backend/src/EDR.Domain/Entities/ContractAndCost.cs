namespace EDR.Domain.Entities
{
    public class ContractAndCost : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public decimal? PriorCumulativeOdc { get; set; }
        public decimal? PriorCumulativeStaff { get; set; }
        public decimal? PriorCumulativeTotal { get; set; }
        public decimal? ActualOdc { get; set; }
        public decimal? ActualStaff { get; set; }
        public decimal? ActualSubtotal { get; set; }
        public decimal? TotalCumulativeOdc { get; set; }
        public decimal? TotalCumulativeStaff { get; set; }
        public decimal? TotalCumulativeCost { get; set; }
    }
}

