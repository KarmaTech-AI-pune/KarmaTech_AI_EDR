namespace NJS.Domain.Entities
{
    public class ContractAndCost
    {
        public int Id { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string ContractType { get; set; }
        public decimal Percentage { get; set; }
        public decimal ActualOdcs { get; set; }
        public decimal ActualStaff { get; set; }
        public decimal ActualSubtotal { get; set; }
    }
}
