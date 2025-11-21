namespace NJS.Application.DTOs.Dashboard
{
    public class TotalRevenueExpectedDto
    {
        public decimal TotalRevenueExpected { get; set; }
        public string ComparisonToLastQuarter { get; set; }
        public decimal ComparisonPercentage { get; set; }
    }
}
