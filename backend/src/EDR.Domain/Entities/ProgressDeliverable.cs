using System;

namespace EDR.Domain.Entities
{
    public class ProgressDeliverable : ITenantEntity
    {
        public int Id { get; set; }
        public int TenantId { get; set; }
        public int MonthlyProgressId { get; set; }
        public MonthlyProgress MonthlyProgress { get; set; }
        public string? Milestone { get; set; }
        public DateTime? DueDateContract { get; set; }
        public DateTime? DueDatePlanned { get; set; }
        public DateTime? AchievedDate { get; set; }
        public decimal? PaymentDue { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public DateTime? PaymentReceivedDate { get; set; }
        public string? DeliverableComments { get; set; }
    }
}

