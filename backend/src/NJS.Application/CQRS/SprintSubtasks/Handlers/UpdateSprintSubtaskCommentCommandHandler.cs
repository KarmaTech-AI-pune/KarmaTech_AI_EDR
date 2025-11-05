using MediatR;
using NJS.Application.CQRS.SprintSubtasks.Commands;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintSubtasks.Handlers
{
    public class UpdateSprintSubtaskCommentCommandHandler : IRequestHandler<UpdateSprintSubtaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public UpdateSprintSubtaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(UpdateSprintSubtaskCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintSubtaskComments
                                        .FirstOrDefaultAsync(c => c.SubtaskCommentId == request.SubtaskCommentId &&
                                                                  c.Taskid == request.Taskid &&
                                                                  c.SubtaskId == request.SubtaskId, cancellationToken);

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
