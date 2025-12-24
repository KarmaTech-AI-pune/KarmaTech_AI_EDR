using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class AddSprintTaskCommentCommand : IRequest<bool>
    {
        public string TaskId { get; set; }
        public string CommentText { get; set; }
        public string CreatedBy { get; set; }
    }
}
