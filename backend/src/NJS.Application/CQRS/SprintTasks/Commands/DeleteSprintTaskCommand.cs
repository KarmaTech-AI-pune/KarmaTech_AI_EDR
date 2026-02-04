using MediatR;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommand : IRequest<bool>
    {
        public int TaskId { get; set; }
    }
}
