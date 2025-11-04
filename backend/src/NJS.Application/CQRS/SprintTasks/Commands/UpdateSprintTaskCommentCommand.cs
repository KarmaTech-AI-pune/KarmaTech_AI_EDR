using MediatR;
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class UpdateSprintTaskCommentCommand : IRequest<bool>
    {
        public int CommentId { get; set; }
        public string Taskid { get; set; } // Changed to Taskid to match entity
        public string CommentText { get; set; }
        public string UpdatedBy { get; set; } // Added UpdatedBy
    }
}
