using MediatR;
using NJS.Application.CQRS.SprintPlans.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace NJS.Application.CQRS.SprintPlans.Handlers
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
            var sprintPlanDto = request.SprintPlan;

            if (sprintPlanDto == null || !sprintPlanDto.SprintId.HasValue || sprintPlanDto.SprintId.Value == 0)
            {
                _logger.LogError("SprintPlanDto or SprintId is null or invalid in the request.");
                throw new ArgumentException("SprintPlan or SprintId cannot be null or invalid for update.");
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
            existingSprintPlan.SprintNumber = sprintPlanDto.SprintNumber;
            existingSprintPlan.StartDate = sprintPlanDto.StartDate;
            existingSprintPlan.EndDate = sprintPlanDto.EndDate;
            existingSprintPlan.SprintGoal = sprintPlanDto.SprintGoal;
            existingSprintPlan.ProjectId = sprintPlanDto.ProjectId.Value; // Cast to non-nullable int
            existingSprintPlan.RequiredSprintEmployees = sprintPlanDto.RequiredSprintEmployees;

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
