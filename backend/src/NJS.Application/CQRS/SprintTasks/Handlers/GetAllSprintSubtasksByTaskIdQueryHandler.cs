using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NJS.Application.CQRS.SprintTasks.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.SprintTasks.Handlers
{
    public class GetAllSprintSubtasksByTaskIdQueryHandler : IRequestHandler<GetAllSprintSubtasksByTaskIdQuery, IEnumerable<SprintSubtaskDto>>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetAllSprintSubtasksByTaskIdQueryHandler> _logger;

        public GetAllSprintSubtasksByTaskIdQueryHandler(ProjectManagementContext context, ILogger<GetAllSprintSubtasksByTaskIdQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<SprintSubtaskDto>> Handle(GetAllSprintSubtasksByTaskIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to retrieve all SprintSubtasks for Task ID: {TaskId}", request.TaskId);

            var subtasks = await _context.SprintSubtasks
                                         .Where(st => st.Taskid == request.TaskId)
                                         .Select(st => new SprintSubtaskDto
                                         {
                                             SubtaskId = st.SubtaskId,
                                             Subtaskkey = st.Subtaskkey,
                                             TenantId = st.TenantId,
                                             Subtasktitle = st.Subtasktitle,
                                             Subtaskdescription = st.Subtaskdescription,
                                             Subtaskpriority = st.Subtaskpriority,
                                             Subtaskstatus = st.Subtaskstatus,
                                             SubtaskAssineid = st.SubtaskAssineid,
                                             SubtaskAssigneeName = st.SubtaskAssigneeName,
                                             SubtaskAssigneeAvatar = st.SubtaskAssigneeAvatar,
                                             SubtaskReporterId = st.SubtaskReporterId,
                                             SubtaskReporterName = st.SubtaskReporterName,
                                             SubtaskReporterAvatar = st.SubtaskReporterAvatar,
                                             Attachments = st.Attachments,
                                             SubtaskisExpanded = st.SubtaskisExpanded,
                                             SubtaskcreatedDate = st.SubtaskcreatedDate,
                                             SubtaskupdatedDate = st.SubtaskupdatedDate,
                                             SubtaskType = st.SubtaskType,
                                             Taskid = st.Taskid
                                         })
                                         .ToListAsync(cancellationToken);

            if (!subtasks.Any())
            {
                _logger.LogWarning("No SprintSubtasks found for Task ID {TaskId}.", request.TaskId);
            }
            else
            {
                _logger.LogInformation("Found {Count} SprintSubtasks for Task ID {TaskId}.", subtasks.Count(), request.TaskId);
            }

            return subtasks;
        }
    }
}
