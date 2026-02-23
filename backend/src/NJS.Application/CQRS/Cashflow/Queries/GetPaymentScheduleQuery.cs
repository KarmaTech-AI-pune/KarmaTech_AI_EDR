using MediatR;
using NJS.Application.Dtos.Cashflow;

namespace NJS.Application.CQRS.Cashflow.Queries
{
    public class GetPaymentScheduleQuery : IRequest<PaymentScheduleDto>
    {
        public int ProjectId { get; set; }
    }
}