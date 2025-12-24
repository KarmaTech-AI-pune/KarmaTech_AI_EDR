using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintSubtasks.Commands
{
    public class UpdateSprintSubtaskCommentCommand : IRequest<bool>
    {
        public int SubtaskCommentId { get; set; }
        public string Taskid { get; set; }
        public int SubtaskId { get; set; }
        public string CommentText { get; set; }
        public string UpdatedBy { get; set; }
    }
}
