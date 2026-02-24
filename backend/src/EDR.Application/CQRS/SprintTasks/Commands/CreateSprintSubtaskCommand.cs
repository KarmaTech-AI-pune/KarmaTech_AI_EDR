using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class CreateSprintSubtaskCommand : IRequest<int>
    {
        public SprintSubtaskDto? SprintSubtask { get; set; }
    }
}

