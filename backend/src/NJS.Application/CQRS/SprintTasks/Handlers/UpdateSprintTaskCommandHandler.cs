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

            if (sprintTaskInputDto == null || string.IsNullOrWhiteSpace(sprintTaskInputDto.Taskid))
            {
                _logger.LogError("SprintTaskInputDto or TaskId is null or empty in the request.");
                throw new ArgumentException("SprintTask or TaskId cannot be null or empty for update.");
            }

            var existingSprintTask = await _context.SprintTasks
                                                   .FirstOrDefaultAsync(st => st.Taskid == sprintTaskInputDto.Taskid, cancellationToken);

            if (existingSprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found for update.", sprintTaskInputDto.Taskid);
                return false;
            }

            // Update properties from DTO to entity
            existingSprintTask.TenantId = sprintTaskInputDto.TenantId;
            existingSprintTask.Taskkey = sprintTaskInputDto.Taskkey;
            existingSprintTask.TaskTitle = sprintTaskInputDto.TaskTitle;
            existingSprintTask.Taskdescription = sprintTaskInputDto.Taskdescription;
            existingSprintTask.TaskType = sprintTaskInputDto.TaskType;
            existingSprintTask.Taskpriority = sprintTaskInputDto.Taskpriority;
            existingSprintTask.TaskAssineid = sprintTaskInputDto.TaskAssineid;
            existingSprintTask.TaskAssigneeName = sprintTaskInputDto.TaskAssigneeName;
            existingSprintTask.TaskAssigneeAvatar = sprintTaskInputDto.TaskAssigneeAvatar;
            existingSprintTask.TaskReporterId = sprintTaskInputDto.TaskReporterId;
            existingSprintTask.TaskReporterName = sprintTaskInputDto.TaskReporterName;
            existingSprintTask.TaskReporterAvatar = sprintTaskInputDto.TaskReporterAvatar;
            existingSprintTask.Taskstatus = sprintTaskInputDto.Taskstatus;
            existingSprintTask.StoryPoints = sprintTaskInputDto.StoryPoints;
            existingSprintTask.Attachments = sprintTaskInputDto.Attachments;
            existingSprintTask.IsExpanded = sprintTaskInputDto.IsExpanded;
            existingSprintTask.TaskupdatedDate = DateTime.UtcNow;
            existingSprintTask.SprintPlanId = sprintTaskInputDto.SprintPlanId;
            existingSprintTask.WbsPlanId = sprintTaskInputDto.WbsPlanId;
            existingSprintTask.UserTaskId = sprintTaskInputDto.UserTaskId;
            existingSprintTask.AcceptanceCriteria = sprintTaskInputDto.AcceptanceCriteria;
            existingSprintTask.DisplayOrder = sprintTaskInputDto.DisplayOrder;
            existingSprintTask.EstimatedHours = sprintTaskInputDto.EstimatedHours;
            existingSprintTask.ActualHours = sprintTaskInputDto.ActualHours;
            existingSprintTask.RemainingHours = sprintTaskInputDto.RemainingHours;
            existingSprintTask.StartedAt = sprintTaskInputDto.StartedAt;
            existingSprintTask.CompletedAt = sprintTaskInputDto.CompletedAt;

            // Note: Subtasks are intentionally not handled here as per the simplified input DTO.
            // If subtask updates are needed, a separate endpoint/command should be used.

            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintTask with ID {TaskId} updated successfully. Changes saved: {Changes}", existingSprintTask.Taskid, changesSaved);

            return changesSaved > 0;
        }
    }
}
