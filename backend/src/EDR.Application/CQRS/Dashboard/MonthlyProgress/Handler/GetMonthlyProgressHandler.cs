using MediatR;
using EDR.Application.Dtos.Dashboard;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using EDR.Application.CQRS.Dashboard.MonthlyProgress.Query;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace EDR.Application.CQRS.Dashboard.MonthlyProgress.Handler
{
    public class GetMonthlyProgressHandler : IRequestHandler<GetMonthlyProgressQuery, List<MonthlyAssigneeProgressDto>>
    {
        private readonly ProjectManagementContext _context;

        public GetMonthlyProgressHandler(ProjectManagementContext context)
        {
            _context = context;
        }

        public async Task<List<MonthlyAssigneeProgressDto>> Handle(GetMonthlyProgressQuery request, CancellationToken cancellationToken)
        {
            // Step 1: Fetch and aggregate per employee per month
            // Group by AssignedUserId + MonthYear — unique per person per month
            // Even if two employees share the same name, their Guid AssignedUserId will differ
            var results = await _context.SprintWbsPlans
                 .Where(w => w.ProjectId == request.ProjectId)
                 .GroupBy(w => new { w.AssignedUserId, w.AssignedUserName, w.MonthYear, w.RoleId, w.RoleName })
                 .Select(g => new MonthlyAssigneeProgressDto
                 {
                     AssigneeId   = g.Key.AssignedUserId,
                     AssigneeName = g.Key.AssignedUserName ?? string.Empty,
                     RoleId       = g.Key.RoleId,
                     RoleName     = g.Key.RoleName ?? string.Empty,
                     Month        = g.Key.MonthYear,
                     EstimatedHours = g.Sum(w => w.PlannedHours),
                     ActualHours    = g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0,
                     RemainingHours = g.Sum(w => w.PlannedHours) - (g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0),
                     EmployeeLoggedHours = 0 // Will be populated in Step 2
                 })
                 .ToListAsync(cancellationToken);

            if (!results.Any()) return results;

            // Step 2: Fetch Employee Logged Hours from SprintTaskComments
            // For each task, take only the LATEST comment (most recent TotalLoggedHours)
            // Then sum all those latest hours per AssignedUserId + MonthYear
            var projectTaskComments = await _context.SprintTaskComments
                .Where(c => c.SprintTask != null &&
                            c.SprintTask.SprintWbsPlan != null &&
                            c.SprintTask.SprintWbsPlan.ProjectId == request.ProjectId)
                .Select(c => new
                {
                    c.Taskid,
                    c.TotalLoggedHours,
                    c.CreatedDate,
                    c.SprintTask.SprintWbsPlan.AssignedUserId,
                    c.SprintTask.SprintWbsPlan.MonthYear,
                    c.SprintTask.SprintWbsPlan.RoleId
                })
                .ToListAsync(cancellationToken);

            if (projectTaskComments.Any())
            {
                // Per task: keep only the latest comment
                var latestHoursPerTask = projectTaskComments
                    .GroupBy(c => c.Taskid)
                    .Select(tg => tg.OrderByDescending(c => c.CreatedDate).First())
                    .ToList();

                // Aggregate by AssignedUserId + MonthYear + RoleId (same key as Step 1)
                var aggregatedLoggedHours = latestHoursPerTask
                    .GroupBy(x => new { x.AssignedUserId, x.MonthYear, x.RoleId })
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(x => x.TotalLoggedHours ?? 0)
                    );

                // Match and update each result row
                foreach (var result in results)
                {
                    var key = new { AssignedUserId = result.AssigneeId, MonthYear = result.Month, RoleId = result.RoleId };
                    if (aggregatedLoggedHours.TryGetValue(key, out var loggedHours))
                    {
                        result.EmployeeLoggedHours = loggedHours;
                    }
                }
            }

            return results;
        }
    }
}
