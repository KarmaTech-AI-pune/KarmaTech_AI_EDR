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
            var query = _context.SprintWbsPlans
                 .Where(w => w.ProjectId == request.ProjectId)
                 .GroupBy(w => new { w.AssignedUserId, w.AssignedUserName, w.MonthYear })
                 .Select(g => new MonthlyAssigneeProgressDto
                 {
                     AssigneeId = g.Key.AssignedUserId,
                     AssigneeName = g.Key.AssignedUserName ?? string.Empty,
                     Month = g.Key.MonthYear,
                     EstimatedHours = g.Sum(w => w.PlannedHours),
                     ActualHours = g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0,
                     RemainingHours = g.Sum(w => w.PlannedHours) - (g.SelectMany(w => w.SprintTasks).Sum(t => (decimal?)t.ActualHours) ?? 0)
                 });

            return await query.ToListAsync(cancellationToken);
        }
    }
}
