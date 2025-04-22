using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Commands
{
    public record CreateWBSTaskCommand : IRequest<int>
    {
        public WBSTaskDto WBSTask { get; init; }

        public CreateWBSTaskCommand(WBSTaskDto wbsTask)
        {
            WBSTask = wbsTask;
        }
    }
}
