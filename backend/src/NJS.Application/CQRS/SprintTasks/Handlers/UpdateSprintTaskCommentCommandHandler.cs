using MediatR;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class UpdateSprintTaskCommentCommandHandler : IRequestHandler<UpdateSprintTaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public UpdateSprintTaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintTaskComments
                                        .FirstOrDefaultAsync(c => c.CommentId == request.CommentId && c.Taskid == request.Taskid, cancellationToken);

            if (comment == null)
            {
                return false; // Comment not found
            }

            comment.CommentText = request.CommentText;
            comment.UpdatedBy = request.UpdatedBy;
            comment.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
