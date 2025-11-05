using MediatR;
using NJS.Application.CQRS.SprintSubtasks.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.SprintSubtasks.Handlers
{
    public class AddSprintSubtaskCommentCommandHandler : IRequestHandler<AddSprintSubtaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;

        public AddSprintSubtaskCommentCommandHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(AddSprintSubtaskCommentCommand request, CancellationToken cancellationToken)
        {
            var sprintTask = await _context.SprintTasks.FindAsync(request.Taskid);
            if (sprintTask == null)
            {
                return false; // SprintTask not found
            }

            var sprintSubtask = await _context.SprintSubtasks.FindAsync(request.SubtaskId);
            if (sprintSubtask == null)
            {
                return false; // SprintSubtask not found
            }

            var comment = new SprintSubtaskComment
            {
                Taskid = request.Taskid,
                SubtaskId = request.SubtaskId,
                CommentText = request.CommentText,
                CreatedBy = request.CreatedBy,
                CreatedDate = DateTime.UtcNow,
                TenantId = _context.TenantId.Value // Assuming TenantId is available from context
            };

            _context.SprintSubtaskComments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}
