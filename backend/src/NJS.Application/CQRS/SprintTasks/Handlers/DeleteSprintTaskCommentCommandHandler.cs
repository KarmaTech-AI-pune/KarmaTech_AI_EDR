using MediatR;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class DeleteSprintTaskCommentCommandHandler : IRequestHandler<DeleteSprintTaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public DeleteSprintTaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintTaskComments
                                        .FirstOrDefaultAsync(c => c.CommentId == request.CommentId, cancellationToken);

            if (comment == null)
            {
                return false; // Comment not found
            }

            _context.SprintTaskComments.Remove(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
