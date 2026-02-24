using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintSubtasks.Commands
{
    public class AddSprintSubtaskCommentCommand : IRequest<bool>
    {
        public int Taskid { get; set; }
        public int SubtaskId { get; set; }
        public string CommentText { get; set; }
        public string CreatedBy { get; set; }
    }
}

