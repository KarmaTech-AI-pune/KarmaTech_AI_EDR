using MediatR;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintSubtaskCommand : IRequest<bool>
    {
        public int SubtaskId { get; set; }
    }
}

