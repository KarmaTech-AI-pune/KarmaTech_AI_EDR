using System;

namespace EDR.Domain.Entities
{
    public class Schedule : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public DateTime? DateOfIssueWOLOI { get; set; }
        public DateTime? CompletionDateAsPerContract { get; set; }
        public DateTime? CompletionDateAsPerExtension { get; set; }
        public DateTime? ExpectedCompletionDate { get; set; }
    }
}

