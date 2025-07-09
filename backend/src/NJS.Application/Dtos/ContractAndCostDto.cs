namespace NJS.Application.DTOs
{
    public class ContractAndCostDto
    {
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
