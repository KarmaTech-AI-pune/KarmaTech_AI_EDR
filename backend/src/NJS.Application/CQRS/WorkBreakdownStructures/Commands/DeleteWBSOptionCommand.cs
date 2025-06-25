using MediatR;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    public class DeleteWBSOptionCommand : IRequest<bool>
    {
        public int Id { get; set; }
    }
}
