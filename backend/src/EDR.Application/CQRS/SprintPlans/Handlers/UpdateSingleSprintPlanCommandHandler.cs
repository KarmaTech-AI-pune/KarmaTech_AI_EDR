using MediatR;
using EDR.Application.CQRS.SprintPlans.Commands;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EDR.Application.CQRS.SprintPlans.Handlers
{
    public class UpdateSingleSprintPlanCommandHandler : IRequestHandler<UpdateSingleSprintPlanCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<UpdateSingleSprintPlanCommandHandler> _logger;

        public UpdateSingleSprintPlanCommandHandler(ProjectManagementContext context, ILogger<UpdateSingleSprintPlanCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(UpdateSingleSprintPlanCommand request, CancellationToken cancellationToken)
        {
            if (request == null)
            {
                throw new ArgumentNullException(nameof(request));
            }

            var sprintPlanDto = request.SprintPlan;

            if (sprintPlanDto == null || !sprintPlanDto.SprintId.HasValue || sprintPlanDto.SprintId.Value == 0)
            {
                _logger.LogError("SprintPlanDto or SprintId is null or invalid in the request.");
                throw new ArgumentException("SprintPlan or SprintId cannot be null or invalid for update.");
            }

            if (!sprintPlanDto.ProjectId.HasValue)
            {
                _logger.LogError("ProjectId is null in the request. It is required for update.");
                throw new ArgumentException("ProjectId cannot be null for update.");
            }

            _logger.LogInformation("Attempting to update SprintPlan with ID: {SprintId}", sprintPlanDto.SprintId.Value);

            var existingSprintPlan = await _context.SprintPlans
                                                   .FirstOrDefaultAsync(sp => sp.SprintId == sprintPlanDto.SprintId.Value, cancellationToken);

            if (existingSprintPlan == null)
            {
                _logger.LogWarning("SprintPlan with ID {SprintId} not found for update.", sprintPlanDto.SprintId.Value);
                return false; // Or throw an exception, depending on desired behavior
            }

            // Update properties from DTO to entity
            // SprintNumber is automatically generated and should not be updated from DTO
            existingSprintPlan.StartDate = sprintPlanDto.StartDate;
            existingSprintPlan.EndDate = sprintPlanDto.EndDate;
            existingSprintPlan.SprintGoal = sprintPlanDto.SprintGoal;
            existingSprintPlan.ProjectId = sprintPlanDto.ProjectId.Value; // Cast to non-nullable int
            existingSprintPlan.RequiredSprintEmployees = sprintPlanDto.RequiredSprintEmployees;
            existingSprintPlan.SprintName = sprintPlanDto.SprintName;
            existingSprintPlan.PlannedStoryPoints = sprintPlanDto.PlannedStoryPoints;
            existingSprintPlan.ActualStoryPoints = sprintPlanDto.ActualStoryPoints;
            existingSprintPlan.Velocity = sprintPlanDto.Velocity;
            existingSprintPlan.Status = sprintPlanDto.Status;
            existingSprintPlan.StartedAt = sprintPlanDto.StartedAt;
            existingSprintPlan.CompletedAt = sprintPlanDto.CompletedAt;
            existingSprintPlan.CreatedAt = sprintPlanDto.CreatedAt;
            existingSprintPlan.UpdatedAt = sprintPlanDto.UpdatedAt;
            existingSprintPlan.TenantId = _context.TenantId ?? 0;

            // SprintTasks and SprintSubtasks are NOT handled by this API, as per requirement.

            _context.SprintPlans.Update(existingSprintPlan); // Mark entity as modified
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            if (changesSaved > 0)
            {
                _logger.LogInformation("SprintPlan with ID {SprintId} updated successfully. Changes saved: {Changes}", sprintPlanDto.SprintId.Value, changesSaved);
                return true;
            }
            else
            {
                _logger.LogWarning("No changes were saved for SprintPlan with ID {SprintId}. It might be that the data was identical.", sprintPlanDto.SprintId.Value);
                return false;
            }
        }
    }
}

