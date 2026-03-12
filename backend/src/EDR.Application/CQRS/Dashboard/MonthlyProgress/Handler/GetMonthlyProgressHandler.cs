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
            // Step 1: Fetch the basic stats (Estimated, Actual, Remaining)
            var results = await _context.SprintWbsPlans
                 .Where(w => w.ProjectId == request.ProjectId)
                 .GroupBy(w => new { w.AssignedUserId, w.AssignedUserName, w.MonthYear })
                 .Select(g => new MonthlyAssigneeProgressDto
                 {
                     AssigneeId = g.Key.AssignedUserId,
                     AssigneeName = g.Key.AssignedUserName ?? string.Empty,
                     Month = g.Key.MonthYear,
                     EstimatedHours = g.Sum(w => w.PlannedHours),
                     ActualHours = g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0,
                     RemainingHours = g.Sum(w => w.PlannedHours) - (g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0),
                     EmployeeLoggedHours = 0 // Will be populated in Step 2
                 })
                 .ToListAsync(cancellationToken);

            if (!results.Any()) return results;

            // Step 2: Fetch and aggregate Employee Logged Hours in memory
            // Correlation keys: AssignedUserId, AssignedUserName, MonthYear
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
                    c.SprintTask.SprintWbsPlan.AssignedUserName,
                    c.SprintTask.SprintWbsPlan.MonthYear 
                })
                .ToListAsync(cancellationToken);

            if (projectTaskComments.Any())
            {
                // Group by Taskid, take latest TotalLoggedHours per task
                var latestHoursPerTask = projectTaskComments
                    .GroupBy(c => c.Taskid)
                    .Select(tg => tg.OrderByDescending(c => c.CreatedDate).First())
                    .ToList();

                // Group by Assignee (ID + Name) and Month for summation
                var aggregatedLoggedHours = latestHoursPerTask
                    .GroupBy(x => new { x.AssignedUserId, x.AssignedUserName, x.MonthYear })
                    .ToDictionary(
                        g => g.Key,
                        g => g.Sum(x => x.TotalLoggedHours ?? 0)
                    );

                // Update results
                foreach (var result in results)
                {
                    // Match by the same combination used in Step 1 grouping
                    var key = new 
                    { 
                        AssignedUserId = result.AssigneeId, 
                        AssignedUserName = result.AssigneeName, 
                        MonthYear = result.Month 
                    };

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
