using MediatR;
using EDR.Application.CQRS.SprintTasks.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
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

            // 1. Calculate sum from existing comments
            var existingComments = await _context.SprintTaskComments
                .Where(c => c.Taskid == request.TaskId)
                .Select(c => c.CommentText)
                .ToListAsync(cancellationToken);

            decimal total = 0;
            var regex = new Regex(@"logged ([\d.]+)h", RegexOptions.IgnoreCase);
            
            foreach (var text in existingComments)
            {
                if (string.IsNullOrEmpty(text)) continue;
                var m = regex.Match(text);
                if (m.Success && decimal.TryParse(m.Groups[1].Value, out decimal h))
                {
                    total += h;
                }
            }

            // 2. Add current log's hours
            var currentMatch = regex.Match(request.CommentText ?? "");
            if (currentMatch.Success && decimal.TryParse(currentMatch.Groups[1].Value, out decimal currentH))
            {
                total += currentH;
            }

            var comment = new SprintTaskComment
            {
                Taskid = request.TaskId,
                CommentText = request.CommentText,
                CreatedBy = request.CreatedBy,
                CreatedDate = DateTime.UtcNow,
                TenantId = _context.TenantId ?? 0,
                TotalLoggedHours = total // Point-in-time total
            };

            _context.SprintTaskComments.Add(comment);
            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }
    }
}

