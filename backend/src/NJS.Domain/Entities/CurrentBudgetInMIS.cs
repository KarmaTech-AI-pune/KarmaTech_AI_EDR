using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("CurrentBudgetInMISs")]
    public class CurrentBudgetInMIS : ITenantEntity
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
