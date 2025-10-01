using MediatR;

namespace NJS.Application.CQRS.Cashflow.Commands
{
    public class DeleteCashflowCommand : IRequest
    {
        public int Id { get; set; }
    }
}
