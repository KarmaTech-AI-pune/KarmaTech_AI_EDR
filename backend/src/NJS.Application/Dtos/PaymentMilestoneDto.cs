using System;

namespace NJS.Application.DTOs
{
    public class PaymentMilestoneDto
    {
        public string MilestoneName { get; set; }
        public string DueDate { get; set; }
        public decimal Amount { get; set; }
        public string Percentage { get; set; }
        public string Status { get; set; }
    }
}
