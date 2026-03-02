using MediatR;
using EDR.Application.CQRS.SprintTasks.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
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
                TenantId = _context.TenantId ?? 0 // Securely assign TenantId
            };

            _context.SprintTaskComments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

