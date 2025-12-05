using MediatR;
using System;

namespace NJS.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommentCommand : IRequest<bool>
    {
        public int CommentId { get; set; }
    }
}
