namespace NJS.Application.DTOs
{
    public class ContractAndCostDto
    {
        public string? ContractType { get; set; }
        public decimal Percentage { get; set; }
        public decimal ActualOdcs { get; set; }
        public decimal ActualStaff { get; set; }
        public decimal ActualSubtotal { get; set; }
    }
}
