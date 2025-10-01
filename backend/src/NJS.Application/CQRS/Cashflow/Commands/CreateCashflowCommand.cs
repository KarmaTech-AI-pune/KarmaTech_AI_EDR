using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Cashflow.Commands
{
    public class CreateCashflowCommand : IRequest<CashflowDto>
    {
        public CashflowDto Cashflow { get; set; }
    }
}
