using MediatR;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.TodoSchedules.Command;
using NJS.Repositories.Interfaces;
using System.Collections.Generic;


namespace NJS.Application.CQRS.TodoSchedules.Handlers
{
    public class CreateTodoScheduleCommandHandler : IRequestHandler<CreateTodoScheduleCommand, int>
    {
        private readonly ITodoScheduleRepository _todoScheduleRepository;
        private readonly ProjectManagementContext _context;

        public CreateTodoScheduleCommandHandler(ITodoScheduleRepository todoScheduleRepository, ProjectManagementContext context)
        {
            _todoScheduleRepository = todoScheduleRepository ?? throw new ArgumentNullException(nameof(todoScheduleRepository));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<int> Handle(CreateTodoScheduleCommand request, CancellationToken cancellationToken)
        {
            var todoScheduleDto = request.TodoSchedule;

            // Allow completely optional payloads; if null, create an empty schedule row
            if (todoScheduleDto == null)
            {
                var emptySchedule = new todoProjectSchedule();
                return await _todoScheduleRepository.CreateTodoSchedule(emptySchedule);
            }

            var todoProjectLead = (string.IsNullOrWhiteSpace(todoScheduleDto.ProjectLeadName) && string.IsNullOrWhiteSpace(todoScheduleDto.ProjectLeadEmail))
                ? null
                : new todoProjectLead
                {
                    Name = todoScheduleDto.ProjectLeadName,
                    Email = todoScheduleDto.ProjectLeadEmail
                };

            var todoProject = (string.IsNullOrWhiteSpace(todoScheduleDto.ProjectName)
                               && string.IsNullOrWhiteSpace(todoScheduleDto.Location)
                               && string.IsNullOrWhiteSpace(todoScheduleDto.WorkingHours)
                               && todoProjectLead == null)
                ? null
                : new todoProject
                {
                    Title = todoScheduleDto.ProjectName,
                    Location = todoScheduleDto.Location,
                    WorkingHours = todoScheduleDto.WorkingHours,
                    ProjectLead = todoProjectLead
                };

            var todoProjectSchedule = new todoProjectSchedule
            {
                Date = todoScheduleDto.Date,
                Project = todoProject
            };

            if (todoScheduleDto.Tasks != null && todoScheduleDto.Tasks.Any())
            {
                foreach (var taskDto in todoScheduleDto.Tasks.Where(t => t != null))
                {
                    var task = new todoTask
                    {
                        TaskID = taskDto.TaskID,
                        TimeSlot = taskDto.TimeSlot,
                        Phase = taskDto.Phase,
                        Cost = taskDto.Cost,
                        CostImpact = taskDto.CostImpact,
                        ProjectSchedule = todoProjectSchedule
                    };

                    if (taskDto.Activities != null && taskDto.Activities.Any())
                    {
                        foreach (var activityDto in taskDto.Activities.Where(a => a != null))
                        {
                            var activity = new TodoActivity
                            {
                                Activity = activityDto.Activity,
                                ActivityCost = activityDto.ActivityCost
                            };
                            task.Activities ??= new List<TodoActivity>();
                            task.Activities.Add(activity);
                        }
                    }
                    todoProjectSchedule.Tasks ??= new List<todoTask>();
                    todoProjectSchedule.Tasks.Add(task);
                }
            }

            // Add Sprints, Phases, Activities to todoProject
            if (todoScheduleDto.Sprints != null && todoScheduleDto.Sprints.Any())
            {
                foreach (var sprintDto in todoScheduleDto.Sprints.Where(s => s != null))
                {
                    var sprint = new TodoSprint
                    {
                        SprintName = sprintDto.SprintName,
                        StartDate = sprintDto.StartDate,
                        EndDate = sprintDto.EndDate,
                        Project = todoProject
                    };

                    if (sprintDto.Phases != null && sprintDto.Phases.Any())
                    {
                        foreach (var phaseDto in sprintDto.Phases.Where(p => p != null))
                        {
                            var phase = new todoPhase
                            {
                                PhaseName = phaseDto.PhaseName,
                                Sprint = sprint
                            };

                            if (phaseDto.Activities != null && phaseDto.Activities.Any())
                            {
                                foreach (var phaseActivityDto in phaseDto.Activities.Where(pa => pa != null))
                                {
                                    var phaseActivity = new todoPhaseActivity
                                    {
                                        ActivityID = phaseActivityDto.ActivityID,
                                        Date = phaseActivityDto.Date,
                                        StartTime = phaseActivityDto.StartTime,
                                        EndTime = phaseActivityDto.EndTime,
                                        Phase = phase
                                    };

                                    if (phaseActivityDto.SubTasks != null && phaseActivityDto.SubTasks.Any())
                                    {
                                        foreach (var subTaskDto in phaseActivityDto.SubTasks.Where(st => st != null))
                                        {
                                            var subTask = new TodoSubTask
                                            {
                                                SubTaskID = subTaskDto.SubTaskID,
                                                Description = subTaskDto.Description
                                            };
                                            phaseActivity.SubTasks ??= new List<TodoSubTask>();
                                            phaseActivity.SubTasks.Add(subTask);
                                        }
                                    }
                                    phase.Activities ??= new List<todoPhaseActivity>();
                                    phase.Activities.Add(phaseActivity);
                                }
                            }
                            sprint.Phases ??= new List<todoPhase>();
                            sprint.Phases.Add(phase);
                        }
                    }
                    todoProject!.Sprints ??= new List<TodoSprint>();
                    todoProject.Sprints.Add(sprint);
                }
            }

            _context.TodoProjectSchedules.Add(todoProjectSchedule);
            await _context.SaveChangesAsync(cancellationToken);

            return todoProjectSchedule.Project?.Id ?? 0;
        }
    }
}
