using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintSubtasks.Commands
{
    public class AddSprintSubtaskCommentCommand : IRequest<bool>
    {
        public string Taskid { get; set; }
        public int SubtaskId { get; set; }
        public string CommentText { get; set; }
        public string CreatedBy { get; set; }
    }
}
