using MediatR;

namespace EDR.Application.CQRS.Cashflow.Commands
{
    public class DeleteCashflowCommand : IRequest<Unit>
    {
        public int Id { get; set; }
    }
}

