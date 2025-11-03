using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
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
        private readonly ILogger<AddSprintTaskCommentCommandHandler> _logger;

        public AddSprintTaskCommentCommandHandler(ProjectManagementContext context, ILogger<AddSprintTaskCommentCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(AddSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.TaskId) || string.IsNullOrWhiteSpace(request.CommentText))
            {
                _logger.LogError("TaskId or CommentText is null or empty in the request.");
                throw new ArgumentException("TaskId and CommentText cannot be null or empty.");
            }

            _logger.LogInformation("Attempting to add comment to SprintTask with ID: {TaskId}", request.TaskId);

            var existingSprintTask = await _context.SprintTasks
                                                   .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (existingSprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for adding comment.", request.TaskId);
                return false;
            }

            // Append new comment to existing comments, or set as first comment
            if (string.IsNullOrWhiteSpace(existingSprintTask.Comments))
            {
                existingSprintTask.Comments = $"{request.CreatedBy} ({DateTime.UtcNow}): {request.CommentText}";
            }
            else
            {
                existingSprintTask.Comments += Environment.NewLine + $"{request.CreatedBy} ({DateTime.UtcNow}): {request.CommentText}";
            }

            existingSprintTask.TaskupdatedDate = DateTime.UtcNow; // Update the task's last modified date

            _context.SprintTasks.Update(existingSprintTask);
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            if (changesSaved > 0)
            {
                _logger.LogInformation("Comment added successfully to SprintTask with ID {TaskId}. Changes saved: {Changes}", request.TaskId, changesSaved);
                return true;
            }
            else
            {
                _logger.LogWarning("No changes were saved for SprintTask with ID {TaskId} after attempting to add comment.", request.TaskId);
                return false;
            }
        }
    }
}
