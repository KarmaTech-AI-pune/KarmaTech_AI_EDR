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

            // Fetch the primary SprintPlan for the given project
            // Priority selection:
            // 1. First "Active" sprint (Status 1)
            // 2. First "Planned" sprint (Status 0)
            // 3. Last "Completed" sprint (Status 2) as fallback
            var sprintPlanEntity = await _context.SprintPlans
                .Include(sp => sp.SprintTasks)
                    .ThenInclude(st => st.Subtasks!)
                .Where(sp => sp.ProjectId == projectId)
                .OrderBy(sp => sp.Status == 1 ? 0 : (sp.Status == 0 ? 1 : 2))
                .ThenBy(sp => sp.SprintId) 
                .FirstOrDefaultAsync(cancellationToken);

            if (sprintPlanEntity == null)
            {
                return null; // No sprint plan found for this project
            }

            // Convert to DTO
            var projectScheduleDto = new ProjectScheduleDto
            {
                SprintId = sprintPlanEntity.SprintId,
                TenantId = sprintPlanEntity.TenantId,
                StartDate = sprintPlanEntity.StartDate,
                EndDate = sprintPlanEntity.EndDate,
                SprintGoal = sprintPlanEntity.SprintGoal,
                ProjectId = sprintPlanEntity.ProjectId,
                // RequiredSprintEmployees is not in SprintPlan entity, leaving as null
                SprintName = sprintPlanEntity.SprintName,
                PlannedStoryPoints = sprintPlanEntity.PlannedStoryPoints,
                ActualStoryPoints = sprintPlanEntity.ActualStoryPoints,
                Velocity = (int)sprintPlanEntity.Velocity, // Cast to int for ProjectScheduleDto
                Status = sprintPlanEntity.Status,
                StartedAt = sprintPlanEntity.StartedAt,
                CompletedAt = sprintPlanEntity.CompletedAt,
                CreatedAt = sprintPlanEntity.CreatedAt,
                UpdatedAt = sprintPlanEntity.UpdatedAt,
                Tasks = sprintPlanEntity.SprintTasks?.Select(t => new SprintTaskDto
                {
                    Taskid = t.Taskid,
                    TenantId = t.TenantId,
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
                    IsExpanded = t.IsExpanded,
                    TaskcreatedDate = t.TaskcreatedDate,
                    TaskupdatedDate = t.TaskupdatedDate,
                    SprintPlanId = t.SprintPlanId,
                    WbsPlanId = t.WbsPlanId,
                    SprintWbsPlanId = t.SprintWbsPlanId,
                    UserTaskId = t.UserTaskId,
                    AcceptanceCriteria = t.AcceptanceCriteria,
                    DisplayOrder = t.DisplayOrder,
                    EstimatedHours = t.EstimatedHours,
                    ActualHours = t.ActualHours,
                    RemainingHours = t.RemainingHours,
                    StartedAt = t.StartedAt,
                    CompletedAt = t.CompletedAt,
                    Subtasks = t.Subtasks?.Select(s => new SprintSubtaskDto
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
                        // Subtaskcomments = s.Subtaskcomments, // Removed as per payload
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
                }).ToList()
            };

            return projectScheduleDto;
        }
    }
}
