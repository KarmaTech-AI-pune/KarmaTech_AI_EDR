using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintSubtasks.Commands
{
    public class DeleteSprintSubtaskCommentCommand : IRequest<bool>
    {
        public int SubtaskCommentId { get; set; }
    }
}
