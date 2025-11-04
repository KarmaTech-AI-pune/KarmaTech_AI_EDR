using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class CreateSprintSubtaskCommand : IRequest<int>
    {
        public SprintSubtaskDto? SprintSubtask { get; set; }
    }
}
