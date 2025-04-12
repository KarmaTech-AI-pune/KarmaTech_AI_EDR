using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    public class GetWBSTasksQueryHandler : IRequestHandler<GetWBSTasksQuery, List<WBSTaskDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetWBSTasksQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<WBSTaskDto>> Handle(GetWBSTasksQuery request, CancellationToken cancellationToken)
        {
            // Fetch all WBS tasks for the given project, including child tasks and related data
            var wbsTasks = await _context.WBSTasks
                .Where(t => t.WorkBreakdownStructure.ProjectId == request.ProjectId && !t.IsDeleted)
                .Include(t => t.WorkBreakdownStructure)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.MonthlyHours)
                .ToListAsync(cancellationToken);

            // Convert to hierarchical DTO structure
            return ConvertToHierarchicalDto(wbsTasks);
        }

        private List<WBSTaskDto> ConvertToHierarchicalDto(List<WBSTask> tasks)
        {
            // Create a dictionary of tasks by their ID for easy lookup
            // Create flat list of DTOs that match the current WBSTaskDto structure
            var taskDtos = tasks.Select(t => new WBSTaskDto
            {
                Id = t.Id,
                WorkBreakdownStructureId = t.WorkBreakdownStructureId,
                Title = t.Title,
                Description = t.Description,
                Level = (WBSTaskLevel)t.Level,
                ParentId = t.ParentId,
                StartDate = t.StartDate,
                EndDate = t.EndDate,
                TaskType = t.TaskType,
                AssignedUserId = t.UserWBSTasks?.FirstOrDefault()?.UserId,
                AssignedUserName = t.UserWBSTasks?.FirstOrDefault()?.User?.Name,
                CostRate = t.UserWBSTasks?.FirstOrDefault()?.CostRate ?? 0,
                ODCCost = t.UserWBSTasks?.FirstOrDefault()?.ODCCost ?? 0,
                ODCHours = t.UserWBSTasks?.FirstOrDefault()?.ODCHours ?? 0, // Added ODCHours mapping
                TotalHours = t.UserWBSTasks?.FirstOrDefault()?.TotalHours ?? 0,
                TotalCost = t.UserWBSTasks?.FirstOrDefault()?.TotalCost ?? 0,
                MonthlyHours = t.MonthlyHours?.Select(mh => new MonthlyHourDto
                {
                    Year = int.Parse(mh.Year),
                    Month = mh.Month,
                    PlannedHours = mh.PlannedHours
                }).ToList() ?? new List<MonthlyHourDto>(),
                DisplayOrder = t.DisplayOrder
            }).ToList();

            // Create a dictionary for easy lookup
            var taskDict = taskDtos.ToDictionary(t => t.Id);

            // Return all tasks (flat structure since WBSTaskDto doesn't have ChildTasks property)
            // The frontend can build the hierarchy using the ParentId property
            return taskDtos;
        }
    }
}
