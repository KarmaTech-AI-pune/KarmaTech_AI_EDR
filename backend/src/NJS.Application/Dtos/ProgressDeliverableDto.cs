using System;

namespace NJS.Application.DTOs
{
    public class ProgressDeliverableDto
    {
        public string Milestone { get; set; }
        public DateTime DueDateContract { get; set; }
        public DateTime DueDatePlanned { get; set; }
        public DateTime AchievedDate { get; set; }
        public decimal PaymentDue { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime PaymentReceivedDate { get; set; }
        public string DeliverableComments { get; set; }
    }
}
