using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Application.CQRS.ProjectSchedules.Query;

namespace NJS.Application.CQRS.ProjectSchedules.Handlers
{
    public class GetProjectScheduleQueryHandler : IRequestHandler<GetProjectScheduleQuery, ProjectTasksOnlyDto?>
    {
        private readonly ProjectManagementContext _context;

        public GetProjectScheduleQueryHandler(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<ProjectTasksOnlyDto?> Handle(GetProjectScheduleQuery request, CancellationToken cancellationToken)
        {
            var projectId = request.ProjectId;

            // Retrieve project and related entities from the database
            var project = await _context.TodoNewProjects
                .Include(p => p.Tasks!)
                    .ThenInclude(t => t.Subtasks!)
                .FirstOrDefaultAsync(p => p.ProjectId == projectId, cancellationToken);

            if (project == null)
            {
                return null; // Or throw a NotFoundException
            }

            // Map the entity to the DTO - Only return tasks, no project details
            var projectTasksDto = new ProjectTasksOnlyDto
            {
                Tasks = project.Tasks?.Select(t => new TodoNewTaskDto
                {
                    Taskid = t.Taskid,
                    Taskkey = t.Taskkey,
                    TaskTitle = t.TaskTitle,
                    Taskdescription = t.Taskdescription,
                    TaskType = t.TaskType,
                    Taskpriority = t.Taskpriority,
                    TaskAssineid = t.TaskAssineid,
                    TaskAssigneeName = t.TaskAssigneeName,
                    TaskAssigneeAvatar = t.TaskAssigneeAvatar,
                    TaskReporterId = t.TaskReporterId,
                    TaskReporterName = t.TaskReporterName,
                    TaskReporterAvatar = t.TaskReporterAvatar,
                    Taskstatus = t.Taskstatus,
                    StoryPoints = t.StoryPoints,
                    Taskattachments = t.Attachments,
                    Taskcomments = t.Comments,
                    TaskisExpanded = t.IsExpanded,
                    TaskcreatedDate = t.TaskcreatedDate,
                    TaskupdatedDate = t.TaskupdatedDate,
                    Subtasks = t.Subtasks?.Select(s => new TodoNewSubtaskDto
                    {
                        Subtaskkey = s.Subtaskkey,
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
                        Subtaskattachments = s.Attachments,
                        Subtaskcomments = s.Subtaskcomments,
                        SubtaskcreatedDate = s.SubtaskcreatedDate,
                        SubtaskupdatedDate = s.SubtaskupdatedDate,
                        SubtaskType = s.SubtaskType,
                        Taskid = s.Taskid,
                        SubtaskisExpanded = null
                    }).ToList()
                }).ToList()
            };

            return projectTasksDto;
        }
    }
}
