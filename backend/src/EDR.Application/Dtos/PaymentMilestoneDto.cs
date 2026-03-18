using System;

namespace EDR.Application.Dtos
{
    public class PaymentMilestoneDto
    {
        public int? Id { get; set; }
        public string Description { get; set; }
        public decimal Percentage { get; set; }
        public decimal AmountINR { get; set; }
        public string DueDate { get; set; }
    }
}
