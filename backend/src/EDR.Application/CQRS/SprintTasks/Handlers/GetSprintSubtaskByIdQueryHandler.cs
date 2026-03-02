using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.SprintTasks.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.SprintTasks.Handlers
{
    public class GetSprintSubtaskByIdQueryHandler : IRequestHandler<GetSprintSubtaskByIdQuery, SprintSubtaskDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<GetSprintSubtaskByIdQueryHandler> _logger;

        public GetSprintSubtaskByIdQueryHandler(ProjectManagementContext context, ILogger<GetSprintSubtaskByIdQueryHandler> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SprintSubtaskDto> Handle(GetSprintSubtaskByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Attempting to retrieve SprintSubtask with ID: {SubtaskId}", request.SubtaskId);

            var subtask = await _context.SprintSubtasks
                                        .Where(st => st.TenantId == (_context.TenantId ?? 0))
                                        .FirstOrDefaultAsync(st => st.SubtaskId == request.SubtaskId, cancellationToken);

            if (subtask == null)
            {
                _logger.LogWarning("SprintSubtask with ID {SubtaskId} not found.", request.SubtaskId);
                return null; // Or throw an exception, depending on desired error handling
            }

            var subtaskDto = new SprintSubtaskDto
            {
                SubtaskId = subtask.SubtaskId,
                Subtaskkey = subtask.Subtaskkey,
                TenantId = subtask.TenantId,
                Subtasktitle = subtask.Subtasktitle,
                Subtaskdescription = subtask.Subtaskdescription,
                Subtaskpriority = subtask.Subtaskpriority,
                Subtaskstatus = subtask.Subtaskstatus,
                SubtaskAssineid = subtask.SubtaskAssineid,
                SubtaskAssigneeName = subtask.SubtaskAssigneeName,
                SubtaskAssigneeAvatar = subtask.SubtaskAssigneeAvatar,
                SubtaskReporterId = subtask.SubtaskReporterId,
                SubtaskReporterName = subtask.SubtaskReporterName,
                SubtaskReporterAvatar = subtask.SubtaskReporterAvatar,
                Attachments = subtask.Attachments,
                SubtaskisExpanded = subtask.SubtaskisExpanded,
                SubtaskcreatedDate = subtask.SubtaskcreatedDate,
                SubtaskupdatedDate = subtask.SubtaskupdatedDate,
                SubtaskType = subtask.SubtaskType,
                Taskid = subtask.Taskid
            };

            _logger.LogInformation("SprintSubtask with ID {SubtaskId} found.", request.SubtaskId);
            return subtaskDto;
        }
    }
}


