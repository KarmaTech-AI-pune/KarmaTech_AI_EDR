namespace NJS.Application.DTOs
{
    public class ContractAndCostDto
    {
        public bool LumpSum { get; set; }
        public bool TimeAndExpense { get; set; }
        public decimal Percentage { get; set; }
        public decimal ActualOdcs { get; set; }
        public decimal ActualStaff { get; set; }
        public decimal ActualSubtotal { get; set; }
    }
}
