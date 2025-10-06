using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using NJS.Application.CQRS.ProjectSchedules.Command;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace NJS.Application.CQRS.ProjectSchedules.Handlers
{
    public class CreateProjectScheduleCommandHandler : IRequestHandler<CreateProjectScheduleCommand, int>
    {
        private readonly IProjectScheduleRepository _projectScheduleRepository;
        private readonly ProjectManagementContext _context;

        public CreateProjectScheduleCommandHandler(IProjectScheduleRepository projectScheduleRepository, ProjectManagementContext context)
        {
            _projectScheduleRepository = projectScheduleRepository ?? throw new ArgumentNullException(nameof(projectScheduleRepository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<int> Handle(CreateProjectScheduleCommand request, CancellationToken cancellationToken)
        {
            var projectScheduleDto = request.ProjectSchedule;

            if (projectScheduleDto?.SprintPlan == null || projectScheduleDto.SprintPlan.ProjectId == 0 || projectScheduleDto.SprintPlan.SprintTasks == null || !projectScheduleDto.SprintPlan.SprintTasks.Any())
            {
                throw new ArgumentException("SprintPlan, ProjectId, and SprintTasks cannot be null or empty in the request.");
            }

            var sprintPlanDto = projectScheduleDto.SprintPlan;
            var projectId = sprintPlanDto.ProjectId;

            // Check if the project exists
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId, cancellationToken);
            if (!projectExists)
            {
                throw new ArgumentException($"Project with ID {projectId} not found.");
            }

            try
            {
                // Create a new SprintPlan entity from the DTO
                var sprintPlan = new SprintPlan
                {
                    ProjectId = projectId,
                    SprintName = sprintPlanDto.SprintName ?? $"Sprint Plan for Project {projectId}",
                    SprintNumber = sprintPlanDto.SprintNumber,
                    StartDate = sprintPlanDto.StartDate,
                    EndDate = sprintPlanDto.EndDate,
                    SprintGoal = sprintPlanDto.SprintGoal,
                    Status = sprintPlanDto.Status ?? "Active",
                    CreatedDate = DateTime.UtcNow,
                    UpdatedDate = DateTime.UtcNow,
                    TenantId = _context.TenantId ?? 1
                };
                await _context.SprintPlans.AddAsync(sprintPlan, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken); // Save to get SprintPlanId

                var tasksToAdd = new List<SprintTask>();
                var subtasksToAdd = new List<SprintSubtask>();

                // Create SprintTask entities and their subtasks
                foreach (var taskDto in sprintPlanDto.SprintTasks.Where(t => t != null))
                {
                    var task = new SprintTask
                    {
                        Taskid = taskDto.Taskid,
                        Taskkey = taskDto.Taskkey,
                        TaskTitle = taskDto.TaskTitle,
                        Taskdescription = taskDto.Taskdescription,
                        TaskType = taskDto.TaskType,
                        Taskpriority = taskDto.Taskpriority,
                        TaskAssineid = taskDto.TaskAssineid,
                        TaskAssigneeName = taskDto.TaskAssigneeName,
                        TaskAssigneeAvatar = taskDto.TaskAssigneeAvatar,
                        TaskReporterId = taskDto.TaskReporterId,
                        TaskReporterName = taskDto.TaskReporterName,
                        TaskReporterAvatar = taskDto.TaskReporterAvatar,
                        Taskstatus = taskDto.Taskstatus,
                        StoryPoints = taskDto.StoryPoints,
                        Attachments = taskDto.Taskattachments,
                        Comments = taskDto.Taskcomments,
                        IsExpanded = taskDto.TaskisExpanded,
                        TaskcreatedDate = taskDto.TaskcreatedDate,
                        TaskupdatedDate = taskDto.TaskupdatedDate,
                        SprintPlanId = sprintPlan.SprintId, // Assign to the new SprintPlan
                        WbsPlanId = taskDto.WbsPlanId,
                        UserTaskId = taskDto.UserTaskId,
                        TenantId = _context.TenantId ?? 1
                    };
                    tasksToAdd.Add(task);

                    if (taskDto.Subtasks != null && taskDto.Subtasks.Any())
                    {
                        foreach (var subtaskDto in taskDto.Subtasks.Where(s => s != null))
                        {
                            var subtask = new SprintSubtask
                            {
                                Subtaskkey = subtaskDto.Subtaskkey,
                                Subtasktitle = subtaskDto.Subtasktitle,
                                Subtaskdescription = subtaskDto.Subtaskdescription,
                                Subtaskpriority = subtaskDto.Subtaskpriority,
                                Subtaskstatus = subtaskDto.Subtaskstatus,
                                SubtaskAssineid = subtaskDto.SubtaskAssineid,
                                SubtaskAssigneeName = subtaskDto.SubtaskAssigneeName,
                                SubtaskAssigneeAvatar = subtaskDto.SubtaskAssigneeAvatar,
                                SubtaskReporterId = subtaskDto.SubtaskReporterId,
                                SubtaskReporterName = subtaskDto.SubtaskReporterName,
                                SubtaskReporterAvatar = subtaskDto.SubtaskReporterAvatar,
                                Attachments = subtaskDto.Subtaskattachments,
                                Subtaskcomments = subtaskDto.Subtaskcomments,
                                SubtaskisExpanded = subtaskDto.SubtaskisExpanded,
                                SubtaskcreatedDate = subtaskDto.SubtaskcreatedDate,
                                SubtaskupdatedDate = subtaskDto.SubtaskupdatedDate,
                                SubtaskType = subtaskDto.SubtaskType,
                                Taskid = task.Taskid, // Set the foreign key to SprintTask
                                TenantId = _context.TenantId ?? 1
                            };
                            subtasksToAdd.Add(subtask);
                        }
                    }
                }

                await _context.SprintTasks.AddRangeAsync(tasksToAdd, cancellationToken);
                await _context.SprintSubtasks.AddRangeAsync(subtasksToAdd, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);

                // Log successful save
                Console.WriteLine($"Successfully saved project tasks for project {projectId} under SprintPlan {sprintPlan.SprintId}");

                return projectId;
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Error saving project tasks: {ex.Message}");
                throw;
            }
        }
    }
}
