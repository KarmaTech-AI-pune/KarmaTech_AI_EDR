using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintSubtasks.Commands
{
    public class UpdateSprintSubtaskCommentCommand : IRequest<bool>
    {
        public int SubtaskCommentId { get; set; }
        public int Taskid { get; set; }
        public int SubtaskId { get; set; }
        public string CommentText { get; set; }
        public string UpdatedBy { get; set; }
    }
}

