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
            var wbs = await _context.WorkBreakdownStructures
                .Include(w => w.Tasks)
                    .ThenInclude(t => t.UserWBSTasks)
                        .ThenInclude(ut => ut.User)
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.ProjectId == request.ProjectId && w.IsActive, cancellationToken);

            var result = new WBSResourceDataDto
            {
                ProjectId = request.ProjectId,
                ResourceAllocations = new List<WBSResourceAllocationDto>()
            };

            if (wbs == null)
            {
                return result; // Return empty result if no WBS found
            }

            // Process each task with user assignments
            foreach (var task in wbs.Tasks.Where(t => !t.IsDeleted))
            {
                foreach (var userTask in task.UserWBSTasks)
                {
                    // Get the user's first role (if any)
                    string roleId = string.Empty;
                    if (userTask.User != null)
                    {
                        // We'll use an empty string as default if no roles are found
                        // In a real application, you might want to handle this differently
                        roleId = string.Empty;
                    }

                    var allocation = new WBSResourceAllocationDto
                    {
                        TaskId = task.Id.ToString(),
                        TaskTitle = task.Title,
                        RoleId = roleId, // Use the role ID we determined above
                        EmployeeId = userTask.UserId,
                        EmployeeName = userTask.User?.Name ?? "Unknown",
                        IsConsultant = userTask.User?.IsConsultant ?? false,
                        CostRate = userTask.CostRate,
                        TotalHours = (decimal)userTask.TotalHours,
                        TotalCost = userTask.TotalCost,
                        ODC = 0
                    };

                    result.ResourceAllocations.Add(allocation);
                }
            }

            return result;
        }
    }
}
