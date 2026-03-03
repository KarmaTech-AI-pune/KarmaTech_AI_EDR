using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class CreatePaymentMilestoneCommand : IRequest<PaymentMilestoneDto>
    {
        public int ProjectId { get; set; }
        public string Description { get; set; }
        public decimal Percentage { get; set; }
        public decimal AmountINR { get; set; }
        public string? DueDate { get; set; }
        public string? ChangedBy { get; set; } // Made optional - will be set by controller
    }
}
