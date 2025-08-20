using MediatR;
using NJS.Application.DTOs;

namespace NJS.Application.CQRS.Cashflow.Commands
{
    public class UpdateCashflowCommand : IRequest<CashflowDto>
    {
        public int Id { get; set; }
        public CashflowDto Cashflow { get; set; }
    }
}
