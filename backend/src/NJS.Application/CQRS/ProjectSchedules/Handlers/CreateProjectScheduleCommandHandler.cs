using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.ProjectSchedules.Command;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;

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

            if (projectScheduleDto == null)
            {
                var emptyProject = new TodoNewProject();
                return await _projectScheduleRepository.CreateProjectSchedule(emptyProject);
            }

            var project = new TodoNewProject
            {
                ProjectName = projectScheduleDto.ProjectName,
                Description = projectScheduleDto.Description,
                StartDate = projectScheduleDto.StartDate,
                EndDate = projectScheduleDto.EndDate
            };

            if (projectScheduleDto.Tasks != null && projectScheduleDto.Tasks.Any())
            {
                project.Tasks = new List<TodoNewTask>();
                
                foreach (var taskDto in projectScheduleDto.Tasks.Where(t => t != null))
                {
                    var task = new TodoNewTask
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
                        Project = project
                    };

                    if (taskDto.Subtasks != null && taskDto.Subtasks.Any())
                    {
                        task.Subtasks = new List<TodoNewSubtask>();
                        
                        foreach (var subtaskDto in taskDto.Subtasks.Where(s => s != null))
                        {
                            var subtask = new TodoNewSubtask
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
                                SubtaskcreatedDate = subtaskDto.SubtaskcreatedDate,
                                SubtaskupdatedDate = subtaskDto.SubtaskupdatedDate,
                                SubtaskType = subtaskDto.SubtaskType,
                                Taskid = task.Taskid,
                                ParentTask = task
                            };
                            
                            task.Subtasks.Add(subtask);
                        }
                    }
                    
                    project.Tasks.Add(task);
                }
            }

            _context.TodoNewProjects.Add(project);
            await _context.SaveChangesAsync(cancellationToken);

            return project.ProjectId;
        }
    }
}
