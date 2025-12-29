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
using NJS.Application.Dtos;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class UpdateSprintTaskCommandHandler : IRequestHandler<UpdateSprintTaskCommand, bool>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<UpdateSprintTaskCommandHandler> _logger;

        public UpdateSprintTaskCommandHandler(ProjectManagementContext context, ILogger<UpdateSprintTaskCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<bool> Handle(UpdateSprintTaskCommand request, CancellationToken cancellationToken)
        {
            var sprintTaskInputDto = request.SprintTask;

            if (sprintTaskInputDto == null || !sprintTaskInputDto.Taskid.HasValue || sprintTaskInputDto.Taskid.Value <= 0)
            {
                _logger.LogError("SprintTaskInputDto or TaskId is invalid in the request.");
                throw new ArgumentException("SprintTask or TaskId cannot be null or invalid for update.");
            }

            var existingSprintTask = await _context.SprintTasks
                                                   .FirstOrDefaultAsync(st => st.Taskid == sprintTaskInputDto.Taskid.Value, cancellationToken);

            if (existingSprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for update.", sprintTaskInputDto.Taskid);
                return false;
            }

            // Update properties from DTO to entity - using null-coalescing to preserve existing data if DTO field is null
            existingSprintTask.TenantId = sprintTaskInputDto.TenantId != 0 ? sprintTaskInputDto.TenantId : existingSprintTask.TenantId;
            existingSprintTask.Taskkey = sprintTaskInputDto.Taskkey ?? existingSprintTask.Taskkey;
            existingSprintTask.TaskTitle = sprintTaskInputDto.TaskTitle ?? existingSprintTask.TaskTitle;
            existingSprintTask.Taskdescription = sprintTaskInputDto.Taskdescription ?? existingSprintTask.Taskdescription;
            existingSprintTask.TaskType = sprintTaskInputDto.TaskType ?? existingSprintTask.TaskType;
            existingSprintTask.Taskpriority = sprintTaskInputDto.Taskpriority ?? existingSprintTask.Taskpriority;
            existingSprintTask.TaskAssineid = sprintTaskInputDto.TaskAssineid ?? existingSprintTask.TaskAssineid;
            existingSprintTask.TaskAssigneeName = sprintTaskInputDto.TaskAssigneeName ?? existingSprintTask.TaskAssigneeName;
            existingSprintTask.TaskAssigneeAvatar = sprintTaskInputDto.TaskAssigneeAvatar ?? existingSprintTask.TaskAssigneeAvatar;
            existingSprintTask.TaskReporterId = sprintTaskInputDto.TaskReporterId ?? existingSprintTask.TaskReporterId;
            existingSprintTask.TaskReporterName = sprintTaskInputDto.TaskReporterName ?? existingSprintTask.TaskReporterName;
            existingSprintTask.TaskReporterAvatar = sprintTaskInputDto.TaskReporterAvatar ?? existingSprintTask.TaskReporterAvatar;
            existingSprintTask.Taskstatus = sprintTaskInputDto.Taskstatus ?? existingSprintTask.Taskstatus;
            existingSprintTask.StoryPoints = sprintTaskInputDto.StoryPoints ?? existingSprintTask.StoryPoints;
            existingSprintTask.Attachments = sprintTaskInputDto.Attachments ?? existingSprintTask.Attachments;
            existingSprintTask.IsExpanded = sprintTaskInputDto.IsExpanded ?? existingSprintTask.IsExpanded;
            existingSprintTask.TaskupdatedDate = DateTime.UtcNow;
            existingSprintTask.SprintPlanId = sprintTaskInputDto.SprintPlanId ?? existingSprintTask.SprintPlanId;
            existingSprintTask.WbsPlanId = sprintTaskInputDto.WbsPlanId ?? existingSprintTask.WbsPlanId;
            existingSprintTask.UserTaskId = sprintTaskInputDto.UserTaskId ?? existingSprintTask.UserTaskId;
            existingSprintTask.AcceptanceCriteria = sprintTaskInputDto.AcceptanceCriteria ?? existingSprintTask.AcceptanceCriteria;
            existingSprintTask.DisplayOrder = sprintTaskInputDto.DisplayOrder != 0 ? sprintTaskInputDto.DisplayOrder : existingSprintTask.DisplayOrder;
            existingSprintTask.EstimatedHours = sprintTaskInputDto.EstimatedHours != 0 ? sprintTaskInputDto.EstimatedHours : existingSprintTask.EstimatedHours;
            existingSprintTask.ActualHours = sprintTaskInputDto.ActualHours != 0 ? sprintTaskInputDto.ActualHours : existingSprintTask.ActualHours;
            existingSprintTask.RemainingHours = sprintTaskInputDto.RemainingHours != 0 ? sprintTaskInputDto.RemainingHours : existingSprintTask.RemainingHours;
            existingSprintTask.StartedAt = sprintTaskInputDto.StartedAt ?? existingSprintTask.StartedAt;
            existingSprintTask.CompletedAt = sprintTaskInputDto.CompletedAt ?? existingSprintTask.CompletedAt;

            // Note: Subtasks are intentionally not handled here as per the simplified input DTO.
            // If subtask updates are needed, a separate endpoint/command should be used.

            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintTask with ID {TaskId} updated successfully. Changes saved: {Changes}", existingSprintTask.Taskid, changesSaved);

            return changesSaved > 0;
        }
    }
}
