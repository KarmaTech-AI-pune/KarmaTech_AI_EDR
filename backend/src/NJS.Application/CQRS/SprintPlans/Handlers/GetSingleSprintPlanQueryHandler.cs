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
            _logger.LogInformation("Attempting to retrieve SprintPlan with ID: {SprintId}, ProjectId filter: {ProjectId}", request.SprintId, request.ProjectId);

            var sprintPlanEntity = await _context.SprintPlans
                .Include(sp => sp.SprintTasks!)
                    .ThenInclude(st => st.Subtasks!)
                .AsNoTracking()
                .FirstOrDefaultAsync(sp => sp.SprintId == request.SprintId, cancellationToken);

            if (sprintPlanEntity == null)
            {
                _logger.LogWarning("SprintPlan with ID {SprintId} not found.", request.SprintId);
                return null;
            }

            // Project validation: Ensure sprint belongs to the requested project
            if (request.ProjectId.HasValue && sprintPlanEntity.ProjectId != request.ProjectId.Value)
            {
                _logger.LogWarning(
                    "SprintPlan {SprintId} belongs to Project {ActualProjectId}, " +
                    "but was requested for Project {RequestedProjectId}. Returning null.",
                    request.SprintId,
                    sprintPlanEntity.ProjectId,
                    request.ProjectId.Value);
                return null;  // Treat as not found for security
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
                SprintName = sprintPlanEntity.SprintName,
                PlannedStoryPoints = sprintPlanEntity.PlannedStoryPoints,
                ActualStoryPoints = sprintPlanEntity.ActualStoryPoints,
                Velocity = sprintPlanEntity.Velocity,
                Status = sprintPlanEntity.Status,
                StartedAt = sprintPlanEntity.StartedAt,
                CompletedAt = sprintPlanEntity.CompletedAt,
                CreatedAt = sprintPlanEntity.CreatedAt,
                UpdatedAt = sprintPlanEntity.UpdatedAt,
                SprintTasks = sprintPlanEntity.SprintTasks?.Select(t => new SprintTaskDto
                {
                    Taskid = t.Taskid,
                    TenantId = t.TenantId,
                    Taskkey = t.Taskkey,
                    TaskTitle = t.TaskTitle,
                    Taskdescription = t.Taskdescription,
                    TaskType = t.TaskType,
                    Taskpriority = t.Taskpriority,
                    TaskAssineid = t.TaskAssineid,
                    TaskAssigneeName = t.TaskAssigneeName,
                    TaskAssigneeAvatar = t.TaskAssigneeAvatar,
                    TaskReporterId = t.TaskReporterId,
                    TaskReporterName = t.TaskReporterName,
                    TaskReporterAvatar = t.TaskReporterAvatar,
                    Taskstatus = t.Taskstatus,
                    StoryPoints = t.StoryPoints,
                    Attachments = t.Attachments,
                    IsExpanded = t.IsExpanded,
                    TaskcreatedDate = t.TaskcreatedDate,
                    TaskupdatedDate = t.TaskupdatedDate,
                    SprintPlanId = t.SprintPlanId,
                    WbsPlanId = t.WbsPlanId,
                    UserTaskId = t.UserTaskId,
                    AcceptanceCriteria = t.AcceptanceCriteria,
                    DisplayOrder = t.DisplayOrder,
                    EstimatedHours = t.EstimatedHours,
                    ActualHours = t.ActualHours,
                    RemainingHours = t.RemainingHours,
                    StartedAt = t.StartedAt,
                    CompletedAt = t.CompletedAt,
                    Subtasks = t.Subtasks?.Select(s => new SprintSubtaskDto
                    {
                        SubtaskId = s.SubtaskId,
                        Subtaskkey = s.Subtaskkey,
                        TenantId = s.TenantId,
                        Subtasktitle = s.Subtasktitle,
                        Subtaskdescription = s.Subtaskdescription,
                        Subtaskpriority = s.Subtaskpriority,
                        Subtaskstatus = s.Subtaskstatus,
                        SubtaskAssineid = s.SubtaskAssineid,
                        SubtaskAssigneeName = s.SubtaskAssigneeName,
                        SubtaskAssigneeAvatar = s.SubtaskAssigneeAvatar,
                        SubtaskReporterId = s.SubtaskReporterId,
                        SubtaskReporterName = s.SubtaskReporterName,
                        SubtaskReporterAvatar = s.SubtaskReporterAvatar,
                        Attachments = s.Attachments,
                        SubtaskisExpanded = s.SubtaskisExpanded,
                        SubtaskcreatedDate = s.SubtaskcreatedDate,
                        SubtaskupdatedDate = s.SubtaskupdatedDate,
                        SubtaskType = s.SubtaskType,
                        Taskid = s.Taskid,
                        DisplayOrder = s.DisplayOrder,
                        EstimatedHours = s.EstimatedHours,
                        ActualHours = s.ActualHours,
                        StartedAt = s.StartedAt,
                        CompletedAt = s.CompletedAt
                    }).ToList()
                }).ToList()
            };

            // Step 1 & 2: Get required employee count for the current sprint
            int requiredEmployees = sprintPlanEntity.RequiredSprintEmployees;

            if (requiredEmployees > 0)
            {
                // Step 3: Get all user IDs already assigned to previous sprints
                var previouslyAssignedUserIds = await _context.SprintPlans
                    .Where(sp => sp.SprintId < request.SprintId)
                    .OrderBy(sp => sp.SprintId)
                    .SelectMany(sp => _context.UserWBSTasks
                        .OrderBy(uwt => uwt.Id)
                        .Select(uwt => uwt.UserId)
                        .Take(sp.RequiredSprintEmployees)
                    )
                    .Distinct()
                    .ToListAsync(cancellationToken);

                // Step 4: Get available user IDs not assigned to previous sprints
                var availableUserWBSTasks = await _context.UserWBSTasks
                    .Where(uwt => !previouslyAssignedUserIds.Contains(uwt.UserId))
                    .OrderBy(uwt => uwt.Id)
                    .Take(requiredEmployees)
                    .Select(uwt => uwt.UserId)
                    .ToListAsync(cancellationToken);

                // Step 5: Get employee names for the selected user IDs
                var sprintEmployees = await _context.Users
                    .Where(u => availableUserWBSTasks.Contains(u.Id))
                    .Select(u => new SprintEmployeeDto
                    {
                        EmployeeId = u.Id,
                        EmployeeName = u.Name
                    })
                    .ToListAsync(cancellationToken);

                // Step 6: Combine these employee details and include them in the sprintEmployee array
                sprintPlanDto.SprintEmployee = sprintEmployees;
            }
            else
            {
                sprintPlanDto.SprintEmployee = new List<SprintEmployeeDto>();
            }

            return sprintPlanDto;
        }
    }
}
