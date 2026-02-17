namespace EDR.Domain.Entities
{
    public class BudgetTable : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public OriginalBudget OriginalBudget { get; set; }
        public CurrentBudgetInMIS CurrentBudgetInMIS { get; set; }
        public PercentCompleteOnCosts PercentCompleteOnCosts { get; set; }
    }
}

