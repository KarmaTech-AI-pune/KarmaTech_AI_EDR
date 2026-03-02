namespace EDR.Domain.Entities
{
    public class ProgrammeSchedule : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? ProgrammeDescription { get; set; }
    }
}

