using MediatR;
using NJS.Application.CQRS.SprintTasks.Commands;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

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
            var subtaskDto = request.SprintSubtask;

            if (subtaskDto == null)
            {
                _logger.LogError("SprintSubtaskDto is null in the update request.");
                throw new ArgumentException("SprintSubtask data cannot be null.");
            }

            _logger.LogInformation("Attempting to update SprintSubtask with SubtaskId: {SubtaskId} and TaskId: {TaskId}", request.SubtaskId, request.TaskId);

            var subtask = await _context.SprintSubtasks
                                        .FirstOrDefaultAsync(s => s.SubtaskId == request.SubtaskId && s.Taskid == request.TaskId, cancellationToken);

            if (subtask == null)
            {
                _logger.LogWarning("SprintSubtask with SubtaskId: {SubtaskId} and TaskId: {TaskId} not found.", request.SubtaskId, request.TaskId);
                throw new ArgumentException($"SprintSubtask with ID {request.SubtaskId} and Task ID {request.TaskId} not found.");
            }

            // Update properties from DTO
            subtask.Subtaskkey = subtaskDto.Subtaskkey;
            subtask.Subtasktitle = subtaskDto.Subtasktitle;
            subtask.Subtaskdescription = subtaskDto.Subtaskdescription;
            subtask.Subtaskpriority = subtaskDto.Subtaskpriority;
            subtask.Subtaskstatus = subtaskDto.Subtaskstatus;
            subtask.SubtaskAssineid = subtaskDto.SubtaskAssineid;
            subtask.SubtaskAssigneeName = subtaskDto.SubtaskAssigneeName;
            subtask.SubtaskAssigneeAvatar = subtaskDto.SubtaskAssigneeAvatar;
            subtask.SubtaskReporterId = subtaskDto.SubtaskReporterId;
            subtask.SubtaskReporterName = subtaskDto.SubtaskReporterName;
            subtask.SubtaskReporterAvatar = subtaskDto.SubtaskReporterAvatar;
            subtask.Attachments = subtaskDto.Attachments;
            subtask.Subtaskcomments = subtaskDto.Subtaskcomments;
            subtask.SubtaskisExpanded = subtaskDto.SubtaskisExpanded;
            subtask.SubtaskcreatedDate = subtaskDto.SubtaskcreatedDate;
            subtask.SubtaskupdatedDate = subtaskDto.SubtaskupdatedDate;
            subtask.SubtaskType = subtaskDto.SubtaskType;
            // Taskid and TenantId should not be changed in an update based on current logic.

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("SprintSubtask with SubtaskId: {SubtaskId} and TaskId: {TaskId} updated successfully.", request.SubtaskId, request.TaskId);

            return Unit.Value;
        }
    }
}
