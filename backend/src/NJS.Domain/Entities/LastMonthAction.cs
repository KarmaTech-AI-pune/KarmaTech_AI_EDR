using System;

namespace NJS.Domain.Entities
{
    public class LastMonthAction : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? Actions { get; set; }
        public DateTime? Date { get; set; }
        public string? Comments { get; set; }
    }
}
