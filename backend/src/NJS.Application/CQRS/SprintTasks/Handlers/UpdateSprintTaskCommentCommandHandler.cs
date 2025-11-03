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
    public class UpdateSprintTaskCommentCommandHandler : IRequestHandler<UpdateSprintTaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<UpdateSprintTaskCommentCommandHandler> _logger;

        public UpdateSprintTaskCommentCommandHandler(ProjectManagementContext context, ILogger<UpdateSprintTaskCommentCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(UpdateSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.TaskId) || string.IsNullOrWhiteSpace(request.CommentText))
            {
                _logger.LogError("TaskId or CommentText is null or empty in the request.");
                throw new ArgumentException("TaskId and CommentText cannot be null or empty for update.");
            }

            _logger.LogInformation("Attempting to update comment for SprintTask with ID: {TaskId}", request.TaskId);

            var existingSprintTask = await _context.SprintTasks
                                                   .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (existingSprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for updating comment.", request.TaskId);
                return false;
            }

            // For simplicity, this update replaces the entire comment string.
            // A more complex solution would involve parsing, updating specific parts, or using a separate Comments table.
            existingSprintTask.Comments = request.CommentText;
            existingSprintTask.TaskupdatedDate = DateTime.UtcNow; // Update the task's last modified date

            _context.SprintTasks.Update(existingSprintTask);
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            if (changesSaved > 0)
            {
                _logger.LogInformation("Comment updated successfully for SprintTask with ID {TaskId}. Changes saved: {Changes}", request.TaskId, changesSaved);
                return true;
            }
            else
            {
                _logger.LogWarning("No changes were saved for SprintTask with ID {TaskId} after attempting to update comment.", request.TaskId);
                return false;
            }
        }
    }
}
