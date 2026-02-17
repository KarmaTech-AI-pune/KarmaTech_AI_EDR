using MediatR;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.SprintPlans.Queries;
using System.Linq;

namespace EDR.Application.CQRS.SprintPlans.Handlers
{
    public class GetNextSprintQueryHandler : IRequestHandler<GetNextSprintQuery, SprintPlanDto?>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetNextSprintQueryHandler> _logger;

        public GetNextSprintQueryHandler(ProjectManagementContext context, ILogger<GetNextSprintQueryHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SprintPlanDto?> Handle(GetNextSprintQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to find next sprint for Project {ProjectId} after Sprint {CurrentSprintId}", request.ProjectId, request.CurrentSprintId);

            // Logic: Find first sprint in the same project with ID > currentSprintId
            // Logic: Iterate sprints for the project in ascending SprintId order
            // Skip all sprints where Status == 1 (already completed)
            // Return the first sprint where Status == 0
            var nextSprintEntity = await _context.SprintPlans
                .Include(sp => sp.SprintTasks!)
                    .ThenInclude(st => st.Subtasks!)
                .Where(sp => sp.ProjectId == request.ProjectId && sp.Status == 0) // 0 = Not Completed
                .OrderBy(sp => sp.SprintId)
                .FirstOrDefaultAsync(cancellationToken);

            if (nextSprintEntity == null)
            {
                _logger.LogInformation("No subsequent sprint found for Project {ProjectId} after Sprint {CurrentSprintId}.", request.ProjectId, request.CurrentSprintId);
                return null;
            }

            _logger.LogInformation("Found next Sprint {NextSprintId} for Project {ProjectId}.", nextSprintEntity.SprintId, request.ProjectId);

            // Basic manual mapping to DTO (matching existing handlers)
            return new SprintPlanDto
            {
                SprintId = nextSprintEntity.SprintId,
                SprintName = nextSprintEntity.SprintName ?? $"Sprint {nextSprintEntity.SprintId}",
                StartDate = nextSprintEntity.StartDate,
                EndDate = nextSprintEntity.EndDate,
                Status = nextSprintEntity.Status,
                SprintGoal = nextSprintEntity.SprintGoal,
                ProjectId = nextSprintEntity.ProjectId ?? request.ProjectId,
                SprintTasks = nextSprintEntity.SprintTasks?.Select(t => new SprintTaskDto
                {
                    Taskid = t.Taskid,
                    TaskTitle = t.TaskTitle,
                    Taskstatus = t.Taskstatus,
                    StoryPoints = t.StoryPoints,
                    SprintPlanId = t.SprintPlanId,
                    SprintWbsPlanId = t.SprintWbsPlanId
                    // Add other fields if strictly necessary for initial load, 
                    // but typically Todolist fetches detailed issues separately.
                    // Keeping it minimal/safe for now or matching GetSingleSprintPlan behavior?
                    // Let's match GetSingleSprintPlan behavior roughly, or rely on frontend to fetch issues.
                    // The frontend code: `fetchIssuesForSprintAPI(nextSprint.sprintId)` does a full fetch.
                    // So returning the ID is the most critical part here.
                }).ToList() ?? new System.Collections.Generic.List<SprintTaskDto>()
            };
        }
    }
}

