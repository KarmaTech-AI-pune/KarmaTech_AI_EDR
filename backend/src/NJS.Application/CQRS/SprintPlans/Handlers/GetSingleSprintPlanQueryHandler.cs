using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintPlans.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintPlans.Handlers
{
    public class GetSingleSprintPlanQueryHandler : IRequestHandler<GetSingleSprintPlanQuery, SprintPlanDto?>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSingleSprintPlanQueryHandler> _logger;

        public GetSingleSprintPlanQueryHandler(ProjectManagementContext context, ILogger<GetSingleSprintPlanQueryHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<SprintPlanDto?> Handle(GetSingleSprintPlanQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to retrieve SprintPlan with ID: {SprintId}", request.SprintId);

            var sprintPlanEntity = await _context.SprintPlans
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.SprintId == request.SprintId, cancellationToken);

            if (sprintPlanEntity == null)
            {
                _logger.LogWarning("SprintPlan with ID {SprintId} not found.", request.SprintId);
                return null;
            }

            _logger.LogInformation("SprintPlan with ID {SprintId} found. Converting to DTO.", request.SprintId);

            // Convert to DTO
            var sprintPlanDto = new SprintPlanDto
            {
                SprintId = sprintPlanEntity.SprintId,
                SprintNumber = sprintPlanEntity.SprintNumber,
                StartDate = sprintPlanEntity.StartDate,
                EndDate = sprintPlanEntity.EndDate,
                SprintGoal = sprintPlanEntity.SprintGoal,
                ProjectId = sprintPlanEntity.ProjectId,
                SprintEmployee = sprintPlanEntity.SprintEmployee, // Map the new column
                // Tasks and Subtasks are not included as per the "SprintPlan table only" requirement
                SprintTasks = null
            };

            return sprintPlanDto;
        }
    }
}
