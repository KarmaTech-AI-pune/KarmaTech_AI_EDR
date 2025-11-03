using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.ProjectSchedules.Query;
using System.Linq;

namespace NJS.Application.CQRS.ProjectSchedules.Handlers
{
    public class GetProjectScheduleQueryHandler : IRequestHandler<GetProjectScheduleQuery, ProjectScheduleDto?>
    {
        private readonly ProjectManagementContext _context;

        public GetProjectScheduleQueryHandler(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<ProjectScheduleDto?> Handle(GetProjectScheduleQuery request, CancellationToken cancellationToken)
        {
            var projectId = request.ProjectId;

            // Check if project exists
            var projectExists = await _context.Projects
                .AnyAsync(p => p.Id == projectId, cancellationToken);

            if (!projectExists)
            {
                return null;
            }

            // Fetch all SprintPlans for the given project, including their SprintTasks and SprintSubtasks
            var sprintPlanEntities = await _context.SprintPlans
                .Include(sp => sp.SprintTasks)
                    .ThenInclude(st => st.Subtasks!)
                .Where(sp => sp.ProjectId == projectId)
                .ToListAsync(cancellationToken);

            if (!sprintPlanEntities.Any())
            {
                return null; // No sprint plans found for this project
            }

            // Convert to DTOs
            var sprintPlanDtos = sprintPlanEntities.Select(sprintPlanEntity => new SprintPlanDto
            {
                SprintId = sprintPlanEntity.SprintId,
                SprintNumber = sprintPlanEntity.SprintNumber,
                StartDate = sprintPlanEntity.StartDate,
                EndDate = sprintPlanEntity.EndDate,
                SprintGoal = sprintPlanEntity.SprintGoal,
                ProjectId = sprintPlanEntity.ProjectId,
                SprintTasks = sprintPlanEntity.SprintTasks.Select(t => new SprintTaskDto
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
                    Attachments = t.Attachments,
                    Comments = t.Comments,
                    IsExpanded = t.IsExpanded,
                    TaskcreatedDate = t.TaskcreatedDate,
                    TaskupdatedDate = t.TaskupdatedDate,
                    SprintPlanId = t.SprintPlanId,
                    WbsPlanId = t.WbsPlanId,
                    UserTaskId = t.UserTaskId,
                    Subtasks = t.Subtasks?.Select(s => new SprintSubtaskDto
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
                        Attachments = s.Attachments,
                        Subtaskcomments = s.Subtaskcomments,
                        SubtaskisExpanded = s.SubtaskisExpanded,
                        SubtaskcreatedDate = s.SubtaskcreatedDate,
                        SubtaskupdatedDate = s.SubtaskupdatedDate,
                        SubtaskType = s.SubtaskType,
                        Taskid = s.Taskid
                    }).ToList()
                }).ToList()
            }).ToList();

            var projectScheduleDto = new ProjectScheduleDto
            {
                SprintPlans = sprintPlanDtos
            };

            return projectScheduleDto;
        }
    }
}
