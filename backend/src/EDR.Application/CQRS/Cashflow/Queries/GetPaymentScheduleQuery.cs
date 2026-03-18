using MediatR;
using EDR.Application.Dtos.Cashflow;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetPaymentScheduleQuery : IRequest<PaymentScheduleDto>
    {
        public int ProjectId { get; set; }
    }
}