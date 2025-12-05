using MediatR;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class AddSprintTaskCommentCommandHandler : IRequestHandler<AddSprintTaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public AddSprintTaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AddSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            var sprintTask = await _context.SprintTasks.FindAsync(request.TaskId);
            if (sprintTask == null)
            {
                return false; // SprintTask not found
            }

            var comment = new SprintTaskComment
            {
                Taskid = request.TaskId,
                CommentText = request.CommentText,
                CreatedBy = request.CreatedBy,
                CreatedDate = DateTime.UtcNow,
                TenantId = _context.TenantId.Value // Assuming TenantId is available from context
            };

            _context.SprintTaskComments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
