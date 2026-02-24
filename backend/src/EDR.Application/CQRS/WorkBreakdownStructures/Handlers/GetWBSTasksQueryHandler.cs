using MediatR;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.WorkBreakdownStructures.Queries;
using EDR.Application.Dtos;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.Domain.Enums;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.WorkBreakdownStructures.Handlers
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
                .Include(t => t.WorkBreakdownStructure)
                    .ThenInclude(wbs => wbs.WBSHeader) // Eagerly load WBSHeader
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.User)
                .Include(t => t.UserWBSTasks)
                    .ThenInclude(ut => ut.ResourceRole)
                .Include(t => t.PlannedHours)
                .Where(t => t.WorkBreakdownStructure.WBSHeader.ProjectId == request.ProjectId && t.WorkBreakdownStructure.WBSHeader.IsActive && !t.IsDeleted)
                .ToListAsync(cancellationToken);

            // Convert to hierarchical DTO structure
            return ConvertToHierarchicalDto(wbsTasks);
        }

        private List<WBSTaskDto> ConvertToHierarchicalDto(List<WBSTask> tasks)
        {
            // Pre-fetch all WBS options to avoid N+1 queries
            var wbsOptions = _context.WBSOptions.ToList();

            // Create a dictionary of tasks by their ID for easy lookup
                // Create flat list of DTOs that match the current WBSTaskDto structure
                var taskDtos = tasks.Select(t => {
                    string displayTitle = t.Title;
                    // Attempt to find WBSOption Label based on the stored WBSOptionId
                    if (t.WBSOptionId > 0)
                    {
                        var wbsOption = wbsOptions.FirstOrDefault(o => o.Id == t.WBSOptionId);
                        if (wbsOption != null)
                        {
                            displayTitle = wbsOption.Label;
                        }
                    }

                    return new WBSTaskDto
                    {
                        Id = t.Id,
                        WorkBreakdownStructureId = t.WorkBreakdownStructureId,
                        Title = displayTitle, // Display the label
                        Description = t.Description,
                        Level = (WBSTaskLevel)t.Level,
                        StartDate = t.StartDate,
                        EndDate = t.EndDate,
                        TaskType = t.TaskType,
                        WBSOptionId = t.WBSOptionId, // Added WBSOptionId
                        WBSOptionLabel = t.WBSOption?.Label, // Added WBSOptionLabel

                        // For Manpower tasks
                        AssignedUserId = t.TaskType == TaskType.Manpower ? t.UserWBSTasks?.FirstOrDefault()?.UserId : null,
                        AssignedUserName = t.TaskType == TaskType.Manpower ? t.UserWBSTasks?.FirstOrDefault()?.User?.Name : null,

                        // For ODC tasks
                        ResourceName = t.TaskType == TaskType.ODC ? t.UserWBSTasks?.FirstOrDefault()?.Name : null,
                        // Map ResourceUnit for both Manpower and ODC tasks
                        ResourceUnit = t.UserWBSTasks?.FirstOrDefault()?.Unit,
                        ResourceRoleId = t.UserWBSTasks?.FirstOrDefault()?.ResourceRole?.Id ?? string.Empty,
                        ResourceRoleName = t.UserWBSTasks?.FirstOrDefault()?.ResourceRole?.Name ?? string.Empty,

                        // Common for both types
                        CostRate = t.UserWBSTasks?.FirstOrDefault()?.CostRate ?? 0,
                        TotalHours = t.UserWBSTasks?.FirstOrDefault()?.TotalHours ?? 0,
                        TotalCost = t.UserWBSTasks?.FirstOrDefault()?.TotalCost ?? 0,
                        PlannedHours = t.PlannedHours?.Select(ph => new PlannedHourDto
                        {
                            Year = int.Parse(ph.Year),
                            Month = ph.Month,
                            PlannedHours = ph.PlannedHours
                        }).ToList() ?? new List<PlannedHourDto>(),
                        DisplayOrder = t.DisplayOrder
                    };
                }).ToList();

            // Create a dictionary for easy lookup
            var taskDict = taskDtos.ToDictionary(t => t.Id);

            // Return all tasks (flat structure since WBSTaskDto doesn't have ChildTasks property)
            // The frontend can build the hierarchy using the ParentId property
            return taskDtos;
        }
    }
}

