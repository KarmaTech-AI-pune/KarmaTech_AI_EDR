using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using EDR.Application.CQRS.SprintTasks.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
{
    public class GetSingleSprintTaskQueryHandler : IRequestHandler<GetSingleSprintTaskQuery, SprintTaskDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSingleSprintTaskQueryHandler> _logger;

        public GetSingleSprintTaskQueryHandler(ProjectManagementContext context, ILogger<GetSingleSprintTaskQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SprintTaskDto> Handle(GetSingleSprintTaskQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to retrieve SprintTask with ID: {TaskId}", request.TaskId);

            var sprintTask = await _context.SprintTasks
                                           .Include(st => st.Subtasks)
                                           .Where(st => st.TenantId == (_context.TenantId ?? 0))
                                           .FirstOrDefaultAsync(st => st.Taskid == request.TaskId, cancellationToken);

            if (sprintTask == null)
            {
                _logger.LogWarning("SprintTask with ID {TaskId} not found.", request.TaskId);
                return null; // Or throw an exception, depending on desired error handling
            }

            var sprintTaskDto = new SprintTaskDto
            {
                Taskid = sprintTask.Taskid,
                TenantId = sprintTask.TenantId,
                Taskkey = sprintTask.Taskkey,
                TaskTitle = sprintTask.TaskTitle,
                Taskdescription = sprintTask.Taskdescription,
                TaskType = sprintTask.TaskType,
                Taskpriority = sprintTask.Taskpriority,
                TaskAssineid = sprintTask.TaskAssineid,
                TaskAssigneeName = sprintTask.TaskAssigneeName,
                TaskAssigneeAvatar = sprintTask.TaskAssigneeAvatar,
                TaskReporterId = sprintTask.TaskReporterId,
                TaskReporterName = sprintTask.TaskReporterName,
                TaskReporterAvatar = sprintTask.TaskReporterAvatar,
                Taskstatus = sprintTask.Taskstatus,
                StoryPoints = sprintTask.StoryPoints,
                Attachments = sprintTask.Attachments,
                IsExpanded = sprintTask.IsExpanded,
                TaskcreatedDate = sprintTask.TaskcreatedDate,
                TaskupdatedDate = sprintTask.TaskupdatedDate,
                SprintPlanId = sprintTask.SprintPlanId,
                WbsPlanId = sprintTask.WbsPlanId,
                SprintWbsPlanId = sprintTask.SprintWbsPlanId,
                UserTaskId = sprintTask.UserTaskId,
                AcceptanceCriteria = sprintTask.AcceptanceCriteria,
                DisplayOrder = sprintTask.DisplayOrder,
                EstimatedHours = sprintTask.EstimatedHours,
                ActualHours = sprintTask.ActualHours,
                RemainingHours = sprintTask.RemainingHours,
                StartedAt = sprintTask.StartedAt,
                CompletedAt = sprintTask.CompletedAt,
                Subtasks = sprintTask.Subtasks?.Select(s => new SprintSubtaskDto
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
            };

            _logger.LogInformation("SprintTask with ID {TaskId} found.", request.TaskId);
            return sprintTaskDto;
        }
    }
}

