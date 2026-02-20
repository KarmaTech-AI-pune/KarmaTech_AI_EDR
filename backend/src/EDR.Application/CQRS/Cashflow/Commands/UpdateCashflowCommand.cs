using MediatR;
using EDR.Application.DTOs;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class UpdateCashflowCommand : IRequest<CashflowDto>
    {
        public int Id { get; set; }
        public CashflowDto Cashflow { get; set; }
    }
}

