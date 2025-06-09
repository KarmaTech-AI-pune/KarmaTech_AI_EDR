namespace NJS.Domain.Entities
{
    public class CTCEAC
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public decimal CtcODC { get; set; }
        public decimal CtcStaff { get; set; }
        public decimal CtcSubtotal { get; set; }
        public decimal TotalEAC { get; set; }
        public decimal GrossProfitPercentage { get; set; }
    }
}
