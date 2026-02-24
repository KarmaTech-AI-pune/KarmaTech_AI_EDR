using MediatR;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class DeleteCashflowCommand : IRequest
    {
        public int Id { get; set; }
    }
}

