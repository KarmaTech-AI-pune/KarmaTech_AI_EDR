using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Domain.Database;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTaskCommentQueryHandler : IRequestHandler<GetSprintTaskCommentQuery, string?>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSprintTaskCommentQueryHandler> _logger;

        public GetSprintTaskCommentQueryHandler(ProjectManagementContext context, ILogger<GetSprintTaskCommentQueryHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string?> Handle(GetSprintTaskCommentQuery request, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(request.TaskId))
            {
                _logger.LogError("TaskId is null or empty in the request.");
                throw new ArgumentException("TaskId cannot be null or empty.");
            }

            _logger.LogInformation("Attempting to retrieve comment for SprintTask with ID: {TaskId}", request.TaskId);

            var sprintTask = await _context.SprintTasks
                                           .AsNoTracking()
                                           .Select(st => new { st.Taskid, st.Comments })
                                           .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (sprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for retrieving comment.", request.TaskId);
                return null;
            }

            _logger.LogInformation("Comment retrieved for SprintTask with ID {TaskId}.", request.TaskId);
            return sprintTask.Comments;
        }
    }
}
