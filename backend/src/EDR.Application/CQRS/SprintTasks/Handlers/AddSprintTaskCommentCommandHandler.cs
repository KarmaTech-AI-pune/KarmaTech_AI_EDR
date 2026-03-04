using MediatR;
using EDR.Application.CQRS.SprintTasks.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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

            // Recalculate and update TotalLoggedHours on the Task
            await UpdateTaskTotalLoggedHours(request.TaskId, cancellationToken);

            return true;
        }

        private async Task UpdateTaskTotalLoggedHours(int taskId, CancellationToken cancellationToken)
        {
            var sprintTask = await _context.SprintTasks.FindAsync(new object[] { taskId }, cancellationToken);
            if (sprintTask == null) return;

            var comments = await _context.SprintTaskComments
                .Where(c => c.Taskid == taskId)
                .ToListAsync(cancellationToken);

            decimal total = 0;
            foreach (var c in comments)
            {
                if (string.IsNullOrEmpty(c.CommentText)) continue;

                // Match "logged 2h" or "logged 2.5h" (case insensitive)
                var match = Regex.Match(c.CommentText, @"logged ([\d.]+)h", RegexOptions.IgnoreCase);
                if (match.Success && decimal.TryParse(match.Groups[1].Value, out decimal hours))
                {
                    total += hours;
                }
            }

            sprintTask.TotalLoggedHours = total;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

