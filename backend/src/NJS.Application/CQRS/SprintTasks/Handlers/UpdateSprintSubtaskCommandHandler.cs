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
    public class UpdateSprintSubtaskCommandHandler : IRequestHandler<UpdateSprintSubtaskCommand, Unit>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<UpdateSprintSubtaskCommandHandler> _logger;

        public UpdateSprintSubtaskCommandHandler(ProjectManagementContext context, ILogger<UpdateSprintSubtaskCommandHandler> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Unit> Handle(UpdateSprintSubtaskCommand request, CancellationToken cancellationToken)
        {
            var sprintSubtaskDto = request.SprintSubtask;

            if (sprintSubtaskDto == null || sprintSubtaskDto.SubtaskId <= 0)
            {
                _logger.LogError("SprintSubtaskDto or SubtaskId is invalid in the request.");
                throw new ArgumentException("SprintSubtask or SubtaskId cannot be null or invalid for update.");
            }

            var existingSubtask = await _context.SprintSubtasks
                                                .FirstOrDefaultAsync(st => st.SubtaskId == sprintSubtaskDto.SubtaskId && st.Taskid == request.TaskId, cancellationToken);

            if (existingSubtask == null)
            {
                _logger.LogWarning("SprintSubtask with ID {SubtaskId} and Task ID {TaskId} not found for update.", sprintSubtaskDto.SubtaskId, request.TaskId);
                return Unit.Value; // Or throw NotFoundException
            }

            // Update properties from DTO to entity - using null-coalescing to preserve existing data if DTO field is null
            existingSubtask.Subtaskkey = sprintSubtaskDto.Subtaskkey ?? existingSubtask.Subtaskkey;
            existingSubtask.Subtasktitle = sprintSubtaskDto.Subtasktitle ?? existingSubtask.Subtasktitle;
            existingSubtask.Subtaskdescription = sprintSubtaskDto.Subtaskdescription ?? existingSubtask.Subtaskdescription;
            existingSubtask.Subtaskpriority = sprintSubtaskDto.Subtaskpriority ?? existingSubtask.Subtaskpriority;
            existingSubtask.Subtaskstatus = sprintSubtaskDto.Subtaskstatus ?? existingSubtask.Subtaskstatus;
            existingSubtask.SubtaskAssineid = sprintSubtaskDto.SubtaskAssineid ?? existingSubtask.SubtaskAssineid;
            existingSubtask.SubtaskAssigneeName = sprintSubtaskDto.SubtaskAssigneeName ?? existingSubtask.SubtaskAssigneeName;
            existingSubtask.SubtaskAssigneeAvatar = sprintSubtaskDto.SubtaskAssigneeAvatar ?? existingSubtask.SubtaskAssigneeAvatar;
            existingSubtask.SubtaskReporterId = sprintSubtaskDto.SubtaskReporterId ?? existingSubtask.SubtaskReporterId;
            existingSubtask.SubtaskReporterName = sprintSubtaskDto.SubtaskReporterName ?? existingSubtask.SubtaskReporterName;
            existingSubtask.SubtaskReporterAvatar = sprintSubtaskDto.SubtaskReporterAvatar ?? existingSubtask.SubtaskReporterAvatar;
            existingSubtask.Attachments = sprintSubtaskDto.Attachments ?? existingSubtask.Attachments;
            existingSubtask.SubtaskisExpanded = sprintSubtaskDto.SubtaskisExpanded ?? existingSubtask.SubtaskisExpanded;
            existingSubtask.SubtaskupdatedDate = DateTime.UtcNow;
            existingSubtask.SubtaskType = sprintSubtaskDto.SubtaskType ?? existingSubtask.SubtaskType;
            existingSubtask.TenantId = _context.TenantId ?? 0;
            existingSubtask.DisplayOrder = sprintSubtaskDto.DisplayOrder ?? existingSubtask.DisplayOrder;
            existingSubtask.EstimatedHours = sprintSubtaskDto.EstimatedHours ?? existingSubtask.EstimatedHours;
            existingSubtask.ActualHours = sprintSubtaskDto.ActualHours ?? existingSubtask.ActualHours;
            existingSubtask.StartedAt = sprintSubtaskDto.StartedAt ?? existingSubtask.StartedAt;
            existingSubtask.CompletedAt = sprintSubtaskDto.CompletedAt ?? existingSubtask.CompletedAt;
            // Taskid is part of the composite key and should not be changed here.

            var changesSaved = await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintSubtask with ID {SubtaskId} updated successfully. Changes saved: {Changes}", existingSubtask.SubtaskId, changesSaved);

            return Unit.Value;
        }
    }
}
