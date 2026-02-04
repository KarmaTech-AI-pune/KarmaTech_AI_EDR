using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using NJS.Application.CQRS.WorkBreakdownStructures.Queries;
using NJS.Application.Dtos;
using NJS.Domain.Database;
using NJS.Domain.Entities;
using NJS.Domain.Enums;

namespace NJS.Application.CQRS.WorkBreakdownStructures.Handlers
{
    /// <summary>
    /// Handler for GetWBSResourceDataQuery
    /// </summary>
    public class GetWBSResourceDataQueryHandler : IRequestHandler<GetWBSResourceDataQuery, WBSResourceDataDto>
    {
        private readonly ProjectManagementContext _context;
        private readonly UserManager<User> _userManager;

        public GetWBSResourceDataQueryHandler(ProjectManagementContext context, UserManager<User> userManager)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        }

        public async Task<WBSResourceDataDto> Handle(GetWBSResourceDataQuery request, CancellationToken cancellationToken)
        {
            // Get the active WBS for the project
            // Get the active WBS for the project
            // Get all active WBS structures for the project
            var wbsList = await _context.WorkBreakdownStructures
                .Include(w => w.WBSHeader) // Eagerly load WBSHeader
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.PlannedHours)
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.UserWBSTasks)
                        .ThenInclude(ut => ut.User)
                .AsNoTracking()
                .Where(w => w.WBSHeader.ProjectId == request.ProjectId && w.WBSHeader.IsActive)
                .ToListAsync(cancellationToken);

            var result = new WBSResourceDataDto
            {
                ProjectId = request.ProjectId,
                ResourceAllocations = new List<WBSResourceAllocationDto>()
            };

            if (wbsList == null || !wbsList.Any())
            {
                return result; // Return empty result if no WBS found
            }

            foreach (var wbs in wbsList)
            {
                // Process each task with user assignments
                // Filter to ONLY Level 3 tasks (Leaf nodes)
                foreach (var task in wbs.Tasks.Where(t => !t.IsDeleted && t.Level == WBSTaskLevel.Level3))
                {
                    // Logic for Manpower tasks: Iterate over UserWBSTasks
                    if (task.TaskType == TaskType.Manpower)
                {
                    foreach (var userTask in task.UserWBSTasks)
                    {
                        string roleId = string.Empty;
                        // Determine RoleId if needed (simplified here)

                        var allocation = new WBSResourceAllocationDto
                        {
                            TaskId = task.Id.ToString(),
                            TaskTitle = task.Title,
                            RoleId = roleId,
                            EmployeeId = userTask.UserId,
                            EmployeeName = userTask.User?.Name ?? "Unknown",
                            Name = "null",
                            IsConsultant = userTask.User?.IsConsultant ?? false,
                            CostRate = userTask.CostRate,
                            TotalHours = (decimal)userTask.TotalHours,
                            TotalCost = userTask.TotalCost,
                            ODC = 0,
                            TaskType = (int)task.TaskType
                        };

                        result.ResourceAllocations.Add(allocation);
                    }
                }
                // Logic for ODC tasks
                else if (task.TaskType == TaskType.ODC)
                {
                    // If there are explicit assignments (e.g., from AddWBSTaskCommandHandler)
                    if (task.UserWBSTasks.Any())
                    {
                        foreach (var userTask in task.UserWBSTasks)
                        {
                            var allocation = new WBSResourceAllocationDto
                            {
                                TaskId = task.Id.ToString(),
                                TaskTitle = task.Title,
                                RoleId = "",
                                EmployeeId = userTask.UserId, // Likely null
                                EmployeeName = "null", // User expects string "null" for ODC
                                Name = userTask.Name ?? "Unknown",
                                IsConsultant = false,
                                CostRate = userTask.CostRate,
                                TotalHours = (decimal)userTask.TotalHours,
                                TotalCost = userTask.TotalCost,
                                ODC = 0, // User expects 0, TotalCost holds the value
                                TaskType = (int)task.TaskType
                            };
                            result.ResourceAllocations.Add(allocation);
                        }
                    }
                    else
                    {
                        // If no explicit assignment, create a synthetic one for the ODC task itself
                        var totalHours = (decimal)task.PlannedHours.Sum(ph => ph.PlannedHours);
                        var totalCost = task.EstimatedBudget;
                        var costRate = totalHours > 0 ? totalCost / totalHours : 0;
                        
                        var allocation = new WBSResourceAllocationDto
                        {
                            TaskId = task.Id.ToString(),
                            TaskTitle = task.Title,
                            RoleId = "",
                            EmployeeId = null,
                            EmployeeName = "null", // User expects string "null" for ODC
                            Name = task.Title,     // Fallback name
                            IsConsultant = false,
                            CostRate = costRate,
                            TotalHours = totalHours,
                            TotalCost = totalCost,
                            ODC = 0, // User expects 0
                            TaskType = (int)task.TaskType
                        };
                        result.ResourceAllocations.Add(allocation);
                    }
                }
            }
            }

            return result;
        }
    }
}
