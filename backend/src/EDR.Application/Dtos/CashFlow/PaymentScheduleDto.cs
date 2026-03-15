using System.Collections.Generic;

namespace EDR.Application.Dtos.Cashflow
{
    public class PaymentScheduleDto
    {
        public List<PaymentScheduleItemDto> Milestones { get; set; }
        public decimal TotalPercentage { get; set; }
        public decimal TotalAmountINR { get; set; }
        public decimal TotalProjectFee { get; set; }
    }
}