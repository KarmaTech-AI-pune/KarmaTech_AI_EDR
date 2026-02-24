using MediatR;
using System;

namespace EDR.Application.CQRS.SprintTasks.Commands
{
    public class DeleteSprintTaskCommentCommand : IRequest<bool>
    {
        public int CommentId { get; set; }
    }
}

