using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintSubtaskCommand : IRequest<Unit>
    {
        public int SubtaskId { get; set; }
        public string TaskId { get; set; } = string.Empty;
        public SprintSubtaskDto SprintSubtask { get; set; } = new SprintSubtaskDto();
    }
}
