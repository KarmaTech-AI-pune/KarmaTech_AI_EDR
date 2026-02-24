using MediatR;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.SprintTasks.Commands; // Added this using directive
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
{
    public class DeleteSprintSubtaskCommandHandler : IRequestHandler<DeleteSprintSubtaskCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<DeleteSprintSubtaskCommandHandler> _logger;

        public DeleteSprintSubtaskCommandHandler(ProjectManagementContext context, ILogger<DeleteSprintSubtaskCommandHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> Handle(DeleteSprintSubtaskCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to delete SprintSubtask with ID: {SubtaskId}", request.SubtaskId);

            var subtask = await _context.SprintSubtasks.FindAsync(new object[] { request.SubtaskId }, cancellationToken);

            if (subtask == null)
            {
                _logger.LogWarning("SprintSubtask with ID {SubtaskId} not found.", request.SubtaskId);
                return false;
            }

            _context.SprintSubtasks.Remove(subtask);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintSubtask with ID {SubtaskId} deleted successfully.", request.SubtaskId);
            return true;
        }
    }
}

