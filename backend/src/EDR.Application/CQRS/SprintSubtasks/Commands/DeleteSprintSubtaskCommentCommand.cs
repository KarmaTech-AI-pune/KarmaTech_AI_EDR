using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintSubtasks.Commands
{
    public class DeleteSprintSubtaskCommentCommand : IRequest<bool>
    {
        public int SubtaskCommentId { get; set; }
    }
}

