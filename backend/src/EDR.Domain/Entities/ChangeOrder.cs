namespace EDR.Domain.Entities
{
    public class ChangeOrder : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public decimal? ContractTotal { get; set; }
        public decimal? Cost { get; set; }
        public decimal? Fee { get; set; }
        public string? SummaryDetails { get; set; }
        public string? Status { get; set; }
    }
}

