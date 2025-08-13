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
using NJS.Application.CQRS.TodoSchedules.Query;

namespace NJS.Application.CQRS.TodoSchedules.Handlers
{
    public class GetTodoScheduleQueryHandler : IRequestHandler<GetTodoScheduleQuery, TodoScheduleDto?>
    {
        private readonly ProjectManagementContext _context;

        public GetTodoScheduleQueryHandler(ProjectManagementContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<TodoScheduleDto> Handle(GetTodoScheduleQuery request, CancellationToken cancellationToken)
        {
            var projectId = request.ProjectId;

            // Retrieve todoProjectSchedule and related entities from the database
            var todoProjectSchedule = await _context.TodoProjectSchedules
                .Include(ps => ps.Project)
                    .ThenInclude(p => p.ProjectLead)
                .Include(ps => ps.Tasks!)
                    .ThenInclude(t => t.Activities)
                .Include(ps => ps.Tasks!)
                    .ThenInclude(t => t.AssignedTo)
                .FirstOrDefaultAsync(ps => ps.Project != null && ps.Project.Id == projectId, cancellationToken);

            if (todoProjectSchedule == null)
            {
                return null; // Or throw a NotFoundException
            }

            // Map the entity to the DTO
            var todoScheduleDto = new TodoScheduleDto
            {
                ProjectID = todoProjectSchedule.Project?.Id ?? 0,
                Date = todoProjectSchedule.Date,
                ProjectName = todoProjectSchedule.Project?.Title,
                Location = todoProjectSchedule.Project?.Location,
                WorkingHours = todoProjectSchedule.Project?.WorkingHours,
                ProjectLeadName = todoProjectSchedule.Project?.ProjectLead?.Name,
                ProjectLeadEmail = todoProjectSchedule.Project?.ProjectLead?.Email,
                Tasks = (todoProjectSchedule.Tasks ?? Enumerable.Empty<todoTask>())
                    .Select(t => new TodoTaskDto
                    {
                        TaskID = t.TaskID ?? 0,
                        ProjectID = todoProjectSchedule.Project?.Id ?? 0,
                        TimeSlot = t.TimeSlot,
                        Phase = t.Phase,
                        Cost = t.Cost,
                        CostImpact = t.CostImpact,
                        Activities = (t.Activities ?? Enumerable.Empty<TodoActivity>()).Select(a => new ActivityDto
                        {
                            ActivityID = a.Id,
                            TaskID = a.TaskId ?? 0,
                            Activity = a.Activity,
                            ActivityCost = a.ActivityCost
                        }).ToList(),
                        AssignedTo = (t.AssignedTo ?? Enumerable.Empty<TodoAssignedTo>()).Select(a => new AssignedToDto
                        {
                            AssigneeID = a.Id,
                            TaskID = a.TaskId ?? 0,
                            AssigneeName = a.Name
                        }).ToList()
                    }).ToList()
            };

            return todoScheduleDto;
        }
    }
}
