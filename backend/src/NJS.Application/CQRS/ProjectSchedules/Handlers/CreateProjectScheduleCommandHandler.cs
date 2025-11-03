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
using Microsoft.Extensions.Logging; // Added for ILogger

namespace NJS.Application.CQRS.ProjectSchedules.Handlers
{
    public class CreateProjectScheduleCommandHandler : IRequestHandler<CreateProjectScheduleCommand, int>
    {
        private readonly IProjectScheduleRepository _projectScheduleRepository;
        private readonly ProjectManagementContext _context;
        private readonly ILogger<CreateProjectScheduleCommandHandler> _logger; // Declared ILogger

        public CreateProjectScheduleCommandHandler(IProjectScheduleRepository projectScheduleRepository, ProjectManagementContext context, ILogger<CreateProjectScheduleCommandHandler> logger) // Injected ILogger
        {
            _projectScheduleRepository = projectScheduleRepository ?? throw new ArgumentNullException(nameof(projectScheduleRepository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger)); // Assigned ILogger
        }

        public async Task<int> Handle(CreateProjectScheduleCommand request, CancellationToken cancellationToken)
        {
            var projectScheduleDto = request.ProjectSchedule;

            if (projectScheduleDto?.SprintPlans == null || !projectScheduleDto.SprintPlans.Any())
            {
                throw new ArgumentException("SprintPlans cannot be null or empty in the request.");
            }

            int firstProjectId = 0; // To store the ProjectId of the first sprint plan for return

            try
            {
                foreach (var sprintPlanDto in projectScheduleDto.SprintPlans)
                {
                    if (sprintPlanDto == null || sprintPlanDto.ProjectId == null || sprintPlanDto.SprintTasks == null || !sprintPlanDto.SprintTasks.Any())
                    {
                        throw new ArgumentException("Each SprintPlan, its ProjectId, and SprintTasks cannot be null or empty.");
                    }

                    var projectId = sprintPlanDto.ProjectId ?? 0; // Use null-coalescing operator

                    // Check if the project exists
                    _logger.LogInformation("Checking if Project with ID {ProjectId} exists for SprintPlan.", projectId);
                    var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId, cancellationToken);
                    if (!projectExists)
                    {
                        _logger.LogError("Project with ID {ProjectId} not found for SprintPlan. Throwing ArgumentException.", projectId);
                        throw new ArgumentException($"Project with ID {projectId} not found.");
                    }
                    _logger.LogInformation("Project with ID {ProjectId} exists for SprintPlan.", projectId);


                    if (firstProjectId == 0)
                    {
                        firstProjectId = projectId; // Store the first project ID
                    }

                    // Create a new SprintPlan entity from the DTO
                    var sprintPlan = new SprintPlan
                    {
                        ProjectId = projectId,
                        SprintNumber = sprintPlanDto.SprintNumber,
                        StartDate = sprintPlanDto.StartDate,
                        EndDate = sprintPlanDto.EndDate,
                        SprintGoal = sprintPlanDto.SprintGoal,
                        TenantId = _context.TenantId ?? 1
                    };
                    await _context.SprintPlans.AddAsync(sprintPlan, cancellationToken);
                    var sprintPlanChanges = await _context.SaveChangesAsync(cancellationToken); // Save to get SprintPlanId
                    _logger.LogInformation("SprintPlan saved successfully. New SprintPlan ID: {SprintPlanId} for Project ID: {ProjectId}. Changes saved: {Changes}", sprintPlan.SprintId, projectId, sprintPlanChanges);


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
                            Attachments = taskDto.Attachments,
                            Comments = taskDto.Comments,
                            IsExpanded = taskDto.IsExpanded,
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
                                    Attachments = subtaskDto.Attachments,
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
                    var taskSubtaskChanges = await _context.SaveChangesAsync(cancellationToken);

                    // Log successful save
                    _logger.LogInformation("Successfully saved SprintTasks and SprintSubtasks for SprintPlan {SprintPlanId} under Project {ProjectId}. Changes saved: {Changes}", sprintPlan.SprintId, projectId, taskSubtaskChanges);
                }

                return firstProjectId;
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, "Error saving project schedule for ProjectId {ProjectId}. Exception: {Message}", firstProjectId, ex.Message);
                throw;
            }
        }
    }
}
