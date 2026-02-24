namespace EDR.Domain.Entities
{
    public class OriginalBudget : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int BudgetTableId { get; set; }
        public BudgetTable BudgetTable { get; set; }
        public decimal RevenueFee { get; set; }
        public decimal Cost { get; set; }
        public decimal ProfitPercentage { get; set; }
    }
}

