using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Commands
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

