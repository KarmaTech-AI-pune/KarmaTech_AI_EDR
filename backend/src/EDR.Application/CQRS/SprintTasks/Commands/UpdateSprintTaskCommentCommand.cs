using MediatR;
using EDR.Application.Dtos;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommentCommand : IRequest<bool>
    {
        public int CommentId { get; set; }
        public int Taskid { get; set; } // Changed to Taskid to match entity
        public string CommentText { get; set; }
        public string UpdatedBy { get; set; } // Added UpdatedBy
    }
}

