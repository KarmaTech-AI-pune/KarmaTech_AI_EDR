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
    public class GetWBSByProjectIdQueryHandler : IRequestHandler<GetWBSByProjectIdQuery, WBSStructureDto>
    {
        private readonly ProjectManagementContext _context;

        public GetWBSByProjectIdQueryHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<WBSStructureDto> Handle(GetWBSByProjectIdQuery request, CancellationToken cancellationToken)
        {
            // 1. Fetch the main WorkBreakdownStructure and its tasks
            var wbs = await _context.WorkBreakdownStructures
                .AsNoTracking()
                .Where(w => w.ProjectId == request.ProjectId && w.IsActive)
                .Select(w => new
                {
                    w.Id,
                    w.ProjectId,
                    w.CurrentVersion,
                    w.IsActive,
                    w.CreatedAt,
                    w.CreatedBy,
                    Tasks = w.Tasks
                        .Where(t => !t.IsDeleted)
                        .OrderBy(t => t.DisplayOrder)
                        .Select(t => new
                        {
                            t.Id,
                            t.WorkBreakdownStructureId,
                            t.ParentId,
                            t.Level,
                            t.Title,
                            t.Description,
                            t.DisplayOrder,
                            t.EstimatedBudget,
                            t.StartDate,
                            t.EndDate,
                            t.TaskType,
                            t.WBSOptionId
                        })
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (wbs == null)
            {
                return new WBSStructureDto
                {
                    ProjectId = request.ProjectId,
                    Tasks = new List<WBSTaskDto>()
                };
            }

            var taskIds = wbs.Tasks.Select(t => t.Id).ToList();

            // 2. Fetch related data in separate queries
            var userWBSTasks = await _context.UserWBSTasks
                .AsNoTracking()
                .Where(ut => taskIds.Contains(ut.WBSTaskId))
                .Include(ut => ut.User)
                .Include(ut => ut.ResourceRole)
                .ToListAsync(cancellationToken);

            var plannedHours = await _context.WBSTaskPlannedHours
                .AsNoTracking()
                .Where(ph => taskIds.Contains(ph.WBSTaskId))
                .ToListAsync(cancellationToken);

            var wbsOptions = await _context.WBSOptions
                .AsNoTracking()
                .Where(wo => wbs.Tasks.Select(t => t.WBSOptionId).Contains(wo.Id))
                .ToDictionaryAsync(wo => wo.Id, wo => wo.Label, cancellationToken);

            // 3. Manually map the data to DTOs
            var wbsDto = new WBSStructureDto
            {
                Id = wbs.Id,
                ProjectId = wbs.ProjectId,
                Version = wbs.CurrentVersion,
                IsActive = wbs.IsActive,
                CreatedAt = wbs.CreatedAt,
                CreatedBy = wbs.CreatedBy,
                Tasks = wbs.Tasks.Select(t =>
                {
                    var taskUserWBSTasks = userWBSTasks.Where(ut => ut.WBSTaskId == t.Id).ToList();
                    var taskPlannedHours = plannedHours.Where(ph => ph.WBSTaskId == t.Id).ToList();
                    wbsOptions.TryGetValue(t.WBSOptionId ?? 0, out var wbsOptionLabel); // Handle null WBSOptionId

                    var firstUserWBSTask = taskUserWBSTasks.FirstOrDefault();

                    double totalPlannedHours = taskPlannedHours.Sum(ph => ph.PlannedHours);
                    decimal calculatedTotalCost = 0;
                    double finalTotalHours = 0;

                    if (t.TaskType == TaskType.ODC && firstUserWBSTask != null)
                    {
                        finalTotalHours = firstUserWBSTask.TotalHours;
                        calculatedTotalCost = firstUserWBSTask.TotalCost;
                    }
                    else
                    {
                        finalTotalHours = totalPlannedHours;
                        calculatedTotalCost = (decimal)totalPlannedHours * (firstUserWBSTask?.CostRate ?? 0);
                    }

                    return new WBSTaskDto
                    {
                        Id = t.Id,
                        WorkBreakdownStructureId = t.WorkBreakdownStructureId,
                        ParentId = t.ParentId,
                        Level = t.Level,
                        Title = wbsOptionLabel ?? t.Title, // Use WBSOptionLabel if available, otherwise use Title
                        Description = t.Description,
                        DisplayOrder = t.DisplayOrder,
                        EstimatedBudget = t.EstimatedBudget,
                        StartDate = t.StartDate,
                        EndDate = t.EndDate,
                        TaskType = t.TaskType,
                        WBSOptionId = t.WBSOptionId,
                        WBSOptionLabel = wbsOptionLabel,

                        PlannedHours = taskPlannedHours.Select(ph => new PlannedHourDto
                        {
                            Year = int.Parse(ph.Year),
                            Month = ph.Month,
                            PlannedHours = ph.PlannedHours
                        }).ToList(),

                        CostRate = firstUserWBSTask?.CostRate ?? 0,
                        ResourceUnit = firstUserWBSTask?.Unit,
                        AssignedUserId = t.TaskType == TaskType.Manpower ? firstUserWBSTask?.UserId : null,
                        AssignedUserName = t.TaskType == TaskType.Manpower ? firstUserWBSTask?.User?.Name : null,
                        ResourceName = t.TaskType == TaskType.ODC ? firstUserWBSTask?.Name : null,
                        ResourceRoleId = firstUserWBSTask?.ResourceRoleId,
                        ResourceRoleName = firstUserWBSTask?.ResourceRole?.Name,
                        TotalHours = finalTotalHours,
                        TotalCost = calculatedTotalCost
                    };
                }).ToList()
            };

            return wbsDto;
        }
    }
}


//using MediatR;
//using Microsoft.EntityFrameworkCore;
//using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
//using NJS.Application.Dtos;
//using NJS.Domain.Database;
//using NJS.Domain.Entities;
//// using NJS.Domain.Exceptions; // Removed unused namespace
//using System.Collections.Generic;
//using System.Globalization; // For month names
//using System.Linq;
//using System.Threading;
//using System.Threading.Tasks;
//using NJS.Domain.Enums; // For WBSTaskLevel

//namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
//{
//    // Renaming handler to match the query
//    public class GetWBSByProjectIdQueryHandler : IRequestHandler<GetWBSByProjectIdQuery, WBSStructureDto>
//    {
//        private readonly ProjectManagementContext _context;

//        public GetWBSByProjectIdQueryHandler(ProjectManagementContext context)
//        {
//            _context = context;
//        }

//        public async Task<WBSStructureDto> Handle(GetWBSByProjectIdQuery request, CancellationToken cancellationToken)
//        {

//            var wbs = await _context.WorkBreakdownStructures
//                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
//                    .ThenInclude(t => t.UserWBSTasks).ThenInclude(x=>x.User)
//                .Include(w => w.Tasks.Where(t => !t.IsDeleted))
//                    .ThenInclude(t => t.MonthlyHours).AsNoTracking()
//                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

//            //var wbs = await _context.WorkBreakdownStructures
//            //    .Include(w => w.Tasks.Where(x=>x)
//            //        .ThenInclude(t => t.UserWBSTasks)
//            //            .ThenInclude(ut => ut.User) // Include User details for name
//            //    .Include(w => w.Tasks)
//            //        .ThenInclude(t => t.MonthlyHours) // Include monthly hours
//            //    .AsNoTracking() // Use NoTracking for read operations
//            //    .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

//            if (wbs == null)
//            {
//                // Return an empty structure as planned
//                 return new WBSStructureDto { ProjectId = request.ProjectId, Tasks = new List<WBSTaskDto>() };
//            }

//            // Manually map the WBS structure
//            var wbsDto = new WBSStructureDto
//            {
//                Id = wbs.Id,
//                ProjectId = wbs.ProjectId,
//                Version = wbs.Version,
//                IsActive = wbs.IsActive,
//                CreatedAt = wbs.CreatedAt,
//                CreatedBy = wbs.CreatedBy,
//                Tasks = new List<WBSTaskDto>()
//            };

//            // Manually map the tasks
//            foreach (var taskEntity in wbs.Tasks.OrderBy(t => t.DisplayOrder)) // Ensure order
//            {
//                var taskDto = new WBSTaskDto
//                {
//                    Id = taskEntity.Id,
//                    WorkBreakdownStructureId = taskEntity.WorkBreakdownStructureId,
//                    ParentId = taskEntity.ParentId,
//                    Level = taskEntity.Level, // No cast needed now
//                    Title = taskEntity.Title,
//                    Description = taskEntity.Description,
//                    DisplayOrder = taskEntity.DisplayOrder,
//                    EstimatedBudget = taskEntity.EstimatedBudget,
//                    StartDate = taskEntity.StartDate,
//                    EndDate = taskEntity.EndDate,
//                    TaskType = taskEntity.TaskType, // Include TaskType
//                    MonthlyHours = new List<MonthlyHourDto>()
//                    // Initialize resource/cost fields
//                    , CostRate = 0, TotalHours = 0, TotalCost = 0
//                };

//                // Map Monthly Hours
//                double calculatedTotalHours = 0;
//                foreach (var mhEntity in taskEntity.MonthlyHours)
//                {
//                    taskDto.MonthlyHours.Add(new MonthlyHourDto
//                    {
//                        Year = int.Parse(mhEntity.Year), // Assuming Year is stored as string "YYYY"
//                        Month = mhEntity.Month, // Assuming Month is stored as string "January", etc.
//                        PlannedHours = mhEntity.PlannedHours
//                    });
//                    calculatedTotalHours += mhEntity.PlannedHours;
//                }
//                taskDto.TotalHours = calculatedTotalHours;

//                // Map Resource Info (using the first UserWBSTask found, as discussed)
//                var userTaskEntity = taskEntity.UserWBSTasks.FirstOrDefault();
//                if (userTaskEntity != null)
//                {
//                    // For Manpower tasks
//                    if (taskEntity.TaskType == TaskType.Manpower)
//                    {
//                        taskDto.AssignedUserId = userTaskEntity.UserId;
//                        taskDto.AssignedUserName = userTaskEntity.User?.Name; // User should be included
//                        taskDto.CostRate = userTaskEntity.CostRate;
//                        // Map ResourceUnit for Manpower tasks as well
//                        taskDto.ResourceUnit = userTaskEntity.Unit;
//                        // Calculate Total Cost for Manpower
//                        taskDto.TotalCost = (decimal)taskDto.TotalHours * taskDto.CostRate;
//                    }
//                    // For ODC tasks
//                    else if (taskEntity.TaskType == TaskType.ODC)
//                    {
//                        taskDto.ResourceName = userTaskEntity.Name; // Map Name for ODC
//                        taskDto.ResourceUnit = userTaskEntity.Unit; // Map Unit for ODC
//                        taskDto.CostRate = userTaskEntity.CostRate;
//                        // Use the actual values from UserWBSTask for ODC
//                        taskDto.TotalHours = userTaskEntity.TotalHours;
//                        taskDto.TotalCost = userTaskEntity.TotalCost;
//                    }
//                }
//                else
//                {
//                    // If no UserWBSTask, calculate cost based on hours and rate
//                    taskDto.TotalCost = (decimal)taskDto.TotalHours * taskDto.CostRate;
//                }

//                wbsDto.Tasks.Add(taskDto);
//            }

//            return wbsDto;
//        }
//    }
//}
