using System.ComponentModel.DataAnnotations.Schema;

namespace NJS.Domain.Entities
{
    [Table("CTCEACs")]
    public class CTCEAC : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public decimal? CtcODC { get; set; }
        public decimal? CtcStaff { get; set; }
        public decimal? CtcSubtotal { get; set; }
        public decimal? ActualctcODC { get; set; }
        public decimal? ActualCtcStaff { get; set; }
        public decimal? ActualCtcSubtotal { get; set; }
        public decimal? EacOdc { get; set; }
        public decimal? EacStaff { get; set; }
        public decimal? TotalEAC { get; set; }
        public decimal? GrossProfitPercentage { get; set; }
    }
}
