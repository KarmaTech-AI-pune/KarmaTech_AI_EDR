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

            if (projectScheduleDto == null || projectScheduleDto.Tasks == null || !projectScheduleDto.Tasks.Any())
            {
                throw new ArgumentException("ProjectSchedule and Tasks cannot be null or empty");
            }

            // Check if the project exists
            var projectExists = await _context.Projects.AnyAsync(p => p.Id == projectScheduleDto.ProjectId, cancellationToken);
            if (!projectExists)
            {
                throw new ArgumentException($"Project with ID {projectScheduleDto.ProjectId} not found.");
            }

            try
            {
                var tasksToAdd = new List<SprintTask>();
                var subtasksToAdd = new List<SprintSubtask>();

                // Create SprintTask entities and their subtasks
                foreach (var taskDto in projectScheduleDto.Tasks.Where(t => t != null))
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
                        ProjectId = projectScheduleDto.ProjectId // Set the foreign key
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
                                Taskid = task.Taskid // Set the foreign key to SprintTask
                            };
                            subtasksToAdd.Add(subtask);
                        }
                    }
                }

                await _context.SprintTasks.AddRangeAsync(tasksToAdd, cancellationToken);
                await _context.SprintSubtasks.AddRangeAsync(subtasksToAdd, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);
                
                // Log successful save
                Console.WriteLine($"Successfully saved project tasks for project {projectScheduleDto.ProjectId}");
                
                return projectScheduleDto.ProjectId;
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
