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
            try
            {
                if (request.ProjectSchedule == null || request.ProjectSchedule.ProjectId == null || request.ProjectSchedule.Tasks == null || !request.ProjectSchedule.Tasks.Any())
                {
                    throw new ArgumentException("ProjectSchedule, ProjectId, and Tasks cannot be null or empty in the request.");
                }

                var projectScheduleDto = request.ProjectSchedule;
                var projectId = projectScheduleDto.ProjectId ?? 0;

                // Check if the project exists
                _logger.LogInformation("Checking if Project with ID {ProjectId} exists for ProjectSchedule.", projectId);
                var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectId, cancellationToken);
                if (!projectExists)
                {
                    _logger.LogError("Project with ID {ProjectId} not found for ProjectSchedule. Throwing ArgumentException.", projectId);
                    throw new ArgumentException($"Project with ID {projectId} not found.");
                }
                _logger.LogInformation("Project with ID {ProjectId} exists for ProjectSchedule.", projectId);

                // Determine the next SprintNumber for the given ProjectId
                var maxSprintNumber = await _context.SprintPlans
                                                    .Where(sp => sp.ProjectId == projectId)
                                                    .Select(sp => sp.SprintNumber)
                                                    .MaxAsync(cancellationToken);

                var nextSprintNumber = (maxSprintNumber ?? 0) + 1;

                // Create a new SprintPlan entity from the DTO
                var sprintPlan = new SprintPlan
                {
                    SprintNumber = nextSprintNumber, // Automatically generated
                    ProjectId = projectId,
                    SprintName = projectScheduleDto.SprintName,
                    StartDate = projectScheduleDto.StartDate,
                    EndDate = projectScheduleDto.EndDate,
                    SprintGoal = projectScheduleDto.SprintGoal,
                    PlannedStoryPoints = projectScheduleDto.PlannedStoryPoints ?? 0,
                    ActualStoryPoints = projectScheduleDto.ActualStoryPoints ?? 0,
                    Velocity = projectScheduleDto.Velocity ?? 0,
                    Status = projectScheduleDto.Status ?? 0,
                    StartedAt = projectScheduleDto.StartedAt,
                    CompletedAt = projectScheduleDto.CompletedAt,
                    CreatedAt = projectScheduleDto.CreatedAt ?? DateTime.UtcNow,
                    UpdatedAt = projectScheduleDto.UpdatedAt,
                    TenantId = _context.TenantId ?? 0,
                    RequiredSprintEmployees = projectScheduleDto.RequiredSprintEmployees ?? 0
                };
                await _context.SprintPlans.AddAsync(sprintPlan, cancellationToken);
                var sprintPlanChanges = await _context.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("SprintPlan saved successfully. New SprintPlan ID: {SprintPlanId} for Project ID: {ProjectId}. Changes saved: {Changes}", sprintPlan.SprintId, projectId, sprintPlanChanges);

                var tasksToProcess = new List<SprintTask>();
                var subtasksToProcess = new List<SprintSubtask>();

                foreach (var taskDto in projectScheduleDto.Tasks.Where(t => t != null))
                {
                    // Create new task
                    var task = new SprintTask
                    {
                        // Taskid is Identity, let DB generate it
                        TenantId = _context.TenantId ?? 0,
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
                        IsExpanded = taskDto.IsExpanded,
                        TaskcreatedDate = taskDto.TaskcreatedDate ?? DateTime.UtcNow,
                        TaskupdatedDate = taskDto.TaskupdatedDate ?? DateTime.UtcNow,
                        SprintPlanId = sprintPlan.SprintId,
                        WbsPlanId = taskDto.WbsPlanId,
                        SprintWbsPlanId = taskDto.SprintWbsPlanId,
                        UserTaskId = taskDto.UserTaskId,
                        AcceptanceCriteria = taskDto.AcceptanceCriteria,
                        DisplayOrder = taskDto.DisplayOrder ?? 0,
                        EstimatedHours = taskDto.EstimatedHours ?? 0,
                        ActualHours = taskDto.ActualHours ?? 0,
                        RemainingHours = taskDto.RemainingHours ?? 0,
                        StartedAt = taskDto.StartedAt,
                        CompletedAt = taskDto.CompletedAt,
                    };

                    _context.SprintTasks.Add(task);
                    tasksToProcess.Add(task);

                    if (taskDto.Subtasks != null && taskDto.Subtasks.Any())
                    {
                        foreach (var subtaskDto in taskDto.Subtasks.Where(s => s != null))
                        {
                            // Create new subtask
                            var subtask = new SprintSubtask
                            {
                                Subtaskkey = subtaskDto.Subtaskkey,
                                TenantId = _context.TenantId ?? 0,
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
                                SubtaskisExpanded = subtaskDto.SubtaskisExpanded,
                                SubtaskcreatedDate = subtaskDto.SubtaskcreatedDate ?? DateTime.UtcNow,
                                SubtaskupdatedDate = subtaskDto.SubtaskupdatedDate ?? DateTime.UtcNow,
                                SubtaskType = subtaskDto.SubtaskType,
                                ParentTask = task, // Link to the new task
                                DisplayOrder = subtaskDto.DisplayOrder ?? 0,
                                EstimatedHours = subtaskDto.EstimatedHours ?? 0,
                                ActualHours = subtaskDto.ActualHours ?? 0,
                                StartedAt = subtaskDto.StartedAt,
                                CompletedAt = subtaskDto.CompletedAt,
                            };
                            _context.SprintSubtasks.Add(subtask);
                            subtasksToProcess.Add(subtask);
                        }
                    }
                }

                var taskSubtaskChanges = await _context.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Successfully saved SprintTasks and SprintSubtasks for SprintPlan {SprintPlanId} under Project {ProjectId}. Changes saved: {Changes}", sprintPlan.SprintId, projectId, taskSubtaskChanges);

                return projectId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving project schedule. Exception: {Message}", ex.Message);
                throw;
            }
        }
    }
}
