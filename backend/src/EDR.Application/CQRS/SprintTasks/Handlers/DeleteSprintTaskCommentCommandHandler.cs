using MediatR;
using EDR.Application.CQRS.SprintTasks.Commands;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
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

            int taskId = comment.Taskid;
            _context.SprintTaskComments.Remove(comment);
            await _context.SaveChangesAsync(cancellationToken);

            // Recalculate and update TotalLoggedHours on the Task
            await UpdateTaskTotalLoggedHours(taskId, cancellationToken);

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

                var match = System.Text.RegularExpressions.Regex.Match(c.CommentText, @"logged ([\d.]+)h", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
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

