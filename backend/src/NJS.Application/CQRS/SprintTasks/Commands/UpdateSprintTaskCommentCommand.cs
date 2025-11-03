using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommentCommand : IRequest<bool>
    {
        public string TaskId { get; set; }
        public string CommentText { get; set; }
    }
}
