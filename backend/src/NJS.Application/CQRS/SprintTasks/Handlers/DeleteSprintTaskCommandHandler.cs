using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class DeleteSprintTaskCommandHandler : IRequestHandler<DeleteSprintTaskCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<DeleteSprintTaskCommandHandler> _logger;

        public DeleteSprintTaskCommandHandler(ProjectManagementContext context, ILogger<DeleteSprintTaskCommandHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteSprintTaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to delete SprintTask with ID: {TaskId}", request.TaskId);

            var sprintTask = await _context.SprintTasks
                                           .Include(st => st.Subtasks) // Include related subtasks
                                           .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (sprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found.", request.TaskId);
                return false;
            }

            // Delete associated subtasks
            if (sprintTask.Subtasks != null && sprintTask.Subtasks.Any())
            {
                _context.SprintSubtasks.RemoveRange(sprintTask.Subtasks);
                _logger.LogInformation("Deleted {Count} subtasks for SprintTask with ID: {TaskId}", sprintTask.Subtasks.Count(), request.TaskId);
            }

            _context.SprintTasks.Remove(sprintTask);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintTask with ID {TaskId} and its subtasks deleted successfully.", request.TaskId);
            return true;
        }
    }
}
