using MediatR;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommand : IRequest<bool>
    {
        public string TaskId { get; set; } = string.Empty;
    }
}
