namespace NJS.Application.DTOs
{
    public class FinancialDetailsDto
    {
        public decimal Net { get; set; }
        public decimal ServiceTax { get; set; }
        public decimal FeeTotal { get; set; }
        public decimal BudgetOdcs { get; set; }
        public decimal BudgetStaff { get; set; }
        public decimal BudgetSubTotal { get; set; }
        public string? ContractType { get; set; }
        public decimal Percentage { get; set; }
    }
}
