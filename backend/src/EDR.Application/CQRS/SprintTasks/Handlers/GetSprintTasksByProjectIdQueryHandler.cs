using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.SprintTasks.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintTasksByProjectIdQueryHandler : IRequestHandler<GetSprintTasksByProjectIdQuery, IEnumerable<SprintTaskSummaryDto>>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSprintTasksByProjectIdQueryHandler> _logger;

        public GetSprintTasksByProjectIdQueryHandler(ProjectManagementContext context, ILogger<GetSprintTasksByProjectIdQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SprintTaskSummaryDto>> Handle(GetSprintTasksByProjectIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to retrieve SprintTasks for Project ID: {ProjectId}", request.ProjectId);

            var sprintTasks = await _context.SprintTasks
                                            .Include(st => st.SprintPlan) // Include SprintPlan to access ProjectId
                                            .Where(st => st.SprintPlan != null && st.SprintPlan.ProjectId == request.ProjectId && st.TenantId == (_context.TenantId ?? 0))
                                            .Select(st => new SprintTaskSummaryDto
                                            {
                                                Taskid = st.Taskid,
                                                TaskTitle = st.TaskTitle,
                                                StoryPoints = st.StoryPoints,
                                                TaskAssigneeName = st.TaskAssigneeName,
                                                Taskstatus = st.Taskstatus,
                                                Taskpriority = st.Taskpriority
                                            })
                                            .ToListAsync(cancellationToken);

            if (!sprintTasks.Any())
            {
                _logger.LogWarning("No SprintTasks found for Project ID {ProjectId}.", request.ProjectId);
            }
            else
            {
                _logger.LogInformation("Found {Count} SprintTasks for Project ID {ProjectId}.", sprintTasks.Count(), request.ProjectId);
            }

            return sprintTasks;
        }
    }
}

