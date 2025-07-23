namespace NJS.Domain.Entities
{
    public class FinancialDetails : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public decimal? Net { get; set; }
        public decimal? ServiceTax { get; set; }
        public decimal? FeeTotal { get; set; }
        public decimal? BudgetOdcs { get; set; }
        public decimal? BudgetStaff { get; set; }
        public decimal? BudgetSubTotal { get; set; }
        public string? ContractType { get; set; }
    }
}
