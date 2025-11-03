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
    public class DeleteSprintTaskCommentCommandHandler : IRequestHandler<DeleteSprintTaskCommentCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<DeleteSprintTaskCommentCommandHandler> _logger;

        public DeleteSprintTaskCommentCommandHandler(ProjectManagementContext context, ILogger<DeleteSprintTaskCommentCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(DeleteSprintTaskCommentCommand request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.TaskId))
            {
                _logger.LogError("TaskId is null or empty in the request.");
                throw new ArgumentException("TaskId cannot be null or empty for deletion.");
            }

            _logger.LogInformation("Attempting to delete comment for SprintTask with ID: {TaskId}", request.TaskId);

            var existingSprintTask = await _context.SprintTasks
                                                   .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (existingSprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for deleting comment.", request.TaskId);
                return false;
            }

            // Clear the comment field
            existingSprintTask.Comments = null;
            existingSprintTask.TaskupdatedDate = DateTime.UtcNow; // Update the task's last modified date

            _context.SprintTasks.Update(existingSprintTask);
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            if (changesSaved > 0)
            {
                _logger.LogInformation("Comment deleted successfully for SprintTask with ID {TaskId}. Changes saved: {Changes}", request.TaskId, changesSaved);
                return true;
            }
            else
            {
                _logger.LogWarning("No changes were saved for SprintTask with ID {TaskId} after attempting to delete comment.", request.TaskId);
                return false;
            }
        }
    }
}
