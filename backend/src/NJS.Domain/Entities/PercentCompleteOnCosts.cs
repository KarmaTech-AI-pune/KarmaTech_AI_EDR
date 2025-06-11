namespace NJS.Domain.Entities
{
    public class PercentCompleteOnCosts
    {
        public int Id { get; set; }
        public int BudgetTableId { get; set; }
        public BudgetTable BudgetTable { get; set; }
        public decimal RevenueFee { get; set; }
        public decimal Cost { get; set; }
        public decimal ProfitPercentage { get; set; }
    }
}
