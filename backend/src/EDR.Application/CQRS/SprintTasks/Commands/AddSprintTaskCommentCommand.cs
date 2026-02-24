using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class AddSprintTaskCommentCommand : IRequest<bool>
    {
        public int TaskId { get; set; }
        public string CommentText { get; set; }
        public string CreatedBy { get; set; }
    }
}

