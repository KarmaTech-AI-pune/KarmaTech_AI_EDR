using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class CreateCashflowCommand : IRequest<CashflowDto>
    {
        public CashflowDto Cashflow { get; set; }
    }
}

