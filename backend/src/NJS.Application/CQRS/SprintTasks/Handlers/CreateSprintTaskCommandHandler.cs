using MediatR;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq;
using System.Collections.Generic;
using NJS.Application.Dtos; // Ensure this is included for DTOs

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class CreateSprintTaskCommandHandler : IRequestHandler<CreateSprintTaskCommand, int>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<CreateSprintTaskCommandHandler> _logger;

        public CreateSprintTaskCommandHandler(ProjectManagementContext context, ILogger<CreateSprintTaskCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<int> Handle(CreateSprintTaskCommand request, CancellationToken cancellationToken)
        {
            var sprintTaskDto = request.SprintTask;

            if (sprintTaskDto == null || string.IsNullOrWhiteSpace(sprintTaskDto.TaskTitle))
            {
                _logger.LogError("SprintTaskDto or TaskTitle is null or empty in the request.");
                throw new ArgumentException("SprintTask or TaskTitle cannot be null or empty.");
            }

            // Validate SprintPlanId if provided
            if (sprintTaskDto.SprintPlanId.HasValue && sprintTaskDto.SprintPlanId.Value != 0)
            {
                var sprintPlanExists = await _context.SprintPlans.AnyAsync(sp => sp.SprintId == sprintTaskDto.SprintPlanId.Value, cancellationToken);
                if (!sprintPlanExists)
                {
                    _logger.LogError("SprintPlan with ID {SprintPlanId} not found for SprintTask.", sprintTaskDto.SprintPlanId.Value);
                    throw new ArgumentException($"SprintPlan with ID {sprintTaskDto.SprintPlanId.Value} not found.");
                }
            }

            // Taskid is identity, no manual generation needed.

            var sprintTask = new SprintTask
            {
                // Taskid = sprintTaskDto.Taskid, // Identity column
                TenantId = _context.TenantId ?? 0,
                Taskkey = sprintTaskDto.Taskkey,
                TaskTitle = sprintTaskDto.TaskTitle,
                Taskdescription = sprintTaskDto.Taskdescription,
                TaskType = sprintTaskDto.TaskType,
                Taskpriority = sprintTaskDto.Taskpriority,
                TaskAssineid = sprintTaskDto.TaskAssineid,
                TaskAssigneeName = sprintTaskDto.TaskAssigneeName,
                TaskAssigneeAvatar = sprintTaskDto.TaskAssigneeAvatar,
                TaskReporterId = sprintTaskDto.TaskReporterId,
                TaskReporterName = sprintTaskDto.TaskReporterName,
                TaskReporterAvatar = sprintTaskDto.TaskReporterAvatar,
                Taskstatus = sprintTaskDto.Taskstatus,
                StoryPoints = sprintTaskDto.StoryPoints,
                Attachments = sprintTaskDto.Attachments,
                IsExpanded = sprintTaskDto.IsExpanded,
                TaskcreatedDate = DateTime.UtcNow,
                TaskupdatedDate = DateTime.UtcNow,
                SprintPlanId = sprintTaskDto.SprintPlanId,
                WbsPlanId = sprintTaskDto.WbsPlanId,
                SprintWbsPlanId = sprintTaskDto.SprintWbsPlanId,
                UserTaskId = sprintTaskDto.UserTaskId,
                AcceptanceCriteria = sprintTaskDto.AcceptanceCriteria,
                DisplayOrder = sprintTaskDto.DisplayOrder ?? 0,
                EstimatedHours = sprintTaskDto.EstimatedHours ?? 0,
                ActualHours = sprintTaskDto.ActualHours ?? 0,
                RemainingHours = sprintTaskDto.RemainingHours ?? 0,
                StartedAt = sprintTaskDto.StartedAt,
                CompletedAt = sprintTaskDto.CompletedAt
            };

            await _context.SprintTasks.AddAsync(sprintTask, cancellationToken);
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintTask saved successfully. New Task ID: {TaskId} for SprintPlan ID: {SprintPlanId}. Changes saved: {Changes}", sprintTask.Taskid, sprintTask.SprintPlanId, changesSaved);

            return sprintTask.Taskid;
        }
    }
}
