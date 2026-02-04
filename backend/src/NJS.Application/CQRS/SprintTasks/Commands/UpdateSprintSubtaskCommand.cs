using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintSubtaskCommand : IRequest<Unit>
    {
        public int SubtaskId { get; set; }
        public int TaskId { get; set; }
        public SprintSubtaskDto SprintSubtask { get; set; } = new SprintSubtaskDto();
    }
}
