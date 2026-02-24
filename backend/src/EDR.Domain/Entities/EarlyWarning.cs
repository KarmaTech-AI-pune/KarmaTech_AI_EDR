namespace EDR.Domain.Entities
{
    public class EarlyWarning : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? WarningsDescription { get; set; }
    }
}

