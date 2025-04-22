using MediatR;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
// using NJS.Domain.Exceptions; // Removed unused namespace
using System.Collections.Generic;
using System.Globalization; // For month names
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NJS.Domain.Enums; // For WBSTaskLevel

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    // Renaming handler to match the query
    public class GetWBSByProjectIdQueryHandler : IRequestHandler<GetWBSByProjectIdQuery, WBSStructureDto>
    {
        private readonly ProjectManagementContext _context;

        public GetWBSByProjectIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<WBSStructureDto> Handle(GetWBSByProjectIdQuery request, CancellationToken cancellationToken)
        {
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.UserWBSTasks)
                        .ThenInclude(ut => ut.User) // Include User details for name
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.MonthlyHours) // Include monthly hours
                .AsNoTracking() // Use NoTracking for read operations
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

            if (wbs == null)
            {
                // Return an empty structure as planned
                 return new WBSStructureDto { ProjectId = request.ProjectId, Tasks = new List<WBSTaskDto>() };
            }

            // Manually map the WBS structure
            var wbsDto = new WBSStructureDto
            {
                Id = wbs.Id,
                ProjectId = wbs.ProjectId,
                Version = wbs.Version,
                IsActive = wbs.IsActive,
                CreatedAt = wbs.CreatedAt,
                CreatedBy = wbs.CreatedBy,
                Tasks = new List<WBSTaskDto>()
            };

            // Manually map the tasks
            foreach (var taskEntity in wbs.Tasks.OrderBy(t => t.DisplayOrder)) // Ensure order
            {
                var taskDto = new WBSTaskDto
                {
                    Id = taskEntity.Id,
                    WorkBreakdownStructureId = taskEntity.WorkBreakdownStructureId,
                    ParentId = taskEntity.ParentId,
                    Level = taskEntity.Level, // No cast needed now
                    Title = taskEntity.Title,
                    Description = taskEntity.Description,
                    DisplayOrder = taskEntity.DisplayOrder,
                    EstimatedBudget = taskEntity.EstimatedBudget,
                    StartDate = taskEntity.StartDate,
                    EndDate = taskEntity.EndDate,
                    MonthlyHours = new List<MonthlyHourDto>()
                    // Initialize resource/cost fields
                    , CostRate = 0, ODCCost = 0, TotalHours = 0, TotalCost = 0
                };

                // Map Monthly Hours
                double calculatedTotalHours = 0;
                foreach (var mhEntity in taskEntity.MonthlyHours)
                {
                    taskDto.MonthlyHours.Add(new MonthlyHourDto
                    {
                        Year = int.Parse(mhEntity.Year), // Assuming Year is stored as string "YYYY"
                        Month = mhEntity.Month, // Assuming Month is stored as string "January", etc.
                        PlannedHours = mhEntity.PlannedHours
                    });
                    calculatedTotalHours += mhEntity.PlannedHours;
                }
                taskDto.TotalHours = calculatedTotalHours;

                // Map Resource Info (using the first UserWBSTask found, as discussed)
                var userTaskEntity = taskEntity.UserWBSTasks.FirstOrDefault();
                if (userTaskEntity != null)
                {
                    taskDto.AssignedUserId = userTaskEntity.UserId;
                    taskDto.AssignedUserName = userTaskEntity.User?.Name; // User should be included
                    taskDto.CostRate = userTaskEntity.CostRate;
                    taskDto.ODCCost = userTaskEntity.ODCCost;
                }

                // Calculate Total Cost
                taskDto.TotalCost = (decimal)taskDto.TotalHours * taskDto.CostRate + taskDto.ODCCost;

                wbsDto.Tasks.Add(taskDto);
            }

            return wbsDto;
        }
    }
}
