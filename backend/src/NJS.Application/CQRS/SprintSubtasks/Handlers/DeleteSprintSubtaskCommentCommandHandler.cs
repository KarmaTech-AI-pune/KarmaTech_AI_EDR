using MediatR;
using NJS.Application.CQRS.SprintSubtasks.Commands;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintSubtasks.Handlers
{
    public class DeleteSprintSubtaskCommentCommandHandler : IRequestHandler<DeleteSprintSubtaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public DeleteSprintSubtaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteSprintSubtaskCommentCommand request, CancellationToken cancellationToken)
        {
            var comment = await _context.SprintSubtaskComments
                                        .FirstOrDefaultAsync(c => c.SubtaskCommentId == request.SubtaskCommentId, cancellationToken);

            if (comment == null)
            {
                return false; // Comment not found
            }

            _context.SprintSubtaskComments.Remove(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
