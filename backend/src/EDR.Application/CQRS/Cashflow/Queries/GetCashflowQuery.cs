using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Cashflow.Queries
{
    public class GetCashflowQuery : IRequest<CashflowDto>
    {
        public int Id { get; set; }
    }
}

