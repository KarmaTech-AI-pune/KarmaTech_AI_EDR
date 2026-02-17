using MediatR;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class DeleteWBSOptionCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}

