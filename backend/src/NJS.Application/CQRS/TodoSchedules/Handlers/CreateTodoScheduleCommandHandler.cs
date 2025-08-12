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
                        foreach (var actDto in taskDto.Activities.Where(a => a != null))
                        {
                            (task.Activities ??= new List<TodoActivity>()).Add(new TodoActivity
                            {
                                Activity = actDto.Activity,
                                ActivityCost = actDto.ActivityCost
                            });
                        }
                    }

                    if (taskDto.AssignedTo != null && taskDto.AssignedTo.Any())
                    {
                        foreach (var asgDto in taskDto.AssignedTo.Where(a => a != null))
                        {
                            (task.AssignedTo ??= new List<TodoAssignedTo>()).Add(new TodoAssignedTo
                            {
                                Name = asgDto.AssigneeName
                            });
                        }
                    }

                    (todoProjectSchedule.Tasks ??= new List<todoTask>()).Add(task);
                }
            }

            // Repository returns the created Project Id for consistency with GET route by projectId
            int projectId = await _todoScheduleRepository.CreateTodoSchedule(todoProjectSchedule);

            return projectId;
        }
    }
}
