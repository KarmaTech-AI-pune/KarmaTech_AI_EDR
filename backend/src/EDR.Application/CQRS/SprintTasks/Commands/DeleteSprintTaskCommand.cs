using MediatR;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommand : IRequest<bool>
    {
        public int TaskId { get; set; }
    }
}

