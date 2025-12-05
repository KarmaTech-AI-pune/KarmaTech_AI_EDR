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
    public class CreateSprintTaskCommandHandler : IRequestHandler<CreateSprintTaskCommand, string>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<CreateSprintTaskCommandHandler> _logger;

        public CreateSprintTaskCommandHandler(ProjectManagementContext context, ILogger<CreateSprintTaskCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> Handle(CreateSprintTaskCommand request, CancellationToken cancellationToken)
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

            // Generate Taskid if not provided (e.g., "T-101")
            if (string.IsNullOrWhiteSpace(sprintTaskDto.Taskid))
            {
                var lastTaskId = await _context.SprintTasks
                                                .OrderByDescending(t => t.Taskid)
                                                .Select(t => t.Taskid)
                                                .FirstOrDefaultAsync(cancellationToken);

                int nextId = 1;
                if (lastTaskId != null && lastTaskId.StartsWith("T-") && int.TryParse(lastTaskId.Substring(2), out int numId))
                {
                    nextId = numId + 1;
                }
                sprintTaskDto.Taskid = $"T-{nextId}";
            }

            var sprintTask = new SprintTask
            {
                Taskid = sprintTaskDto.Taskid,
                TenantId = sprintTaskDto.TenantId,
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
                UserTaskId = sprintTaskDto.UserTaskId
            };

            await _context.SprintTasks.AddAsync(sprintTask, cancellationToken);
            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintTask saved successfully. New Task ID: {TaskId} for SprintPlan ID: {SprintPlanId}. Changes saved: {Changes}", sprintTask.Taskid, sprintTask.SprintPlanId, changesSaved);

            return sprintTask.Taskid;
        }
    }
}
