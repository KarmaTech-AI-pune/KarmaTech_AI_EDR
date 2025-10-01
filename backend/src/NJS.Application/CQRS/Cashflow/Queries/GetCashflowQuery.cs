using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Cashflow.Queries
{
    public class GetCashflowQuery : IRequest<CashflowDto>
    {
        public int Id { get; set; }
    }
}
