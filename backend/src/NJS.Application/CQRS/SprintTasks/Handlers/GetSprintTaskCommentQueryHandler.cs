using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos; // Added for SprintTaskCommentDto
using NJS.Domain.Database; // Added for ProjectManagementContext
using System;
using System.Collections.Generic; // Added for List
using System.Linq; // Added for LINQ
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTaskCommentQueryHandler : IRequestHandler<GetSprintTaskCommentQuery, List<SprintTaskCommentDto>>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSprintTaskCommentQueryHandler> _logger;

        public GetSprintTaskCommentQueryHandler(ProjectManagementContext context, ILogger<GetSprintTaskCommentQueryHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<List<SprintTaskCommentDto>> Handle(GetSprintTaskCommentQuery request, CancellationToken cancellationToken)
        {
            if (request.TaskId <= 0)
            {
                _logger.LogError("TaskId is invalid in the request.");
                throw new ArgumentException("TaskId must be greater than zero.");
            }

            _logger.LogInformation("Attempting to retrieve comments for SprintTask with ID: {TaskId}", request.TaskId);

            var comments = await _context.SprintTaskComments
                                         .AsNoTracking()
                                         .Where(c => c.Taskid == request.TaskId)
                                         .Select(c => new SprintTaskCommentDto
                                         {
                                             CommentId = c.CommentId,
                                             Taskid = c.Taskid,
                                             CommentText = c.CommentText,
                                             CreatedBy = c.CreatedBy,
                                             CreatedDate = c.CreatedDate,
                                             UpdatedBy = c.UpdatedBy,
                                             UpdatedDate = c.UpdatedDate
                                         })
                                         .ToListAsync(cancellationToken);

            if (comments == null || !comments.Any())
            {
                _logger.LogWarning("No SprintTask comments found for Task ID {TaskId}.", request.TaskId);
                return new List<SprintTaskCommentDto>(); // Return empty list instead of null
            }

            _logger.LogInformation("Comments retrieved for SprintTask with ID {TaskId}. Count: {Count}", request.TaskId, comments.Count);
            return comments;
        }
    }
}
