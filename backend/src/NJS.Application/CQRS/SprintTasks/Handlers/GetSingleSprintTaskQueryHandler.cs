using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
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
                UserTaskId = sprintTask.UserTaskId
            };

            _logger.LogInformation("SprintTask with ID {TaskId} found.", request.TaskId);
            return sprintTaskDto;
        }
    }
}
